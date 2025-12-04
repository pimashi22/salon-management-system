import { Pool } from "pg";
import {
  CreateAppointmentParams,
  CreateAppointmentRow,
} from "./createAppointment.type";

const INSERT_APPOINTMENT_SQL = `
  INSERT INTO appointment (user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid)
  VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, false))
  RETURNING id, user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, created_at, updated_at
`;

export async function executeCreateAppointment(
  pool: Pool,
  params: CreateAppointmentParams
): Promise<CreateAppointmentRow> {
  const {
    userId,
    note,
    serviceId,
    startAt,
    endAt,
    paymentType,
    amount,
    isPaid,
  } = params;
  const result = await pool.query<CreateAppointmentRow>(
    INSERT_APPOINTMENT_SQL,
    [
      userId,
      note,
      serviceId,
      startAt,
      endAt,
      paymentType,
      amount,
      isPaid ?? false,
    ]
  );
  return result.rows[0];
}
