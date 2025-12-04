import { Pool } from "pg";
import { CreateCategoryParams, CreateCategoryRow } from "./createCategory.type";

const INSERT_CATEGORY_SQL = `
  INSERT INTO category (name, description, is_active)
  VALUES ($1, $2, COALESCE($3, true))
  RETURNING id, name, description, is_active
`;

export async function executeCreateCategory(
  pool: Pool,
  params: CreateCategoryParams
): Promise<CreateCategoryRow> {
  const { name, description, isActive } = params;
  const result = await pool.query<CreateCategoryRow>(INSERT_CATEGORY_SQL, [
    name,
    description ?? null,
    isActive ?? null,
  ]);
  return result.rows[0];
}
