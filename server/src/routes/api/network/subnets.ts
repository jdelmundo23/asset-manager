import { subnetSchema } from "@shared/schemas";
import express from "express";
import { getPool, recordExists } from "../../../sql";
import sql from "mssql";
import { z } from "zod";
const router = express.Router();

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM Subnets`);

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
  const parse = subnetSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ error: parse.error.format() });
    return;
  }

  const subnet = parse.data;

  try {
    const pool = await getPool();

    const exists = await recordExists(pool, "Subnets", {
      subnetPrefix: subnet.subnetPrefix,
    });

    if (exists) {
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

export default router;
