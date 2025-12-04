import { Pool } from "pg";
import { PackageRow, PackageWithServicesRow } from "./getPackageById";

export interface ListPackagesFilters {
  name?: string;
  search?: string;
  is_public?: boolean;
  service_id?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ListPackagesParams
  extends ListPackagesFilters,
    PaginationParams {}

export interface ListPackagesResult {
  packages: PackageWithServicesRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const GET_PACKAGE_SERVICES_BATCH_SQL = `
  SELECT ps.package_id, s.id, s.name, s.description, s.duration, s.price, s.salon_id
  FROM service s
  INNER JOIN package_service ps ON s.id = ps.service_id
  WHERE ps.package_id = ANY($1)
  ORDER BY ps.package_id, s.name ASC
`;

export async function executeListPackages(
  pool: Pool,
  params: ListPackagesParams
): Promise<ListPackagesResult> {
  const { name, search, is_public, service_id, page, limit } = params;

  const whereClauses: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (name) {
    whereClauses.push(`p.name ILIKE $${paramIndex}`);
    queryParams.push(`%${name}%`);
    paramIndex++;
  }

  if (search) {
    whereClauses.push(
      `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
    );
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (is_public !== undefined) {
    whereClauses.push(`p.is_public = $${paramIndex}`);
    queryParams.push(is_public);
    paramIndex++;
  }

  if (service_id) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM package_service ps 
      WHERE ps.package_id = p.id AND ps.service_id = $${paramIndex}
    )`);
    queryParams.push(service_id);
    paramIndex++;
  }

  const whereClause =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM package p ${whereClause}`;

  const offset = (page - 1) * limit;

  const mainQuery = `
    SELECT DISTINCT p.id, p.name, p.description, p.is_public, p.discount
    FROM package p
    ${whereClause}
    ORDER BY p.name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const paginationParams = [...queryParams, limit, offset];

  const [countResult, packagesResult] = await Promise.all([
    pool.query<{ total: string }>(countQuery, queryParams),
    pool.query<PackageRow>(mainQuery, paginationParams),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);
  const packages = packagesResult.rows;

  let packagesWithServices: PackageWithServicesRow[] = packages.map((pkg) => ({
    ...pkg,
    services: [],
  }));

  if (packages.length > 0) {
    const packageIds = packages.map((p) => p.id);
    const servicesResult = await pool.query<{
      package_id: string;
      id: string;
      name: string;
      description: string;
      duration: string;
      price: number | null;
      salon_id: string;
    }>(GET_PACKAGE_SERVICES_BATCH_SQL, [packageIds]);

    const servicesByPackage = servicesResult.rows.reduce((acc, service) => {
      if (!acc[service.package_id]) {
        acc[service.package_id] = [];
      }
      acc[service.package_id].push({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        salon_id: service.salon_id,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; name: string; description: string; duration: string; price: number | null; salon_id: string }>>);

    packagesWithServices = packages.map((package_) => ({
      ...package_,
      services: servicesByPackage[package_.id] || [],
    }));
  }

  return {
    packages: packagesWithServices,
    total,
    page,
    limit,
    totalPages,
  };
}
