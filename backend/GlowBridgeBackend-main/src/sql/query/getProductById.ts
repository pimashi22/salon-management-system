import { Pool } from "pg";
import { CreateProductRow } from "../mutation/createProduct.type";

const GET_PRODUCT_BY_ID_SQL = `
  SELECT id, salon_id, name, description, price, available_quantity, is_public, discount
  FROM "product"
  WHERE id = $1
`;

export async function executeGetProductById(
  pool: Pool,
  productId: string
): Promise<CreateProductRow | null> {
  const result = await pool.query<CreateProductRow>(GET_PRODUCT_BY_ID_SQL, [
    productId,
  ]);
  return result.rows[0] || null;
}
