import { Pool } from "pg";
import { UpdateServiceParams, UpdateServiceRow } from "./updateService.type";

const DELETE_SERVICE_CATEGORIES_SQL = `
  DELETE FROM service_category WHERE service_id = $1
`;

const INSERT_SERVICE_CATEGORY_SQL = `
  INSERT INTO service_category (category_id, service_id)
  VALUES ($1, $2)
`;

export async function executeUpdateService(
  pool: Pool,
  params: UpdateServiceParams
): Promise<UpdateServiceRow | null> {
  const {
    id,
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

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (salonId !== undefined) {
      updateFields.push(`salon_id = $${paramIndex}`);
      values.push(salonId);
      paramIndex++;
    }

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (duration !== undefined) {
      updateFields.push(`duration = $${paramIndex}`);
      values.push(duration);
      paramIndex++;
    }

    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex}`);
      values.push(price);
      paramIndex++;
    }

    if (isPublic !== undefined) {
      updateFields.push(`is_public = $${paramIndex}`);
      values.push(isPublic);
      paramIndex++;
    }

    if (discount !== undefined) {
      updateFields.push(`discount = $${paramIndex}`);
      values.push(discount);
      paramIndex++;
    }

    if (isCompleted !== undefined) {
      updateFields.push(`is_completed = $${paramIndex}`);
      values.push(isCompleted);
      paramIndex++;
    }

    let service: UpdateServiceRow | null = null;

    if (updateFields.length > 0) {
      
      values.push(id);

      const UPDATE_SERVICE_SQL = `
        UPDATE service
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING id, salon_id, is_completed, name, description, duration, price, is_public, discount
      `;

      const result = await client.query<UpdateServiceRow>(
        UPDATE_SERVICE_SQL,
        values
      );
      service = result.rows[0] || null;
    } else {
      
      const selectResult = await client.query<UpdateServiceRow>(
        `SELECT id, salon_id, is_completed, name, description, duration, price, is_public, discount FROM service WHERE id = $1`,
        [id]
      );
      service = selectResult.rows[0] || null;
    }

    if (categoryIds !== undefined && service) {
      
      await client.query(DELETE_SERVICE_CATEGORIES_SQL, [id]);

      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          await client.query(INSERT_SERVICE_CATEGORY_SQL, [categoryId, id]);
        }
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
