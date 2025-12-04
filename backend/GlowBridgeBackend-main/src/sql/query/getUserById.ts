import { Pool } from "pg";
import { CreateUserRow } from "../mutation/createUser.type";

const GET_USER_SQL = `
  SELECT id, first_name, last_name, email, contact_number, role
  FROM "user"
  WHERE id = $1
`;

export async function executeGetUserById(
  pool: Pool,
  id: string
): Promise<CreateUserRow | null> {
  const result = await pool.query<CreateUserRow>(GET_USER_SQL, [id]);
  return result.rows[0] ?? null;
}
