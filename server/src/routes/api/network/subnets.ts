import { subnetSchema } from "@shared/schemas";
import express from "express";
import { getPool } from "../../../sql";
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

export default router;
