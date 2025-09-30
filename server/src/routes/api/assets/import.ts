import {
  AssetImport,
  assetImportSchema,
  MissingPresets,
  missingPresetsSchema,
} from "@shared/schemas";
import express from "express";
import { getPool } from "@server/src/sql";
import {
  addGenericRows,
  addModelRows,
  detectMissingRows,
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

const addAssets = async (
  pool: sql.ConnectionPool,
  assets: AssetImport[],
  maps: {
    locations: Map<string, number>;
    departments: Map<string, number>;
    models: Map<string, number>;
    users: Map<string, string>;
  }
) => {
  const request = pool.request();

  try {
    assets.forEach((row, index) => {
      request.input(`name${index}`, sql.VarChar, row.Name);
      request.input(`identifier${index}`, sql.VarChar, row.Identifier);
      request.input(
        `locationID${index}`,
        sql.Int,
        maps.locations.get(row.Location.toLowerCase().trim()) ?? null
      );
      request.input(
        `departmentID${index}`,
        sql.Int,
        maps.departments.get(row.Department.toLowerCase().trim()) ?? null
      );
      request.input(
        `modelID${index}`,
        sql.Int,
        maps.models.get(row.Model.toLowerCase().trim()) ?? null
      );
      request.input(
        `assignedTo${index}`,
        sql.VarChar,
        maps.users.get(row["Assigned To"]?.toLowerCase().trim() ?? "") ?? null
      );
      request.input(`purchaseDate${index}`, sql.DateTime, row["Purchase Date"]);
      request.input(`warrantyExp${index}`, sql.DateTime, row["Warranty Exp"]);
      request.input(`cost${index}`, sql.Decimal(6, 2), row.Cost);
      request.input(`note${index}`, sql.NVarChar, row.note);
    });

    const valuesClause = assets
      .map(
        (_, i) =>
          `(@name${i}, @identifier${i}, @locationID${i}, @departmentID${i}, @modelID${i}, @assignedTo${i}, @purchaseDate${i}, @warrantyExp${i}, @cost${i}, @note${i})`
      )
      .join(", ");

    const insertQuery = `
      INSERT INTO Assets (
        name, identifier, locationID, departmentID, modelID,
        assignedTo, purchaseDate, warrantyExp, cost, note
      )
      SELECT *
      FROM (VALUES ${valuesClause}) AS temp
        (name, identifier, locationID, departmentID, modelID, assignedTo, purchaseDate, warrantyExp, cost, note)
      WHERE NOT EXISTS (
        SELECT 1
        FROM Assets a
        WHERE a.modelID = temp.modelID
          AND a.identifier = temp.identifier
      )
    `;

    const result = await request.query(insertQuery);

    return {
      rowsAffected: result.rowsAffected[0],
      rowsSkipped: assets.length - result.rowsAffected[0],
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getModelsToAdd = async (
  pool: sql.ConnectionPool,
  missingPresets: MissingPresets
) => {
  const types = Array.from(
    new Set(
      missingPresets.modelAndTypes.map((modelAndType) => {
        return modelAndType.split("|").map((str) => str.trim())[1];
      })
    )
  );

  const models = Array.from(
    new Set(
      missingPresets.modelAndTypes.map((modelAndType) => {
        const [model, type] = modelAndType.split("|").map((str) => str.trim());
        return { model: model, type: type };
      })
    )
  );

  const request = pool.request();

  const existingTypesResult = await request.query(
    `SELECT ID, name FROM assettypes`
  );

  const existingTypesMap = new Map<string, number>();
  existingTypesResult.recordset.forEach((r) =>
    existingTypesMap.set(r.name.toLowerCase().trim(), r.ID)
  );

  const typesToAdd = types.filter(
    (type) => !existingTypesMap.has(type.toLowerCase().trim())
  );

  const addedTypesMap = await addGenericRows(
    pool,
    "assettypes",
    "name",
    typesToAdd
  );

  const typeMap = new Map([...existingTypesMap, ...addedTypesMap]);

  const modelsToAdd = models.map(({ model, type }) => ({
    modelName: model,
    typeID: typeMap.get(type.toLowerCase()),
  }));

  return modelsToAdd;
};

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
      allUsersResult.recordset.map((row) => [
        row.name.toLowerCase().trim(),
        row.ID,
      ])
    );

    const assetsToAdd = assets.filter((asset) => {
      return (
        departmentsMap.has(asset.Department.toLowerCase().trim()) &&
        locationsMap.has(asset.Location.toLowerCase().trim()) &&
        modelsMap.has(asset.Model.toLowerCase().trim())
      );
    });

    if (assetsToAdd.length > 0) {
      const result = await addAssets(pool, assetsToAdd, {
        departments: departmentsMap,
        locations: locationsMap,
        models: modelsMap,
        users: usersMap,
      });

      res.json({
        message: "Assets imported successfully",
        importedCount: result.rowsAffected,
        skippedCount: result.rowsSkipped,
      });
    } else {
      res.json({
        message: "No assets were imported",
        importedCount: 0,
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
