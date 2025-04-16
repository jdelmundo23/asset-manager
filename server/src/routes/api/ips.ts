import express from "express";
import { getPool } from "../../sql";
import sql from "mssql";
import { IP, ipSchema } from "@shared/schemas";
import { z } from "zod";

const router = express.Router();

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT IpAddresses.*, Assets.name AS assetName FROM IpAddresses LEFT JOIN Assets ON IpAddresses.assetID = Assets.ID`
      );

    const parse = z.array(ipSchema).safeParse(result.recordset);

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
  const result = ipSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.format() });
    return;
  }

  const ip: IP = result.data;
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ipAddress", sql.VarChar(15), ip.ipAddress)
      .input("name", sql.VarChar(100), ip.name)
      .input("macAddress", sql.VarChar(24), ip.macAddress)
      .input("assetID", sql.Int, ip.assetID).query(`
    INSERT INTO IPAddresses (
      ipAddress,
      name,
      macAddress,
      assetID
    )
    VALUES (
      @ipAddress,
      @name,
      @macAddress,
      @assetID
    )
  `);
    res.status(200).json({ message: "Data inserted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
  }
});

router.delete("/:ipID", async function (req, res) {
  const { ipID } = req.params;

  if (!ipID) {
    res.status(400).json({ error: "Asset ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    const query = `DELETE FROM IPAddresses WHERE ID = @ID`;
    await pool.request().input("ID", sql.Int, ipID).query(query);
    res.status(200).json({ message: "IP deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete IP" });
  }
});

router.get("/check", async (req, res) => {
  const parse = z.string().ip().safeParse(req.query.ip);

  if (!parse.success) {
    res.status(400).json({ error: "Failed to parse IP" });
    return;
  }

  const ipAddress = parse.data;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("ipAddress", sql.VarChar(15), ipAddress).query(`
      IF EXISTS (
    SELECT 1 FROM IpAddresses WHERE ipAddress = @ipAddress
)
    SELECT 1 AS ExistsFlag;
ELSE
    SELECT 0 AS ExistsFlag;
`);
    res.send(result.recordset[0].ExistsFlag === 1);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check existence" });
  }
});

export default router;
