import { z, ZodTypeAny } from "zod";
import sql, { ConnectionPool } from "mssql";
import { subnetRowSchema } from "@shared/schemas";

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
  where: Record<string, unknown>
) => {
  const request = pool.request();
  const conditions: string[] = [];

  for (const key in where) {
    request.input(key, where[key]);
    conditions.push(`${key} = @${key}`);
  }

  const whereClause = conditions.join(" AND ");
  const query = `SELECT 1 FROM ${table} WHERE ${whereClause}`;

  let result;
  try {
    result = await request.query(query);
    return { exists: result.recordset.length > 0 };
  } catch (error) {
    console.error(error);
    return { exists: false, error: true };
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
