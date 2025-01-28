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
    res.status(400).json({ error: "Invalid table name: " + tab });
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

router.post("/:tab", async function (req, res) {
  const { tab } = req.params;

  const { name } = req.body;

  const tableName = validTabs[tab.toLowerCase()];
  if (!tableName) {
    res.status(400).json({ error: "Invalid table name: " + tab });
    return;
  }
  try {
    const pool = await getPool();

    const query = `INSERT INTO ${tableName} (name) VALUES (@name)`;
    await pool.request().input("name", name).query(query);

    res.status(201).json({ message: "Preset added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add preset" });
  }
});

export default router;
