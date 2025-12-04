import { Pool } from "pg";
import { UpdateSalonParams, UpdateSalonRow } from "./updateSalon.type";

const UPDATE_SALON_SQL = `
  UPDATE salon
  SET
    name = COALESCE($2, name),
    type = COALESCE($3, type),
    bio = COALESCE($4, bio),
    location = COALESCE($5, location),
    contact_number = COALESCE($6, contact_number),
    updated_at = now()
  WHERE id = $1
  RETURNING id, name, type, bio, location, contact_number, created_at, updated_at, status
`;

export async function executeUpdateSalon(
  pool: Pool,
  params: UpdateSalonParams
): Promise<UpdateSalonRow | null> {
  const { id, name, type, bio, location, contactNumber } = params;
  const result = await pool.query<UpdateSalonRow>(UPDATE_SALON_SQL, [
    id,
    name ?? null,
    type ?? null,
    bio ?? null,
    location ?? null,
    contactNumber ?? null,
  ]);
  return result.rows[0] ?? null;
}
