import { Pool } from "pg";

export type ServiceRow = {
  id: string;
  salon_id: string;
  is_completed: boolean;
  name: string;
  description: string;
  duration: string;
  price: number | null;
  is_public: boolean;
  discount: number | null;
};

export type ServiceWithCategoriesRow = ServiceRow & {
  categories?: Array<{
    id: number;
    name: string;
    description: string | null;
  }>;
};

const GET_SERVICE_BY_ID_SQL = `
  SELECT id, salon_id, is_completed, name, description, duration, price, is_public, discount
  FROM service
  WHERE id = $1
`;

const GET_SERVICE_CATEGORIES_SQL = `
  SELECT c.id, c.name, c.description
  FROM category c
  INNER JOIN service_category sc ON c.id = sc.category_id
  WHERE sc.service_id = $1
  ORDER BY c.name ASC
`;

export async function executeGetServiceById(
  pool: Pool,
  id: string
): Promise<ServiceRow | null> {
  const result = await pool.query<ServiceRow>(GET_SERVICE_BY_ID_SQL, [id]);
  return result.rows[0] || null;
}

export async function executeGetServiceByIdWithCategories(
  pool: Pool,
  id: string
): Promise<ServiceWithCategoriesRow | null> {
  const [serviceResult, categoriesResult] = await Promise.all([
    pool.query<ServiceRow>(GET_SERVICE_BY_ID_SQL, [id]),
    pool.query<{ id: number; name: string; description: string | null }>(
      GET_SERVICE_CATEGORIES_SQL,
      [id]
    ),
  ]);

  const service = serviceResult.rows[0];
  if (!service) {
    return null;
  }

  return {
    ...service,
    categories: categoriesResult.rows,
  };
}
