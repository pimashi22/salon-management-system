import { Pool } from "pg";

const DELETE_PRODUCT_SQL = `
  DELETE FROM "product" WHERE id = $1
`;

export async function executeDeleteProduct(
  pool: Pool,
  productId: string
): Promise<void> {
  await pool.query(DELETE_PRODUCT_SQL, [productId]);
}
