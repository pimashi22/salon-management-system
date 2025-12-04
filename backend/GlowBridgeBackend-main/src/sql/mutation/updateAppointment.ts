import { Pool } from "pg";
import {
  UpdateAppointmentParams,
  UpdateAppointmentRow,
} from "./updateAppointment.type";

export async function executeUpdateAppointment(
  pool: Pool,
  params: UpdateAppointmentParams
): Promise<UpdateAppointmentRow | null> {
  const {
    id,
    userId,
    note,
    serviceId,
    startAt,
    endAt,
    paymentType,
    amount,
    isPaid,
  } = params;

  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (userId !== undefined) {
    updateFields.push(`user_id = $${paramIndex}`);
    values.push(userId);
    paramIndex++;
  }
  if (note !== undefined) {
    updateFields.push(`note = $${paramIndex}`);
    values.push(note);
    paramIndex++;
  }
  if (serviceId !== undefined) {
    updateFields.push(`service_id = $${paramIndex}`);
    values.push(serviceId);
    paramIndex++;
  }
  if (startAt !== undefined) {
    updateFields.push(`start_at = $${paramIndex}`);
    values.push(startAt);
    paramIndex++;
  }
  if (endAt !== undefined) {
    updateFields.push(`end_at = $${paramIndex}`);
    values.push(endAt);
    paramIndex++;
  }
  if (paymentType !== undefined) {
    updateFields.push(`payment_type = $${paramIndex}`);
    values.push(paymentType);
    paramIndex++;
  }
  if (amount !== undefined) {
    updateFields.push(`amount = $${paramIndex}`);
    values.push(amount);
    paramIndex++;
  }
  if (isPaid !== undefined) {
    updateFields.push(`is_paid = $${paramIndex}`);
    values.push(isPaid);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    
    const selectSql = `
      SELECT id, user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, created_at, updated_at
      FROM appointment
      WHERE id = $1
    `;
    const result = await pool.query<UpdateAppointmentRow>(selectSql, [id]);
    return result.rows[0] ?? null;
  }

  updateFields.push(`updated_at = NOW()`);

  values.push(id);

  const updateSql = `
    UPDATE appointment
    SET ${updateFields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, created_at, updated_at
  `;

  const result = await pool.query<UpdateAppointmentRow>(updateSql, values);
  return result.rows[0] ?? null;
}
