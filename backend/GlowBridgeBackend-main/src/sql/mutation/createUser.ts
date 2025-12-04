import { Pool } from "pg";
import { CreateUserParams, CreateUserRow } from "./createUser.type";

const INSERT_USER_SQL = `
  INSERT INTO "user" (first_name, last_name, email, contact_number, role)
  VALUES ($1, $2, $3, $4, COALESCE($5, 'customer'))
  RETURNING id, first_name, last_name, email, contact_number, role
`;

export async function executeCreateUser(
  pool: Pool,
  params: CreateUserParams
): Promise<CreateUserRow> {
  const { firstName, lastName, email, contactNumber, role } = params;
  const result = await pool.query<CreateUserRow>(INSERT_USER_SQL, [
    firstName,
    lastName,
    email,
    contactNumber,
    role ?? null,
  ]);
  return result.rows[0];
}
