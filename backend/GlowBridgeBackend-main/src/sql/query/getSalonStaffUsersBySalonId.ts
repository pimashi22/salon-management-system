import { Pool } from "pg";
import { CreateUserRow } from "../mutation/createUser.type";

const GET_SALON_STAFF_USERS_BY_SALON_ID_SQL = `
  SELECT 
    u.id, 
    u.first_name, 
    u.last_name, 
    u.email, 
    u.contact_number, 
    u.role,
    u.firebase_uid
  FROM "user" u
  INNER JOIN salon_staff ss ON u.id = ss.user_id
  WHERE ss.salon_id = $1 AND u.role = 'salon_staff'
  ORDER BY u.first_name ASC, u.last_name ASC
`;

export async function executeGetSalonStaffUsersBySalonId(
  pool: Pool,
  salonId: string
): Promise<CreateUserRow[]> {
  const result = await pool.query<CreateUserRow>(
    GET_SALON_STAFF_USERS_BY_SALON_ID_SQL,
    [salonId]
  );
  return result.rows;
}
