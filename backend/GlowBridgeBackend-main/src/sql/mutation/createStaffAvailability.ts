import { Pool, PoolClient } from "pg";
import {
  CreateStaffAvailabilityParams,
  CreateStaffAvailabilityRow,
} from "./createStaffAvailability.type";

const INSERT_STAFF_AVAILABILITY_SQL = `
  INSERT INTO staff_availability (salon_staff_id, day_of_week, start_time, end_time, is_available)
  VALUES ($1, $2, $3, $4, COALESCE($5, true))
  RETURNING id, salon_staff_id, day_of_week, start_time, end_time, is_available
`;

const INSERT_BULK_STAFF_AVAILABILITY_SQL = `
  INSERT INTO staff_availability (salon_staff_id, day_of_week, start_time, end_time, is_available)
  VALUES 
`;

export async function executeCreateStaffAvailability(
  pool: Pool,
  params: CreateStaffAvailabilityParams
): Promise<CreateStaffAvailabilityRow> {
  const { salonStaffId, dayOfWeek, startTime, endTime, isAvailable } = params;
  const result = await pool.query<CreateStaffAvailabilityRow>(
    INSERT_STAFF_AVAILABILITY_SQL,
    [salonStaffId, dayOfWeek, startTime, endTime, isAvailable ?? true]
  );
  return result.rows[0];
}

export async function executeCreateDefaultWeeklyAvailability(
  pool: Pool,
  salonStaffId: string,
  defaultStartTime: string = "09:00",
  defaultEndTime: string = "17:00"
): Promise<CreateStaffAvailabilityRow[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const availabilityRecords: CreateStaffAvailabilityRow[] = [];

    // Create availability for each day of the week (0 = Sunday, 6 = Saturday)
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      const result = await client.query<CreateStaffAvailabilityRow>(
        INSERT_STAFF_AVAILABILITY_SQL,
        [salonStaffId, dayOfWeek, defaultStartTime, defaultEndTime, true]
      );
      availabilityRecords.push(result.rows[0]);
    }

    await client.query("COMMIT");
    return availabilityRecords;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function executeCreateDefaultWeeklyAvailabilityWithClient(
  client: PoolClient,
  salonStaffId: string,
  defaultStartTime: string = "09:00",
  defaultEndTime: string = "17:00"
): Promise<CreateStaffAvailabilityRow[]> {
  const availabilityRecords: CreateStaffAvailabilityRow[] = [];

  // Create availability for each day of the week (0 = Sunday, 6 = Saturday)
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    const result = await client.query<CreateStaffAvailabilityRow>(
      INSERT_STAFF_AVAILABILITY_SQL,
      [salonStaffId, dayOfWeek, defaultStartTime, defaultEndTime, true]
    );
    availabilityRecords.push(result.rows[0]);
  }

  return availabilityRecords;
}

export async function executeCreateBulkStaffAvailability(
  pool: Pool,
  availabilityRecords: CreateStaffAvailabilityParams[]
): Promise<CreateStaffAvailabilityRow[]> {
  if (!availabilityRecords || availabilityRecords.length === 0) {
    return [];
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const results: CreateStaffAvailabilityRow[] = [];

    for (const params of availabilityRecords) {
      const { salonStaffId, dayOfWeek, startTime, endTime, isAvailable } =
        params;
      const result = await client.query<CreateStaffAvailabilityRow>(
        INSERT_STAFF_AVAILABILITY_SQL,
        [salonStaffId, dayOfWeek, startTime, endTime, isAvailable ?? true]
      );
      results.push(result.rows[0]);
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
