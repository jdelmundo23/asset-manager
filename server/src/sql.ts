import sql, { ConnectionPool } from "mssql";

export const sqlConfig = {
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
    console.log(
      `[SQL] Connection pool to database "${process.env.SQL_DB}" created.`
    );
  }
  return poolPromise;
};

export async function withTransaction<T>(
  callback: (request: sql.Request) => Promise<T>
) {
  const pool = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = new sql.Request(transaction);

    const result = await callback(request);

    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
