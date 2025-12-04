import { Pool } from "pg";
import { CreatePackageParams, CreatePackageRow } from "./createPackage.type";
export { CreatePackageParams, CreatePackageRow };

const INSERT_PACKAGE_SQL = `
  INSERT INTO package (name, description, is_public, discount)
  VALUES ($1, $2, $3, $4)
  RETURNING id, name, description, is_public, discount
`;

const INSERT_PACKAGE_SERVICE_SQL = `
  INSERT INTO package_service (package_id, service_id)
  VALUES ($1, $2)
`;

export async function executeCreatePackage(
  pool: Pool,
  params: CreatePackageParams
): Promise<CreatePackageRow> {
  const { name, description, isPublic, discount, serviceIds } = params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const packageResult = await client.query<CreatePackageRow>(
      INSERT_PACKAGE_SQL,
      [name, description ?? null, isPublic, discount ?? 0]
    );

    const package_ = packageResult.rows[0];

    if (serviceIds && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        await client.query(INSERT_PACKAGE_SERVICE_SQL, [
          package_.id,
          serviceId,
        ]);
      }
    }

    await client.query("COMMIT");
    return package_;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
