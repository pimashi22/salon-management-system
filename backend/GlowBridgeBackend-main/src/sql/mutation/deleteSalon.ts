import { Pool } from "pg";

const DELETE_SALON_SQL = `
  DELETE FROM salon WHERE id = $1 RETURNING id
`;

export async function executeDeleteSalon(
  pool: Pool,
  id: string
): Promise<string | null> {
  const result = await pool.query<{ id: string }>(DELETE_SALON_SQL, [id]);
  return result.rows[0]?.id ?? null;
}
