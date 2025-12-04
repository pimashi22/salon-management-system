import { Pool } from "pg";
import { ServiceRow, ServiceWithCategoriesRow } from "./getServiceById";

export interface ListServicesFilters {
  salon_id?: string;
  is_completed?: boolean;
  name?: string;
  is_public?: boolean;
  category_id?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ListServicesParams
  extends ListServicesFilters,
    PaginationParams {}

export interface ListServicesResult {
  services: ServiceWithCategoriesRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const GET_SERVICE_CATEGORIES_BATCH_SQL = `
  SELECT sc.service_id, c.id, c.name, c.description
  FROM category c
  INNER JOIN service_category sc ON c.id = sc.category_id
  WHERE sc.service_id = ANY($1)
  ORDER BY sc.service_id, c.name ASC
`;

export async function executeListServices(
  pool: Pool,
  params: ListServicesParams
): Promise<ListServicesResult> {
  const { salon_id, is_completed, name, is_public, category_id, page, limit } =
    params;

  const whereClauses: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (salon_id) {
    whereClauses.push(`s.salon_id = $${paramIndex}`);
    queryParams.push(salon_id);
    paramIndex++;
  }

  if (is_completed !== undefined) {
    whereClauses.push(`s.is_completed = $${paramIndex}`);
    queryParams.push(is_completed);
    paramIndex++;
  }

  if (name) {
    whereClauses.push(`s.name ILIKE $${paramIndex}`);
    queryParams.push(`%${name}%`);
    paramIndex++;
  }

  if (is_public !== undefined) {
    whereClauses.push(`s.is_public = $${paramIndex}`);
    queryParams.push(is_public);
    paramIndex++;
  }

  if (category_id) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM service_category sc 
      WHERE sc.service_id = s.id AND sc.category_id = $${paramIndex}
    )`);
    queryParams.push(category_id);
    paramIndex++;
  }

  const whereClause =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(DISTINCT s.id) as total FROM service s ${whereClause}`;

  const offset = (page - 1) * limit;

  const mainQuery = `
    SELECT DISTINCT s.id, s.salon_id, s.is_completed, s.name, s.description, s.duration, s.price, s.is_public, s.discount
    FROM service s
    ${whereClause}
    ORDER BY s.name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const paginationParams = [...queryParams, limit, offset];

  const [countResult, servicesResult] = await Promise.all([
    pool.query<{ total: string }>(countQuery, queryParams),
    pool.query<ServiceRow>(mainQuery, paginationParams),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);
  const services = servicesResult.rows;

  let servicesWithCategories: ServiceWithCategoriesRow[] = services;

  if (services.length > 0) {
    const serviceIds = services.map((s) => s.id);
    const categoriesResult = await pool.query<{
      service_id: string;
      id: number;
      name: string;
      description: string | null;
    }>(GET_SERVICE_CATEGORIES_BATCH_SQL, [serviceIds]);

    const categoriesByService = categoriesResult.rows.reduce((acc, cat) => {
      if (!acc[cat.service_id]) {
        acc[cat.service_id] = [];
      }
      acc[cat.service_id].push({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      });
      return acc;
    }, {} as Record<string, Array<{ id: number; name: string; description: string | null }>>);

    servicesWithCategories = services.map((service) => ({
      ...service,
      categories: categoriesByService[service.id] || [],
    }));
  }

  return {
    services: servicesWithCategories,
    total,
    page,
    limit,
    totalPages,
  };
}
