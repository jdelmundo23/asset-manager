import { getPool } from "../../sql";
import express from "express";

const validTabs: { [key: string]: string } = {
  departments: "departments",
  locations: "locations",
  assetmodels: "assetmodels",
  assettypes: "assettypes",
};

const router = express.Router();

router.get("/:tab", async function (req, res) {
  const { tab } = req.params;

  const tableName = validTabs[tab.toLowerCase()];

  if (!tableName) {
    res.status(400).json({ error: "Invalid table name" });
    return;
  }
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT name FROM ${tableName}`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve preset data: " + err });
  }
});

export default router;
