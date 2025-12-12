import { subnetRowSchema, subnetSchema } from "@shared/schemas";
import express from "express";
import { getPool } from "@server/src/sql";
import sql from "mssql";
import { z } from "zod";
import { parseInputReq, recordExists } from "@server/src/utils";
const router = express.Router();

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT Subnets.*, Locations.name as locationName FROM Subnets 
      LEFT JOIN Locations ON Subnets.locationID = Locations.ID;`
    );

    const parse = z.array(subnetSchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve ip data:" + err });
  }
});

router.post("/", async function (req, res) {
  const subnet = parseInputReq(subnetSchema, req.body);
  if (!subnet) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const pool = await getPool();

    const check = await recordExists(pool, "Subnets", {
      subnetPrefix: subnet.subnetPrefix,
    });
    if (check.error) {
      res.status(500).json({ error: "Failed to check if subnet exists" });
      return;
    }
    if (check.exists) {
      res.status(400).json({ error: "Subnet already exists" });
      return;
    }

    const result = await pool
      .request()
      .input("subnetPrefix", sql.VarChar(11), subnet.subnetPrefix)
      .input("locationID", sql.Int, subnet.locationID).query(`
          DECLARE @InsertedSubnets TABLE (
              ID INT,
              subnetPrefix VARCHAR(50),
              locationID INT
          );

          INSERT INTO Subnets (subnetPrefix, locationID)
          OUTPUT 
              INSERTED.ID,
              INSERTED.subnetPrefix,
              INSERTED.locationID
          INTO @InsertedSubnets
          VALUES (@subnetPrefix, @locationID);

          SELECT * FROM @InsertedSubnets;
        `);

    const insertedRow = result.recordset[0];

    res
      .status(200)
      .json({ message: "Data inserted successfully!", ...insertedRow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
  }
});

router.put("/", async function (req, res) {
  const subnet = parseInputReq(subnetRowSchema, req.body);
  if (!subnet) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("ID", sql.Int, subnet.ID)
      .input("locationID", sql.Int, subnet.locationID).query(`
          DECLARE @UpdatedSubnets TABLE (
              ID INT,
              subnetPrefix VARCHAR(50),
              locationID INT
          );

          UPDATE Subnets
          SET 
              locationID = @locationID
          OUTPUT 
              INSERTED.ID,
              INSERTED.subnetPrefix,
              INSERTED.locationID
          INTO @UpdatedSubnets
          WHERE ID = @ID;

          SELECT * FROM @UpdatedSubnets;
        `);

    const updatedRow = result.recordset[0];

    res
      .status(200)
      .json({ message: "Data updated successfully!", ...updatedRow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update data" });
  }
});

router.delete("/:subnetID", async function (req, res) {
  const { subnetID } = req.params;

  if (!subnetID) {
    res.status(400).json({ error: "Subnet ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ID", sql.Int, subnetID)
      .query(`DELETE FROM Subnets WHERE ID = @ID`);

    res.status(200).json({ message: "Subnet deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete subnet" });
  }
});

export default router;
