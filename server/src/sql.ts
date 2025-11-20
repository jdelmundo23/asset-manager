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
