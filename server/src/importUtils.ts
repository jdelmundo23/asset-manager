import { AssetImport, PresetTable } from "@shared/schemas";
import { ConnectionPool } from "mssql";

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
          `${row.name.trim().toLowerCase()}|${row.typeName.trim().toLowerCase()}`,
          row.ID
        )
      );

      for (const asset of assets) {
        const modelName = asset.Model.trim();
        const typeName = asset.Type.trim();

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

        const normalized = original.trim().toLowerCase();
        const key = original.trim().toLowerCase();
        if (!map.has(normalized)) {
          missingMap.set(key, original.trim());
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
    console.error("Failed to add generic rows: ");
    console.error(err);
    throw err;
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
    console.error("Failed to add generic rows to table:");
    console.error(err);
    throw err;
  }
}
