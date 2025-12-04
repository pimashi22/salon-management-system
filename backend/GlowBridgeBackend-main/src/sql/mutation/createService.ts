import { Pool } from "pg";
import { CreateServiceParams, CreateServiceRow } from "./createService.type";

const INSERT_SERVICE_SQL = `
  INSERT INTO service (salon_id, is_completed, name, description, duration, price, is_public, discount)
  VALUES ($1, COALESCE($2, false), $3, $4, $5, $6, $7, COALESCE($8, 0))
  RETURNING id, salon_id, is_completed, name, description, duration, price, is_public, discount
`;

const INSERT_SERVICE_CATEGORY_SQL = `
  INSERT INTO service_category (category_id, service_id)
  VALUES ($1, $2)
`;

export async function executeCreateService(
  pool: Pool,
  params: CreateServiceParams
): Promise<CreateServiceRow> {
  const {
    salonId,
    name,
    description,
    duration,
    price,
    isPublic,
    discount,
    isCompleted,
    categoryIds,
  } = params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const serviceResult = await client.query<CreateServiceRow>(
      INSERT_SERVICE_SQL,
      [
        salonId,
        isCompleted ?? null,
        name,
        description,
        duration,
        price ?? null,
        isPublic,
        discount ?? null,
      ]
    );

    const service = serviceResult.rows[0];

    if (categoryIds && categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await client.query(INSERT_SERVICE_CATEGORY_SQL, [
          categoryId,
          service.id,
        ]);
      }
    }

    await client.query("COMMIT");
    return service;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
