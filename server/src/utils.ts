import { z, ZodRawShape, ZodTypeAny } from "zod";
import sql, { ConnectionPool } from "mssql";
import { AssetImport, PresetTable, subnetRowSchema } from "@shared/schemas";

export const parseInputReq = <T extends ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> | undefined => {
  const parse = schema.safeParse(data);

  if (!parse.success) {
    console.error(parse.error.format());
    return undefined;
  } else {
    return parse.data;
  }
};

export const recordExists = async (
  pool: ConnectionPool,
  table: string,
  where: Record<string, unknown> = {},
  whereNot: Record<string, unknown> = {}
) => {
  const request = pool.request();
  const conditions: string[] = [];

  for (const key in where) {
    request.input(key, where[key]);
    conditions.push(`${key} = @${key}`);
  }

  for (const key in whereNot) {
    const paramName = `not_${key}`;
    request.input(paramName, whereNot[key]);
    conditions.push(`${key} != @${paramName}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT 1 FROM ${table} ${whereClause}`;

  try {
    const result = await request.query(query);
    const ID = result.recordset[0]?.ID ?? null;
    return {
      exists: ID !== null,
      ID: Number(ID),
      error: false,
    };
  } catch (error) {
    console.error(error);
    return { exists: false, ID: null, error: true };
  }
};

export const splitIpAddress = (
  ipAddress: string
): { subnetPrefix: string; hostNumber: number } => {
  const octets = ipAddress.split(".");
  const subnetPrefix = `${octets[0]}.${octets[1]}.${octets[2]}`;
  const hostNumber = parseInt(octets[3], 10);

  return { subnetPrefix, hostNumber };
};

export const getSubnetByPrefix = async (
  pool: ConnectionPool,
  subnetPrefix: string
): Promise<{ subnetID: number | null }> => {
  try {
    const result = await pool
      .request()
      .input("subnetPrefix", sql.VarChar(11), subnetPrefix)
      .query("SELECT TOP 1 * FROM Subnets WHERE subnetPrefix = @subnetPrefix");
    if (result.recordset.length === 0) {
      return { subnetID: null };
    }
    return { subnetID: result.recordset[0].ID };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addSubnet = async (
  pool: ConnectionPool,
  subnetPrefix: string
): Promise<{ subnetID: number }> => {
  try {
    const { subnetID } = await getSubnetByPrefix(pool, subnetPrefix);
    const parse = subnetRowSchema.shape.ID.safeParse(subnetID);

    if (parse.success) {
      return { subnetID: parse.data };
    }

    const result = await pool
      .request()
      .input("subnetPrefix", sql.VarChar(11), subnetPrefix).query(`
      INSERT INTO Subnets (subnetPrefix)
      OUTPUT INSERTED.ID
      VALUES (@subnetPrefix)
    `);

    return { subnetID: result.recordset[0].ID };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export function validateSingleField<T extends ZodRawShape>(
  schema: z.ZodObject<T>,
  key: keyof T,
  value: unknown
) {
  const fieldSchema = schema.shape[key as keyof T] as ZodTypeAny | undefined;

  if (!fieldSchema) return undefined;

  return fieldSchema.safeParse(value);
}

export async function detectMissingRows(
  pool: ConnectionPool,
  table: PresetTable,
  column: string,
  getValue: (asset: AssetImport) => string,
  assets: AssetImport[]
): Promise<string[]> {
  if (table === "assetmodels") {
    const map = new Map<string, number>();
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

    const missingSet = new Set<string>();
    for (const asset of assets) {
      const modelName = asset.Model.trim().toLowerCase();
      const typeName = asset.Type.trim().toLowerCase();

      const key = `${modelName}|${typeName}`;

      if (!map.has(key)) {
        missingSet.add(`${asset.Model.trim()}|${asset.Type.trim()}`);
      }
    }
    return Array.from(missingSet);
  } else {
    const map = new Map<string, number>();
    const existing = await pool
      .request()
      .query(`SELECT ID, ${column} as name FROM ${table}`);
    existing.recordset.forEach((row) =>
      map.set(row.name.toLowerCase(), row.ID)
    );

    const missingSet = new Set<string>();
    for (const asset of assets) {
      const original = getValue(asset);
      if (!original) continue;

      const normalized = original.trim().toLowerCase();
      if (!map.has(normalized)) {
        missingSet.add(original.trim());
      }
    }

    return Array.from(missingSet);
  }
}

export async function addRows(
  pool: ConnectionPool,
  table: PresetTable,
  column: string,
  valuesToAdd: string[]
): Promise<Map<string, number>> {
  const addedValuesMap = new Map<string, number>();

  if (valuesToAdd.length === 0) return addedValuesMap;

  const request = pool.request();
  const valuesList = valuesToAdd.map((_, i) => `(@val${i})`).join(", ");
  valuesToAdd.forEach((val, i) => request.input(`val${i}`, val));

  const query = `
    INSERT INTO ${table} (${column})
    VALUES ${valuesList};

    SELECT ID, ${column} as name FROM ${table} WHERE ${column} IN (${valuesToAdd
      .map((_, i) => `@val${i}`)
      .join(", ")});
  `;
  const result = await request.query(query);

  result.recordset.forEach((row) =>
    addedValuesMap.set(row.name.toLowerCase(), row.ID)
  );

  return addedValuesMap;
}
