import express, { RequestHandler } from "express";
import { getPool } from "../../../sql";
import sql from "mssql";
import { IP, ipSchema } from "@shared/schemas";
import { z } from "zod";

const inputs = (ip: IP) => [
  { name: "ID", type: sql.Int, value: ip.ID },
  { name: "ipAddress", type: sql.VarChar(15), value: ip.ipAddress },
  { name: "name", type: sql.VarChar(100), value: ip.name },
  { name: "macAddress", type: sql.VarChar(24), value: ip.macAddress },
  { name: "assetID", type: sql.Int, value: ip.assetID },
];

const appendInputs = (
  request: sql.Request,
  ip: IP,
  exclusions: string[] = []
) => {
  for (const input of inputs(ip)) {
    if (!exclusions.includes(input.name)) {
      request.input(input.name, input.type, input.value);
    }
  }
  return request;
};

const checkExistingIP: RequestHandler = async (req, res, next) => {
  if (req.method !== "POST" && req.method !== "PUT") {
    return next();
  }

  const parse = ipSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ error: parse.error.format() });
    return;
  }

  const ip: IP = parse.data;

  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("ipAddress", sql.VarChar(15), ip.ipAddress).query(`
      SELECT ID from ipAddresses WHERE ipAddress = @ipAddress
`);

    if (result.recordset[0]?.ID && result.recordset[0]?.ID !== ip.ID) {
      res.status(400).json({ error: "IP already exists" });
      return;
    }
    req.body = parse.data;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check if IP exists" });
  }
};

const router = express.Router();

router.use(checkExistingIP);

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
  const ip: IP = req.body;

  try {
    const pool = await getPool();

    const appendedRequest = appendInputs(pool.request(), ip);
    await appendedRequest.query(`
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

router.put("/", async function (req, res) {
  const ip: IP = req.body;

  if (!ip.ID) {
    res.status(400).json({ error: "Missing ID of IP to edit" });
    return;
  }

  try {
    const pool = await getPool();

    const appendedRequest = appendInputs(pool.request(), ip);
    await appendedRequest.query(`
    UPDATE IpAddresses
    SET 
      ipAddress = @ipAddress,
      name = @name,
      macAddress = @macAddress,
      assetID = @assetID
    WHERE ID = @ID
  `);

    res.status(200).json({ message: "Data edited successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit data" });
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
    await pool
      .request()
      .input("ID", sql.Int, ipID)
      .query(`DELETE FROM IPAddresses WHERE ID = @ID`);
    res.status(200).json({ message: "IP deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete IP" });
  }
});

export default router;
