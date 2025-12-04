import { Pool } from "pg";

export type CategoryRow = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};

const GET_CATEGORY_BY_ID_SQL = `
  SELECT id, name, description, is_active
  FROM category
  WHERE id = $1
`;

export async function executeGetCategoryById(
  pool: Pool,
  id: number
): Promise<CategoryRow | null> {
  const result = await pool.query<CategoryRow>(GET_CATEGORY_BY_ID_SQL, [id]);
  return result.rows[0] || null;
}
