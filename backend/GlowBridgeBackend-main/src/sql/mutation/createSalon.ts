import { Pool } from "pg";
import { CreateSalonParams, CreateSalonRow } from "./createSalon.type";

const INSERT_SALON_SQL = `
  INSERT INTO salon (name, type, bio, location, contact_number)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, name, type, bio, location, contact_number, created_at, updated_at
`;

export async function executeCreateSalon(
  pool: Pool,
  params: CreateSalonParams
): Promise<CreateSalonRow> {
  const { name, type, bio, location, contactNumber } = params;
  const result = await pool.query<CreateSalonRow>(INSERT_SALON_SQL, [
    name,
    type,
    bio,
    location,
    contactNumber,
  ]);
  return result.rows[0];
}
