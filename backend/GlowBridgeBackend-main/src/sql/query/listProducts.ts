import { Pool } from "pg";
import { CreateProductRow } from "../mutation/createProduct.type";

export interface ListProductsFilters {
  salon_id?: string;
  is_public?: boolean;
  min_price?: number;
  max_price?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ListProductsParams
  extends ListProductsFilters,
    PaginationParams {}

export interface ListProductsResult {
  products: CreateProductRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function executeListProducts(
  pool: Pool,
  params: ListProductsParams
): Promise<ListProductsResult> {
  const { salon_id, is_public, min_price, max_price, page, limit } = params;

  const whereConditions: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (salon_id) {
    whereConditions.push(`salon_id = $${paramIndex}`);
    queryParams.push(salon_id);
    paramIndex++;
  }

  if (is_public !== undefined) {
    whereConditions.push(`is_public = $${paramIndex}`);
    queryParams.push(is_public);
    paramIndex++;
  }

  if (min_price !== undefined) {
    whereConditions.push(`price >= $${paramIndex}`);
    queryParams.push(min_price);
    paramIndex++;
  }

  if (max_price !== undefined) {
    whereConditions.push(`price <= $${paramIndex}`);
    queryParams.push(max_price);
    paramIndex++;
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) as total FROM "product" ${whereClause}`;

  const offset = (page - 1) * limit;

  const mainQuery = `
    SELECT id, salon_id, name, description, price, available_quantity, is_public, discount
    FROM "product"
    ${whereClause}
    ORDER BY name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const paginationParams = [...queryParams, limit, offset];

  const [countResult, productsResult] = await Promise.all([
    pool.query<{ total: string }>(countQuery, queryParams),
    pool.query<CreateProductRow>(mainQuery, paginationParams),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return {
    products: productsResult.rows,
    total,
    page,
    limit,
    totalPages,
  };
}
