import { Pool } from "pg";

export interface PackageRow {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  discount: number | null;
}

export interface PackageWithServicesRow extends PackageRow {
  services: Array<{
    id: string;
    name: string;
    description: string;
    duration: string;
    price: number | null;
    salon_id: string;
  }>;
}

const GET_PACKAGE_SQL = `
  SELECT id, name, description, is_public, discount
  FROM package
  WHERE id = $1
`;

const GET_PACKAGE_SERVICES_SQL = `
  SELECT s.id, s.name, s.description, s.duration, s.price, s.salon_id
  FROM service s
  INNER JOIN package_service ps ON s.id = ps.service_id
  WHERE ps.package_id = $1
  ORDER BY s.name ASC
`;

export async function executeGetPackageById(
  pool: Pool,
  id: string
): Promise<PackageRow> {
  const result = await pool.query<PackageRow>(GET_PACKAGE_SQL, [id]);

  if (result.rows.length === 0) {
    throw new Error("Package not found");
  }

  return result.rows[0];
}

export async function executeGetPackageByIdWithServices(
  pool: Pool,
  id: string
): Promise<PackageWithServicesRow> {
  
  const packageResult = await pool.query<PackageRow>(GET_PACKAGE_SQL, [id]);

  if (packageResult.rows.length === 0) {
    throw new Error("Package not found");
  }

  const package_ = packageResult.rows[0];

  const servicesResult = await pool.query<{
    id: string;
    name: string;
    description: string;
    duration: string;
    price: number | null;
    salon_id: string;
  }>(GET_PACKAGE_SERVICES_SQL, [id]);

  return {
    ...package_,
    services: servicesResult.rows,
  };
}
