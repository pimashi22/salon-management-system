import { Pool } from "pg";

const DEACTIVATE_SALON_SQL = `
  UPDATE salon
  SET status = 'inactive', updated_at = now()
  WHERE id = $1
  RETURNING id
`;

export async function executeDeactivateSalon(
  pool: Pool,
  id: string
): Promise<string | null> {
  const result = await pool.query<{ id: string }>(DEACTIVATE_SALON_SQL, [id]);
  return result.rows[0]?.id ?? null;
}
