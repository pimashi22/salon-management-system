import { Pool } from "pg";
import { CategoryRow } from "./getCategoryById";

export interface ListCategoriesFilters {
  name?: string;
  is_active?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ListCategoriesParams
  extends ListCategoriesFilters,
    PaginationParams {}

export interface ListCategoriesResult {
  categories: CategoryRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function executeListCategories(
  pool: Pool,
  params: ListCategoriesParams
): Promise<ListCategoriesResult> {
  const { name, is_active, page, limit } = params;

  const whereClauses: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (name) {
    whereClauses.push(`name ILIKE $${paramIndex}`);
    queryParams.push(`%${name}%`);
    paramIndex++;
  }

  if (is_active !== undefined) {
    whereClauses.push(`is_active = $${paramIndex}`);
    queryParams.push(is_active);
    paramIndex++;
  }

  const whereClause =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) as total FROM category ${whereClause}`;

  const offset = (page - 1) * limit;

  const mainQuery = `
    SELECT id, name, description, is_active
    FROM category
    ${whereClause}
    ORDER BY name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const paginationParams = [...queryParams, limit, offset];

  const [countResult, categoriesResult] = await Promise.all([
    pool.query<{ total: string }>(countQuery, queryParams),
    pool.query<CategoryRow>(mainQuery, paginationParams),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return {
    categories: categoriesResult.rows,
    total,
    page,
    limit,
    totalPages,
  };
}
