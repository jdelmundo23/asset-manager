import { getPool } from "../../sql";
import express, { RequestHandler, Request } from "express";
import sql from "mssql";

interface TableRequest extends Request {
  tableName?: string;
  body: {
    name?: string;
    oldName?: string;
    type?: string;
  };
}

const validTables: { [key: string]: string } = {
  departments: "departments",
  locations: "locations",
  assetmodels: "assetmodels",
  assettypes: "assettypes",
};

const getTypeID = async (typeName: string): Promise<number | undefined> => {
  try {
    const pool = await getPool();

    const modelID = await pool
      .request()
      .input("name", sql.VarChar(50), typeName)
      .query(`SELECT id FROM AssetTypes WHERE name = @name`);
    return modelID.recordset[0].id;
  } catch (err) {
    console.error(err);
    return undefined;
  }
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
    return next();
  }

  const { name, oldName } = req.body;

  try {
    const pool = await getPool();

    const existingPreset = await pool
      .request()
      .input("name", sql.VarChar(255), name)
      .query(
        `SELECT COUNT(*) AS count FROM ${req.tableName} WHERE name = @name`
      );

    if (existingPreset.recordset[0].count > 0 && name !== oldName) {
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
    const result = await pool.request().query(`SELECT * FROM ${req.tableName}`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve preset data" });
  }
});

router.post("/:tableName", async function (req: TableRequest, res) {
  const { name, type } = req.body;

  let typeID;
  if (req.tableName === "assetmodels") {
    if (!type) {
      res.status(400).json({ error: "Asset type is required" });
      return;
    } else {
      typeID = await getTypeID(type);
    }
  }

  if (!name) {
    res.status(400).json({ error: "Preset name is required" });
    return;
  }

  try {
    const pool = await getPool();

    if (req.tableName === "assetmodels") {
      const query = `INSERT INTO ${req.tableName} (name, typeID) VALUES (@name, @typeID)`;
      await pool
        .request()
        .input("name", sql.VarChar(255), name)
        .input("typeID", sql.Int, typeID)
        .query(query);
    } else {
      const query = `INSERT INTO ${req.tableName} (name) VALUES (@name)`;
      await pool.request().input("name", sql.VarChar(50), name).query(query);
    }

    res.status(201).json({ message: "Preset added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add preset" });
  }
});

router.put("/:tableName", async function (req: TableRequest, res) {
  const { name, type, oldName } = req.body;

  let typeID;
  if (req.tableName === "assetmodels") {
    if (!type) {
      res.status(400).json({ error: "Asset type is required" });
      return;
    } else {
      typeID = await getTypeID(type);
    }
  }

  if (!name || !oldName) {
    res
      .status(400)
      .json({ error: "Old preset name and new preset name is required" });
    return;
  }

  try {
    const pool = await getPool();

    if (req.tableName === "assetmodels") {
      const query = `UPDATE ${req.tableName} SET name = @name, typeID = @typeID WHERE name = @oldName`;
      await pool
        .request()
        .input("name", sql.VarChar(255), name)
        .input("typeID", sql.Int, typeID)
        .input("oldName", sql.VarChar(255), oldName)
        .query(query);
    } else {
      const query = `UPDATE ${req.tableName} SET name = @name WHERE name = @oldName`;
      await pool
        .request()
        .input("name", sql.VarChar(50), name)
        .input("oldName", sql.VarChar(50), oldName)
        .query(query);
    }

    res.status(200).json({ message: "Preset updated successfully" });
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
    await pool.request().input("name", sql.VarChar(255), name).query(query);
    res.status(200).json({ message: "Preset deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete preset" });
  }
});

export default router;
