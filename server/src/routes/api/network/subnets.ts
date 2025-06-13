import { subnetSchema } from "@shared/schemas";
import express from "express";
import { getPool } from "../../../sql";
import sql from "mssql";
import { z } from "zod";
import { parseInputReq, recordExists } from "../../../utils";
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
      .input("locationID", sql.Int, subnet.locationID)
      .query(
        `
        INSERT INTO Subnets (subnetPrefix, locationID) 
        OUTPUT INSERTED.*
        VALUES (@subnetPrefix, @locationID)`
      );

    const insertedRow = result.recordset[0];

    res
      .status(200)
      .json({ message: "Data inserted successfully!", ...insertedRow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
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
