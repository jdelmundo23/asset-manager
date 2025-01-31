import { getPool } from "../../sql";
import express, { RequestHandler, Request } from "express";

interface TableRequest extends Request {
  tableName?: string;
  body: {
    name?: string;
    oldName?: string;
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
  const sanitizedTable = validTables[tableName.toLowerCase()];
  if (!sanitizedTable) {
    console.error("Invalid table name:" + tableName);
    res.status(400).json({ error: "Invalid table name" });
    return;
  }

  req.tableName = sanitizedTable;
  next();
};

const checkExistingPreset: RequestHandler = async (
  req: TableRequest,
  res,
  next
) => {
  if (!req.body) {
    next();
  }

  const { name } = req.body;

  try {
    const pool = await getPool();

    const existingPreset = await pool
      .request()
      .input("name", name)
      .query(
        `SELECT COUNT(*) AS count FROM ${req.tableName} WHERE name = @name`
      );

    if (existingPreset.recordset[0].count > 0) {
      res.status(400).json({ error: "Preset already exists" });
      return;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retreive existing presets" });
  }
};

const router = express.Router();

router.use("/:tableName", validateTable);
router.use("/:tableName", checkExistingPreset);

router.get("/:tableName", async function (req: TableRequest, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`SELECT name FROM ${req.tableName}`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve preset data" });
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
    res.status(500).json({ error: "Failed to add preset" });
  }
});

router.put("/:tableName", async function (req: TableRequest, res) {
  const { name, oldName } = req.body;

  if (!name || !oldName) {
    res
      .status(400)
      .json({ error: "Old preset name and new preset name is required" });
    return;
  }

  try {
    const pool = await getPool();

    const query = `UPDATE ${req.tableName} SET name = @name WHERE name = @oldName`;
    await pool
      .request()
      .input("name", name)
      .input("oldName", oldName)
      .query(query);

    res.status(20).json({ message: "Preset updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update preset" });
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
    res.status(500).json({ error: "Failed to delete preset" });
  }
});

export default router;
