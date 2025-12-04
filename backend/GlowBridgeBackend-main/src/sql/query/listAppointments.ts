import { Pool } from "pg";
import { CreateAppointmentRow } from "../mutation/createAppointment.type";

const LIST_APPOINTMENTS_BASE_SQL = `
  SELECT id, user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, created_at, updated_at
  FROM appointment
`;

const COUNT_APPOINTMENTS_BASE_SQL = `
  SELECT COUNT(*) as total
  FROM appointment
`;

export interface ListAppointmentsParams {
  userId?: string;
  serviceId?: string;
  paymentType?: string;
  isPaid?: boolean;
  startAtFrom?: Date;
  startAtTo?: Date;
  page: number;
  limit: number;
}

export interface ListAppointmentsResult {
  data: CreateAppointmentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function executeListAppointments(
  pool: Pool,
  params: ListAppointmentsParams
): Promise<ListAppointmentsResult> {
  const {
    userId,
    serviceId,
    paymentType,
    isPaid,
    startAtFrom,
    startAtTo,
    page,
    limit,
  } = params;

  const whereConditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (userId) {
    whereConditions.push(`user_id = $${paramIndex}`);
    values.push(userId);
    paramIndex++;
  }
  if (serviceId) {
    whereConditions.push(`service_id = $${paramIndex}`);
    values.push(serviceId);
    paramIndex++;
  }
  if (paymentType) {
    whereConditions.push(`payment_type = $${paramIndex}`);
    values.push(paymentType);
    paramIndex++;
  }
  if (isPaid !== undefined) {
    whereConditions.push(`is_paid = $${paramIndex}`);
    values.push(isPaid);
    paramIndex++;
  }
  if (startAtFrom) {
    whereConditions.push(`start_at >= $${paramIndex}`);
    values.push(startAtFrom);
    paramIndex++;
  }
  if (startAtTo) {
    whereConditions.push(`start_at <= $${paramIndex}`);
    values.push(startAtTo);
    paramIndex++;
  }

  const whereClause =
    whereConditions.length > 0 ? ` WHERE ${whereConditions.join(" AND ")}` : "";

  const countSql = COUNT_APPOINTMENTS_BASE_SQL + whereClause;
  const countResult = await pool.query(countSql, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const offset = (page - 1) * limit;
  const dataSql =
    LIST_APPOINTMENTS_BASE_SQL +
    whereClause +
    ` ORDER BY start_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  const dataValues = [...values, limit, offset];

  const dataResult = await pool.query<CreateAppointmentRow>(
    dataSql,
    dataValues
  );

  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
    totalPages,
  };
}
