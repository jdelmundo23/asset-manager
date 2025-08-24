import express from "express";
import axios from "axios";
import { GRAPH_ENDPOINT } from "../../authConfig";
import { User, Group } from "@microsoft/microsoft-graph-types";
import { mockUserData } from "../../../tests/mockdata/mockusers";
import { getPool } from "./../../sql";
import sql from "mssql";
import { assetSummarySchema, userSchema } from "@shared/schemas";
import z from "zod";
const devMode = process.env.DEV_MODE === "true";

const router = express.Router();

const group_id = process.env.ENTRA_USER_GROUP_ID;

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request().query("SELECT * FROM Users");

    const parse = z.array(userSchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve user data" });
  }
});

router.get("/group-name", async function (req, res) {
  if (devMode) {
    res.json({ groupName: "Mock Group" });
    return;
  }

  const options = {
    headers: {
      Authorization: `Bearer ${req.session.accessToken}`,
    },
  };

  try {
    const response = await axios.get(
      `${GRAPH_ENDPOINT}groups/${group_id}`,
      options
    );
    const data: Group = await response.data;
    res.json({ groupName: data.displayName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve group name" });
  }
});

router.get("/:userID/assets", async function (req, res) {
  const { userID } = req.params;

  if (!userID) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userID", sql.UniqueIdentifier, userID).query(`
        SELECT 
          Assets.ID,
          Assets.name,
          Assets.identifier,
          AssetTypes.name AS typeName,
          AssetModels.name AS modelName,
          Locations.name AS locationName
        FROM Assets
        LEFT JOIN Locations ON Assets.locationID = Locations.ID
        LEFT JOIN AssetModels ON Assets.modelID = AssetModels.ID
        LEFT JOIN AssetTypes on AssetModels.typeID = AssetTypes.ID
        WHERE Assets.assignedTo = @userID`);

    if (result.recordset.length < 1) {
      res.json([]);
      return;
    }

    const parse = z.array(assetSummarySchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve user assets" });
  }
});

router.post("/sync-users", async function (req, res) {
  if (devMode) {
    res.status(200).json({ message: "Sync skipped in dev mode" });
    return;
  }

  const options = {
    headers: {
      Authorization: `Bearer ${req.session.accessToken}`,
    },
  };

  const syncTime = new Date().toISOString();

  try {
    const response = await axios.get(
      `${GRAPH_ENDPOINT}groups/${group_id}/members`,
      options
    );
    const users: User[] = await response.data.value;

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);

      await request.query(`TRUNCATE TABLE StagingUsers;`);

      const tempTable = new sql.Table("StagingUsers");
      tempTable.columns.add("ID", sql.UniqueIdentifier, { nullable: false });
      tempTable.columns.add("name", sql.VarChar(255), { nullable: false });
      tempTable.columns.add("last_sync", sql.DateTime2, { nullable: false });
      tempTable.columns.add("active", sql.Bit, { nullable: false });

      users.forEach((user) => {
        tempTable.rows.add(user.id, user.displayName, syncTime, true);
      });

      const bulkRequest = new sql.Request(transaction);
      await bulkRequest.bulk(tempTable);

      await request.query(`
        MERGE INTO Users AS target
        USING StagingUsers AS source
        ON target.ID = source.ID
        WHEN MATCHED THEN
          UPDATE SET
            name = source.name,
            last_sync = source.last_sync,
            active = 1
        WHEN NOT MATCHED THEN
          INSERT (ID, name, last_sync, active)
          VALUES (source.ID, source.name, source.last_sync, 1);

        UPDATE Users
        SET active = 0
        WHERE ID NOT IN (SELECT ID FROM StagingUsers);
      `);

      await transaction.commit();
      res.status(200).json({ message: "Users synced successfully" });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ error: "Failed to sync users" });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve users externally" });
  }
});

router.delete("/:userID", async function (req, res) {
  const { userID } = req.params;

  if (!userID) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("ID", sql.UniqueIdentifier, userID)
      .query(`SELECT active FROM Users WHERE ID = @ID`);

    if (result.recordset.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = result.recordset[0];
    if (user.active) {
      res.status(400).json({ error: "Cannot delete an active user" });
      return;
    }

    await pool
      .request()
      .input("ID", sql.UniqueIdentifier, userID)
      .query(`DELETE FROM Users WHERE ID = @ID`);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
