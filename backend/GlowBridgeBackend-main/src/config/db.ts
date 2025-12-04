import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl:
          process.env.PGSSL === "true"
            ? { rejectUnauthorized: false }
            : undefined,
      }
    : undefined
);

export async function ensureDatabaseConnection(): Promise<void> {
  
  const client = await pool.connect();
  client.release();
}
