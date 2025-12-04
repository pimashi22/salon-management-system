import { Pool } from "pg";

export interface UserSalonInfo {
  salon_id: string;
  role_type: "salon_owner" | "salon_staff";
}

const GET_SALON_ID_BY_USER_ID_SQL = `
  SELECT 
    so.salon_id,
    'salon_owner' as role_type
  FROM salon_owner so
  WHERE so.user_id = $1
  
  UNION ALL
  
  SELECT 
    ss.salon_id,
    'salon_staff' as role_type
  FROM salon_staff ss
  WHERE ss.user_id = $1
`;

export async function executeGetSalonIdByUserId(
  pool: Pool,
  userId: string
): Promise<UserSalonInfo | null> {
  const result = await pool.query<UserSalonInfo>(GET_SALON_ID_BY_USER_ID_SQL, [
    userId,
  ]);
  return result.rows.length > 0 ? result.rows[0] : null;
}
