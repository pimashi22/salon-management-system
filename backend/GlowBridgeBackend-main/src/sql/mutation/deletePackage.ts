import { Pool } from "pg";

const DELETE_PACKAGE_SQL = `
  DELETE FROM package WHERE id = $1
  RETURNING id, name, description, is_public, discount
`;

export interface DeletePackageRow {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  discount: number | null;
}

export async function executeDeletePackage(
  pool: Pool,
  id: string
): Promise<DeletePackageRow> {
  const result = await pool.query<DeletePackageRow>(DELETE_PACKAGE_SQL, [id]);

  if (result.rows.length === 0) {
    throw new Error("Package not found");
  }

  return result.rows[0];
}
