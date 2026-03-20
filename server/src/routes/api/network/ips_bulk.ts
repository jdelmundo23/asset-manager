import express from "express";
import { getPool } from "@server/src/sql";
import sql from "mssql";
import { parseInputReq, recordExists } from "@server/src/utils";
import { bulkIpInsertSchema } from "@shared/schemas";
const router = express.Router();

router.post("/add", async function (req, res) {
  const { newIps } = req.body;

  const ips = parseInputReq(bulkIpInsertSchema, newIps);

  if (!ips || ips.length === 0) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const subnetID = ips[0]?.subnetID;

  if (!ips.every((ip) => ip.subnetID === subnetID)) {
    res.status(400).json({
      error: "All IPs must belong to the same subnet",
    });
    return;
  }

  try {
    const pool = await getPool();

    const checkSubnet = await recordExists(pool, "Subnets", {
      ID: subnetID,
    });

    if (!checkSubnet.exists) {
      res.status(400).json({
        error: "Provided subnet does not exist",
      });
      return;
    }

    const existing = await pool.request().input("subnetID", subnetID).query(`
    SELECT hostNumber
    FROM IPAddresses
    WHERE subnetID = @subnetID
  `);

    const existingSet = new Set(existing.recordset.map((x) => x.hostNumber));

    const toInsert = [];
    const skipped = [];

    for (const ip of ips) {
      if (existingSet.has(ip.hostNumber)) {
        skipped.push(ip);
      } else {
        toInsert.push(ip);
      }
    }

    for (const ip of toInsert) {
      await pool
        .request()
        .input("hostNumber", ip.hostNumber)
        .input("name", ip.name)
        .input("macAddress", ip.macAddress)
        .input("assetID", ip.assetID)
        .input("note", ip.note)
        .input("subnetID", ip.subnetID).query(`
      INSERT INTO IPAddresses (
        hostNumber, name, macAddress, assetID, note, subnetID
      )
      VALUES (
        @hostNumber, @name, @macAddress, @assetID, @note, @subnetID
      )
    `);
    }

    res.status(200).json({
      inserted: toInsert.length,
      skipped: skipped.length,
      skippedRows: skipped,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add IPs" });
  }
});

router.post("/delete", async function (req, res) {
  const { ids } = req.body;

  if (ids.length < 1 || !ids) {
    res.status(400).json({ error: "No IDs provided" });
    return;
  }
  try {
    const pool = await getPool();

    const request = pool.request();
    const placeholders: string = ids
      .map((_: string, i: number) => `@id${i}`)
      .join(", ");

    ids.forEach((id: string, i: number) => {
      request.input(`id${i}`, sql.Int, id);
    });
    const query = `
      DELETE FROM IPAddresses
      WHERE ID IN (${placeholders})
    `;
    await request.query(query);

    res.json({ message: "Assets deleted successfully", deleted: ids.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete assets" });
  }
});

export default router;
