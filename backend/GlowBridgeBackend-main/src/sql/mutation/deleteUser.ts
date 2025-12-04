import { Pool } from "pg";

const DELETE_USER_SQL = `
  DELETE FROM "user" WHERE id = $1 RETURNING id
`;

export async function executeDeleteUser(
  pool: Pool,
  id: string
): Promise<string | null> {
  const result = await pool.query<{ id: string }>(DELETE_USER_SQL, [id]);
  return result.rows[0]?.id ?? null;
}
