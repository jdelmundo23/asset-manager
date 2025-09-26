import {
  Preset,
  presetRowSchema,
  presetSchema,
  presetTableSchema,
} from "@shared/schemas";
import { getPool } from "@server/src/sql";
import express, { RequestHandler, Request } from "express";
import sql from "mssql";
import z from "zod";
import { parseInputReq, recordExists } from "@server/src/utils";

interface TableRequest extends Request {
  tableName?: string;
}

const inputDefinitions = [
  { name: "ID", type: sql.Int },
  { name: "name", type: sql.VarChar(50) },
  { name: "typeID", type: sql.Int },
] as const;

const inputs = (preset: Partial<Preset> = {}) =>
  inputDefinitions.map((def) => ({
    ...def,
    value: preset[def.name as keyof Preset],
  }));

const appendInputs = (
  request: sql.Request,
  preset: Preset,
  exclusions: string[] = []
) => {
  for (const input of inputs(preset)) {
    if (!exclusions.includes(input.name)) {
      request.input(input.name, input.type, input.value);
    }
  }
  return request;
};

const validateTable: RequestHandler = (req: TableRequest, res, next) => {
  const { tableName } = req.params;
  const parse = presetTableSchema.safeParse(tableName.trim().toLowerCase());
  if (parse.error) {
    console.error("Invalid table name:" + tableName);
    res.status(400).json({ error: "Invalid table name" });
    return;
  }

  req.tableName = parse.data;
  next();
};

const router = express.Router();

router.use("/:tableName", validateTable);

router.get("/:tableName", async function (req, res) {
  const { tableName } = req.params;

  try {
    const pool = await getPool();

    const query =
      tableName === "assetmodels"
        ? `SELECT 
            AssetModels.*, 
            AssetTypes.name AS typeName 
           FROM AssetModels 
           LEFT JOIN AssetTypes ON AssetModels.typeID = AssetTypes.ID`
        : `SELECT * FROM ${tableName}`;
    const result = await pool.request().query(query);

    const parse = z.array(presetRowSchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve preset data" });
  }
});

router.post("/:tableName", async function (req, res) {
  const { tableName } = req.params;
  const isModels = tableName === "assetmodels";

  const preset = parseInputReq(presetSchema, req.body);
  if (!preset) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  if (isModels && !preset.typeID) {
    res.status(400).json({ error: "Missing Type ID" });
    return;
  }

  try {
    const pool = await getPool();

    const check = await recordExists(pool, tableName, { name: preset.name });
    if (check.error) {
      res.status(500).json({ error: "Failed to check if preset exists" });
      return;
    }
    if (check.exists) {
      res.status(400).json({ error: "Preset already exists" });
      return;
    }

    const appendedRequest = isModels
      ? appendInputs(pool.request(), preset)
      : appendInputs(pool.request(), preset, ["typeID"]);

    await appendedRequest.query(`INSERT INTO ${tableName} (
      name
      ${isModels ? ",typeID" : ""}
    )
      VALUES (
      @name
      ${isModels ? ",@typeID" : ""})`);
    res.status(200).json({ message: "Data inserted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
  }
});

router.put("/:tableName", async function (req, res) {
  const { tableName } = req.params;
  const isModels = tableName === "assetmodels";

  const preset = parseInputReq(presetRowSchema, req.body);
  if (!preset) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  if (isModels && !preset.typeID) {
    res.status(400).json({ error: "Missing Type ID" });
    return;
  }

  try {
    const pool = await getPool();

    const check = await recordExists(pool, tableName, { name: preset.name });
    if (check.error) {
      res.status(500).json({ error: "Failed to check if preset exists" });
      return;
    }
    if (check.exists) {
      res.status(400).json({ error: "Preset already exists" });
      return;
    }

    const appendedRequest = isModels
      ? appendInputs(pool.request(), preset)
      : appendInputs(pool.request(), preset, ["typeID"]);

    await appendedRequest.query(`UPDATE ${tableName}
        SET
          name = @name
          ${isModels ? ",typeID = @typeID" : ""}
        WHERE ID = @ID`);
    res.status(200).json({ message: "Data updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update data" });
  }
});

router.delete("/:tableName/:presetID", async function (req, res) {
  const { tableName, presetID } = req.params;

  if (!presetID) {
    res.status(400).json({ error: "Preset ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ID", sql.Int, presetID)
      .query(`DELETE FROM ${tableName} WHERE ID = @ID`);
    res.status(200).json({ message: "Preset deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete preset" });
  }
});

export default router;
