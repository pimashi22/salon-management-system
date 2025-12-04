import { Pool } from "pg";
import { UpdateCategoryParams, UpdateCategoryRow } from "./updateCategory.type";

export async function executeUpdateCategory(
  pool: Pool,
  params: UpdateCategoryParams
): Promise<UpdateCategoryRow | null> {
  const { id, name, description, isActive } = params;

  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
  }

  if (description !== undefined) {
    updateFields.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }

  if (isActive !== undefined) {
    updateFields.push(`is_active = $${paramIndex}`);
    values.push(isActive);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    
    const selectResult = await pool.query<UpdateCategoryRow>(
      `SELECT id, name, description, is_active FROM category WHERE id = $1`,
      [id]
    );
    return selectResult.rows[0] || null;
  }

  values.push(id);

  const UPDATE_CATEGORY_SQL = `
    UPDATE category
    SET ${updateFields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, name, description, is_active
  `;

  const result = await pool.query<UpdateCategoryRow>(
    UPDATE_CATEGORY_SQL,
    values
  );
  return result.rows[0] || null;
}
