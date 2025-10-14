import {
  AssetImport,
  assetImportSchema,
  missingPresetsSchema,
  SkippedRow,
} from "@shared/schemas";
import express from "express";
import { getPool } from "@server/src/sql";
import {
  addAssets,
  addGenericRows,
  addModelRows,
  detectMissingRows,
  getModelsToAdd,
} from "@server/src/importUtils";
import z from "zod";
import sql from "mssql";
import { parseInputReq } from "@server/src/utils";

const router = express.Router();

router.post("/check", async function (req, res) {
  const assets = parseInputReq(z.array(assetImportSchema), req.body);

  if (!assets) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const pool = await getPool();

    const modelsMap = await detectMissingRows(
      pool,
      "assetmodels",
      "name",
      (asset) => asset.Model,
      assets
    );
    const locationsMap = await detectMissingRows(
      pool,
      "locations",
      "name",
      (asset) => asset.Location,
      assets
    );
    const departmentsMap = await detectMissingRows(
      pool,
      "departments",
      "name",
      (asset) => asset.Department,
      assets
    );

    res.json({
      modelAndTypes: Array.from(modelsMap),
      locations: Array.from(locationsMap),
      departments: Array.from(departmentsMap),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to detect missing presets" });
  }
});

router.post("/confirm", async function (req, res) {
  const missingPresets = parseInputReq(
    missingPresetsSchema,
    req.body.missingPresets
  );
  const assets = parseInputReq(z.array(assetImportSchema), req.body.assets);

  if (!missingPresets) {
    res.status(400).json({ error: "Missing presets required" });
    return;
  }
  if (!assets) {
    res.status(400).json({ error: "Assets required" });
    return;
  }

  try {
    const pool = await getPool();

    const modelsToAdd = await getModelsToAdd(pool, missingPresets);

    const modelsMap = await addModelRows(pool, modelsToAdd);

    const departmentsMap = await addGenericRows(
      pool,
      "departments",
      "name",
      missingPresets.departments ?? []
    );

    const locationsMap = await addGenericRows(
      pool,
      "locations",
      "name",
      missingPresets.locations ?? []
    );

    const allUsersResult = await pool.request().query(`
        SELECT ID, name
        FROM users
      `);
    const usersMap: Map<string, string> = new Map(
      allUsersResult.recordset.map((row) => [row.name.toLowerCase(), row.ID])
    );

    const assetsToAdd: AssetImport[] = [];

    const skippedAssets: SkippedRow[] = [];

    assets.forEach((asset) => {
      if (
        departmentsMap.has(asset.Department.toLowerCase()) &&
        locationsMap.has(asset.Location.toLowerCase()) &&
        modelsMap.has(asset.Model.toLowerCase())
      ) {
        assetsToAdd.push(asset);
      } else {
        skippedAssets.push({
          rowNumber: asset.rowNumber,
          identifier: asset.Identifier,
          reason: "Required department, location, or model was not added",
        });
      }
    });

    if (assetsToAdd.length > 0) {
      const result = await addAssets(pool, assetsToAdd, {
        departments: departmentsMap,
        locations: locationsMap,
        models: modelsMap,
        users: usersMap,
      });

      res.json({
        message: "Asset import successful",
        importedCount: result.rowsAffected,
        skippedRows: [...result.rowsSkipped, ...skippedAssets],
      });
    } else {
      res.json({
        message: "No assets were imported",
        importedCount: 0,
        skippedRows: skippedAssets,
      });
    }
  } catch (err) {
    console.error(err);
    if (err instanceof sql.RequestError && err.message.includes("identifier")) {
      res.status(500).json({ error: "Duplicate identifier detected" });
    } else {
      res.status(500).json({ error: "Failed to import assets" });
    }
  }
});

export default router;
