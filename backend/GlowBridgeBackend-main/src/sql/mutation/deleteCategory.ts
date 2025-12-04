import { Pool } from "pg";

const DELETE_CATEGORY_SQL = `
  DELETE FROM category
  WHERE id = $1
  RETURNING id
`;

export async function executeDeleteCategory(
  pool: Pool,
  id: number
): Promise<number | null> {
  const result = await pool.query<{ id: number }>(DELETE_CATEGORY_SQL, [id]);
  return result.rows[0]?.id || null;
}
