import { Pool } from "pg";
import { UpdateProductParams, UpdateProductRow } from "./updateProduct.type";

export async function executeUpdateProduct(
  pool: Pool,
  params: UpdateProductParams
): Promise<UpdateProductRow | null> {
  const {
    id,
    salonId,
    name,
    description,
    price,
    availableQuantity,
    isPublic,
    discount,
  } = params;

  const fieldsToUpdate: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (salonId !== undefined) {
    fieldsToUpdate.push(`salon_id = $${paramIndex}`);
    values.push(salonId);
    paramIndex++;
  }

  if (name !== undefined) {
    fieldsToUpdate.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
  }

  if (description !== undefined) {
    fieldsToUpdate.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }

  if (price !== undefined) {
    fieldsToUpdate.push(`price = $${paramIndex}`);
    values.push(price);
    paramIndex++;
  }

  if (availableQuantity !== undefined) {
    fieldsToUpdate.push(`available_quantity = $${paramIndex}`);
    values.push(availableQuantity);
    paramIndex++;
  }

  if (isPublic !== undefined) {
    fieldsToUpdate.push(`is_public = $${paramIndex}`);
    values.push(isPublic);
    paramIndex++;
  }

  if (discount !== undefined) {
    fieldsToUpdate.push(`discount = $${paramIndex}`);
    values.push(discount);
    paramIndex++;
  }

  if (fieldsToUpdate.length === 0) {
    throw new Error("No fields to update");
  }

  const sql = `
    UPDATE "product" 
    SET ${fieldsToUpdate.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, salon_id, name, description, price, available_quantity, is_public, discount
  `;

  values.push(id);

  const result = await pool.query<UpdateProductRow>(sql, values);
  return result.rows[0] || null;
}
