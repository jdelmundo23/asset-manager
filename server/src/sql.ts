import sql, { ConnectionPool } from "mssql";

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PWORD,
  server: process.env.SQL_SVR as string,
  database: process.env.SQL_DB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: process.env.SQL_INSTANCE,
  },
};

let poolPromise: ConnectionPool | null = null;

export const getPool = async (): Promise<ConnectionPool> => {
  if (!poolPromise) {
    poolPromise = await sql.connect(sqlConfig);
    console.log(`Connection pool to database "${process.env.SQL_DB}" created.`);
  }
  return poolPromise;
};

export async function recordExists(
  pool: ConnectionPool,
  table: string,
  where: Record<string, any>
) {
  const request = pool.request();
  const conditions: string[] = [];

  for (const key in where) {
    request.input(key, where[key]);
    conditions.push(`${key} = @${key}`);
  }

  const whereClause = conditions.join(" AND ");
  const query = `SELECT 1 FROM ${table} WHERE ${whereClause}`;

  const result = await request.query(query);
  return result.recordset.length > 0;
}
