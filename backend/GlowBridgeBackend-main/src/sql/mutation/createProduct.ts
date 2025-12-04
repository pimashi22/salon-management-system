import { Pool } from "pg";
import { CreateProductParams, CreateProductRow } from "./createProduct.type";

const INSERT_PRODUCT_SQL = `
  INSERT INTO "product" (salon_id, name, description, price, available_quantity, is_public, discount)
  VALUES ($1, $2, $3, $4, $5, COALESCE($6, true), COALESCE($7, 0))
  RETURNING id, salon_id, name, description, price, available_quantity, is_public, discount
`;

export async function executeCreateProduct(
  pool: Pool,
  params: CreateProductParams
): Promise<CreateProductRow> {
  const {
    salonId,
    name,
    description,
    price,
    availableQuantity,
    isPublic,
    discount,
  } = params;
  const result = await pool.query<CreateProductRow>(INSERT_PRODUCT_SQL, [
    salonId,
    name,
    description ?? null,
    price,
    availableQuantity,
    isPublic ?? null,
    discount ?? null,
  ]);
  return result.rows[0];
}
