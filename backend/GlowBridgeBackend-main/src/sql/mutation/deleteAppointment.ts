import { Pool } from "pg";

const DELETE_APPOINTMENT_SQL = `
  DELETE FROM appointment
  WHERE id = $1
`;

export async function executeDeleteAppointment(
  pool: Pool,
  id: string
): Promise<void> {
  await pool.query(DELETE_APPOINTMENT_SQL, [id]);
}
