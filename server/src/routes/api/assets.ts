import express from "express";
import { getPool } from "../../sql";
const router = express.Router();

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM Assets`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve asset data" });
  }
});

export default router;
