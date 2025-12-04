import { Pool } from "pg";

const DELETE_SERVICE_SQL = `
  DELETE FROM service
  WHERE id = $1
  RETURNING id
`;

export async function executeDeleteService(
  pool: Pool,
  id: string
): Promise<string | null> {
  const result = await pool.query<{ id: string }>(DELETE_SERVICE_SQL, [id]);
  return result.rows[0]?.id || null;
}
