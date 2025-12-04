import { Pool } from "pg";
import { UpdateUserParams } from "./updateUser.type";
import { CreateUserRow } from "./createUser.type";

const UPDATE_USER_SQL = `
  UPDATE "user"
  SET
    first_name = COALESCE($2, first_name),
    last_name = COALESCE($3, last_name),
    email = COALESCE($4, email),
    contact_number = COALESCE($5, contact_number),
    role = COALESCE($6, role)
  WHERE id = $1
  RETURNING id, first_name, last_name, email, contact_number, role
`;

export async function executeUpdateUser(
  pool: Pool,
  params: UpdateUserParams
): Promise<CreateUserRow | null> {
  const { id, firstName, lastName, email, contactNumber, role } = params;
  const result = await pool.query<CreateUserRow>(UPDATE_USER_SQL, [
    id,
    firstName ?? null,
    lastName ?? null,
    email ?? null,
    contactNumber ?? null,
    role ?? null,
  ]);
  return result.rows[0] ?? null;
}
