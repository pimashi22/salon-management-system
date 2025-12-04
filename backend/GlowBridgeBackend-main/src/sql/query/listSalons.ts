import { Pool } from "pg";
import { CreateSalonRow } from "../mutation/createSalon.type";

const LIST_SALONS_SQL = `
  SELECT id, name, type, bio, location, contact_number, created_at, updated_at, status
  FROM salon
`;

export async function executeListSalons(pool: Pool): Promise<CreateSalonRow[]> {
  const result = await pool.query<CreateSalonRow>(LIST_SALONS_SQL);
  return result.rows;
}
