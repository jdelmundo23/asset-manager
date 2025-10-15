import {
  Asset,
  AssetImport,
  MissingPresets,
  PresetTable,
  SkippedRow,
} from "@shared/schemas";
import sql, { ConnectionPool } from "mssql";

export async function detectMissingRows(
  pool: ConnectionPool,
  table: PresetTable,
  column: string,
  getValue: (asset: AssetImport) => string,
  assets: AssetImport[]
): Promise<string[]> {
  const map = new Map<string, number>();

  const missingMap = new Map<string, string>();

  try {
    if (table === "assetmodels") {
      const existing = await pool
        .request()
        .query(
          `SELECT assetmodels.ID, assetmodels.name, assettypes.name as typeName FROM assetmodels LEFT JOIN assettypes ON assetmodels.typeID = assettypes.ID`
        );
      existing.recordset.forEach((row) =>
        map.set(
          `${row.name.toLowerCase()}|${row.typeName.toLowerCase()}`,
          row.ID
        )
      );

      for (const asset of assets) {
        const modelName = asset.Model;
        const typeName = asset.Type;

        const key = `${modelName.toLowerCase()}|${typeName.toLowerCase()}`;

        if (!map.has(key)) {
          missingMap.set(key, `${modelName}|${typeName}`);
        }
      }
    } else {
      const existing = await pool
        .request()
        .query(`SELECT ID, ${column} as name FROM ${table}`);
      existing.recordset.forEach((row) =>
        map.set(row.name.toLowerCase(), row.ID)
      );

      for (const asset of assets) {
        const original = getValue(asset);
        if (!original) continue;

        const normalized = original.toLowerCase();
        const key = original.toLowerCase();
        if (!map.has(normalized)) {
          missingMap.set(key, original);
        }
      }
    }

    return Array.from(missingMap.values());
  } catch (err) {
    console.log("Failed to detect missing rows: ");
    console.log(err);
    throw err;
  }
}

export const getModelsToAdd = async (
  pool: sql.ConnectionPool,
  missingPresets: MissingPresets
) => {
  const types = Array.from(
    new Set(
      missingPresets.modelAndTypes.map((modelAndType) => {
        return modelAndType.split("|")[1];
      })
    )
  );

  const models = Array.from(
    new Set(
      missingPresets.modelAndTypes.map((modelAndType) => {
        const [model, type] = modelAndType.split("|");
        return { model: model, type: type };
      })
    )
  );

  try {
    const request = pool.request();

    const existingTypesResult = await request.query(
      `SELECT ID, name FROM assettypes`
    );

    const existingTypesMap = new Map<string, number>();
    existingTypesResult.recordset.forEach((r) =>
      existingTypesMap.set(r.name.toLowerCase(), r.ID)
    );

    const typesToAdd = types.filter(
      (type) => !existingTypesMap.has(type.toLowerCase())
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
  } catch (err) {
    console.error(err);
    throw new Error("Failed to get models to add.");
  }
};

export async function addGenericRows(
  pool: ConnectionPool,
  table: PresetTable,
  column: string,
  valuesToAdd: string[]
): Promise<Map<string, number>> {
  const allRowsMap = new Map<string, number>();

  try {
    const request = pool.request();
    if (valuesToAdd.length > 0) {
      const valuesList = valuesToAdd.map((_, i) => `(@val${i})`).join(", ");
      valuesToAdd.forEach((val, i) => request.input(`val${i}`, val));

      const query = `
      INSERT INTO ${table} (${column})
      VALUES ${valuesList};
    `;

      await request.query(query);
    }

    const result = await pool.request().query(`
      SELECT ID, ${column} as name FROM ${table}
      `);

    result.recordset.forEach((row) =>
      allRowsMap.set(row.name.toLowerCase(), row.ID)
    );

    return allRowsMap;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to add generic rows.");
  }
}

export async function addModelRows(
  pool: ConnectionPool,
  valuesToAdd: { modelName: string; typeID: number | undefined }[]
): Promise<Map<string, number>> {
  const allRowsMap = new Map<string, number>();

  const validRows = valuesToAdd.filter((row) => typeof row.typeID === "number");

  try {
    const request = pool.request();

    if (validRows.length > 0) {
      const valuesList = validRows
        .map((_, i) => `(@model${i}, @type${i})`)
        .join(", ");

      validRows.forEach((row, i) => {
        request.input(`model${i}`, row.modelName);
        request.input(`type${i}`, row.typeID!);
      });

      const query = `
        INSERT INTO assetmodels (name, typeID)
        VALUES ${valuesList};

        SELECT ID, name from assetmodels
      `;

      await request.query(query);
    }

    const result = await pool.request().query(`
      SELECT ID, name FROM assetmodels
    `);

    result.recordset.forEach((row) =>
      allRowsMap.set(row.name.toLowerCase(), row.ID)
    );

    return allRowsMap;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to add model rows`);
  }
}

export const addAssets = async (
  pool: sql.ConnectionPool,
  assets: AssetImport[],
  maps: {
    locations: Map<string, number>;
    departments: Map<string, number>;
    models: Map<string, number>;
    users: Map<string, string>;
  }
) => {
  const assetInserts = assets.map((row) => ({
    rowNumber: row.rowNumber,
    asset: {
      name: row.Name,
      cost: row.Cost ?? 0,
      identifier: row.Identifier,
      modelID: maps.models.get(row.Model.toLowerCase()) ?? null,
      locationID: maps.locations.get(row.Location.toLowerCase()) ?? null,
      departmentID: maps.departments.get(row.Department.toLowerCase()) ?? null,
      assignedTo:
        maps.users.get(row["Assigned To"]?.toLowerCase() ?? "") ?? null,
      purchaseDate: row["Purchase Date"],
      warrantyExp: row["Warranty Exp"],
      note: row.Note,
    },
  }));

  try {
    const checkResult = await checkExistingAssets(pool, assetInserts);

    const existingPairs = new Set(
      checkResult.recordset.map(
        (asset) => `${asset.modelID}-${asset.identifier}`
      )
    );

    const skipped = assetInserts.filter(({ asset }) =>
      existingPairs.has(`${asset.modelID}-${asset.identifier}`)
    );

    const skippedRows: SkippedRow[] = skipped.map(({ rowNumber, asset }) => ({
      rowNumber,
      identifier: asset.identifier,
      reason: "Model + identifier pair already exists",
    }));

    const toInsert = assetInserts.filter(
      ({ asset }) => !existingPairs.has(`${asset.modelID}-${asset.identifier}`)
    );

    const insertResult = await insertAssets(pool, toInsert);

    return {
      rowsAffected: insertResult?.rowsAffected[0] || 0,
      rowsSkipped: skippedRows,
    };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to add assets.");
  }
};

export const checkExistingAssets = async (
  pool: sql.ConnectionPool,
  assetInserts: { rowNumber: number; asset: Asset }[]
) => {
  try {
    const checkRequest = pool.request();

    assetInserts.forEach(({ asset }, index) => {
      checkRequest.input(`name${index}`, sql.VarChar, asset.name);
      checkRequest.input(`identifier${index}`, sql.VarChar, asset.identifier);
      checkRequest.input(`locationID${index}`, sql.Int, asset.locationID);
      checkRequest.input(`departmentID${index}`, sql.Int, asset.departmentID);
      checkRequest.input(`modelID${index}`, sql.Int, asset.modelID);
      checkRequest.input(`assignedTo${index}`, sql.VarChar, asset.assignedTo);
      checkRequest.input(
        `purchaseDate${index}`,
        sql.DateTime,
        asset.purchaseDate
      );
      checkRequest.input(
        `warrantyExp${index}`,
        sql.DateTime,
        asset.warrantyExp
      );
      checkRequest.input(`cost${index}`, sql.Decimal(6, 2), asset.cost);
      checkRequest.input(`note${index}`, sql.NVarChar, asset.note);
    });

    const checkClause = assetInserts
      .map(
        (_, i) =>
          `(@name${i}, @identifier${i}, @locationID${i}, @departmentID${i}, @modelID${i}, @assignedTo${i}, @purchaseDate${i}, @warrantyExp${i}, @cost${i}, @note${i})`
      )
      .join(", ");

    const checkQuery = `
      SELECT *
      FROM (VALUES ${checkClause}) AS temp
        (name, identifier, locationID, departmentID, modelID, assignedTo, purchaseDate, warrantyExp, cost, note)
      WHERE EXISTS (
        SELECT 1
        FROM Assets a
        WHERE a.modelID = temp.modelID
          AND a.identifier = temp.identifier
      )
    `;

    return await checkRequest.query(checkQuery);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to check existing assets.");
  }
};

export const insertAssets = async (
  pool: sql.ConnectionPool,
  toInsert: { rowNumber: number; asset: Asset }[]
) => {
  try {
    const insertRequest = pool.request();

    if (toInsert.length > 0) {
      toInsert.forEach(({ asset }, index) => {
        insertRequest.input(`name${index}`, sql.VarChar, asset.name);
        insertRequest.input(
          `identifier${index}`,
          sql.VarChar,
          asset.identifier
        );
        insertRequest.input(`locationID${index}`, sql.Int, asset.locationID);
        insertRequest.input(
          `departmentID${index}`,
          sql.Int,
          asset.departmentID
        );
        insertRequest.input(`modelID${index}`, sql.Int, asset.modelID);
        insertRequest.input(
          `assignedTo${index}`,
          sql.VarChar,
          asset.assignedTo
        );
        insertRequest.input(
          `purchaseDate${index}`,
          sql.DateTime,
          asset.purchaseDate
        );
        insertRequest.input(
          `warrantyExp${index}`,
          sql.DateTime,
          asset.warrantyExp
        );
        insertRequest.input(`cost${index}`, sql.Decimal(6, 2), asset.cost);
        insertRequest.input(`note${index}`, sql.NVarChar, asset.note);
      });

      const insertClause = toInsert
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
      VALUES ${insertClause}
    `;
      return await insertRequest.query(insertQuery);
    }
  } catch (err) {
    console.error(err);
    throw new Error("Failed to insert asset rows.");
  }
};
