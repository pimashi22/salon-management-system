import { Pool } from "pg";
import { executeCreateDefaultWeeklyAvailabilityWithClient } from "./createStaffAvailability";

export interface CreateSalonStaffParams {
  userId: string;
  salonId: string;
}

export interface CreateSalonStaffRow {
  id: string;
  user_id: string;
  salon_id: string;
}

const INSERT_SALON_STAFF_SQL = `
  INSERT INTO salon_staff (user_id, salon_id)
  VALUES ($1, $2)
  RETURNING id, user_id, salon_id
`;

export async function executeCreateSalonStaff(
  pool: Pool,
  params: CreateSalonStaffParams
): Promise<CreateSalonStaffRow> {
  const { userId, salonId } = params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create salon staff record
    const result = await client.query<CreateSalonStaffRow>(
      INSERT_SALON_STAFF_SQL,
      [userId, salonId]
    );

    const salonStaff = result.rows[0];

    // Create default weekly availability (7 days, 9:00-17:00, all available)
    await executeCreateDefaultWeeklyAvailabilityWithClient(
      client,
      salonStaff.id
    );

    await client.query("COMMIT");
    return salonStaff;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
