import { getPool } from "../../sql";
import express, { RequestHandler, Request } from "express";

interface TableRequest extends Request {
  tableName?: string;
  body: {
    name?: string;
  };
}

const validTables: { [key: string]: string } = {
  departments: "departments",
  locations: "locations",
  assetmodels: "assetmodels",
  assettypes: "assettypes",
};

const validateTable: RequestHandler = (req: TableRequest, res, next) => {
  const { tableName } = req.params;
  const validTable = validTables[tableName.toLowerCase()];
  if (!validTable) {
    res.status(400).json({ error: "Invalid table name: " + tableName });
    return;
  }

  req.tableName = validTable;
  next();
};

const router = express.Router();

router.use("/:tableName", validateTable);

router.get("/:tableName", async function (req: TableRequest, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`SELECT name FROM ${req.tableName}`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve preset data: " + err });
  }
});

router.post("/:tableName", async function (req: TableRequest, res) {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Preset name is required" });
    return;
  }

  try {
    const pool = await getPool();

    const query = `INSERT INTO ${req.tableName} (name) VALUES (@name)`;
    await pool.request().input("name", name).query(query);

    res.status(201).json({ message: "Preset added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add preset: " + err });
  }
});

router.delete("/:tableName/:name", async function (req: TableRequest, res) {
  const { name } = req.params;

  if (!name) {
    res.status(400).json({ error: "Preset name is required" });
    return;
  }

  try {
    const pool = await getPool();
    const query = `DELETE FROM ${req.tableName} WHERE name = @name`;
    await pool.request().input("name", name).query(query);
    res.status(200).json({ message: "Preset deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete preset: " + err });
  }
});

export default router;
