import express from "express";
import { getPool } from "../../sql";
import { ipSchema } from "@shared/schemas";
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

export default router;
