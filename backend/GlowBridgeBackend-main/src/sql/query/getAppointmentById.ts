import { Pool } from "pg";
import { CreateAppointmentRow } from "../mutation/createAppointment.type";

const GET_APPOINTMENT_SQL = `
  SELECT id, user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, created_at, updated_at
  FROM appointment
  WHERE id = $1
`;

export async function executeGetAppointmentById(
  pool: Pool,
  id: string
): Promise<CreateAppointmentRow | null> {
  const result = await pool.query<CreateAppointmentRow>(GET_APPOINTMENT_SQL, [
    id,
  ]);
  return result.rows[0] ?? null;
}
