import { Pool } from "pg";
import { UpdatePackageParams, UpdatePackageRow } from "./updatePackage.type";
export { UpdatePackageParams, UpdatePackageRow };

const DELETE_PACKAGE_SERVICES_SQL = `
  DELETE FROM package_service WHERE package_id = $1
`;

const INSERT_PACKAGE_SERVICE_SQL = `
  INSERT INTO package_service (package_id, service_id)
  VALUES ($1, $2)
`;

export async function executeUpdatePackage(
  pool: Pool,
  params: UpdatePackageParams
): Promise<UpdatePackageRow> {
  const { id, name, description, isPublic, discount, serviceIds } = params;

  const updateFields: string[] = [];
  const updateParams: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    updateParams.push(name);
    paramIndex++;
  }

  if (description !== undefined) {
    updateFields.push(`description = $${paramIndex}`);
    updateParams.push(description);
    paramIndex++;
  }

  if (isPublic !== undefined) {
    updateFields.push(`is_public = $${paramIndex}`);
    updateParams.push(isPublic);
    paramIndex++;
  }

  if (discount !== undefined) {
    updateFields.push(`discount = $${paramIndex}`);
    updateParams.push(discount);
    paramIndex++;
  }

  if (updateFields.length === 0 && !serviceIds) {
    throw new Error("No fields to update");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let updatedPackage: UpdatePackageRow;

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE package 
        SET ${updateFields.join(", ")} 
        WHERE id = $${paramIndex}
        RETURNING id, name, description, is_public, discount
      `;
      updateParams.push(id);

      const result = await client.query<UpdatePackageRow>(
        updateQuery,
        updateParams
      );

      if (result.rows.length === 0) {
        throw new Error("Package not found");
      }

      updatedPackage = result.rows[0];
    } else {
      
      const result = await client.query<UpdatePackageRow>(
        "SELECT id, name, description, is_public, discount FROM package WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error("Package not found");
      }

      updatedPackage = result.rows[0];
    }

    if (serviceIds !== undefined) {
      
      await client.query(DELETE_PACKAGE_SERVICES_SQL, [id]);

      if (serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          await client.query(INSERT_PACKAGE_SERVICE_SQL, [id, serviceId]);
        }
      }
    }

    await client.query("COMMIT");
    return updatedPackage;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
