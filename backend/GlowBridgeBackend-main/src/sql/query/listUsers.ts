import { Pool } from "pg";
import { CreateUserRow } from "../mutation/createUser.type";
import { UserRole } from "../../constraint";

export interface ListUsersFilters {
  role?: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ListUsersParams extends ListUsersFilters, PaginationParams {}

export interface ListUsersResult {
  users: CreateUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIST_USERS_SQL = `
  SELECT id, first_name, last_name, email, contact_number, role
  FROM "user"
  ORDER BY first_name ASC, last_name ASC
`;

const LIST_USERS_BY_SALON_SQL = `
  SELECT id, first_name, last_name, email, contact_number, role
  FROM "user"
  WHERE salon_id = $1
  ORDER BY first_name ASC, last_name ASC
`;

export async function executeListUsers(
  pool: Pool,
  params: ListUsersParams
): Promise<ListUsersResult> {
  const { role, page, limit } = params;

  let whereClause = "";
  let countQuery = 'SELECT COUNT(*) as total FROM "user"';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (role) {
    whereClause = `WHERE role = $${paramIndex}`;
    countQuery += ` WHERE role = $${paramIndex}`;
    queryParams.push(role);
    paramIndex++;
  }

  const offset = (page - 1) * limit;

  let mainQuery = `
    SELECT id, first_name, last_name, email, contact_number, role
    FROM "user"
    ${whereClause}
    ORDER BY first_name ASC, last_name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  queryParams.push(limit, offset);

  const [countResult, usersResult] = await Promise.all([
    pool.query<{ total: string }>(countQuery, role ? [role] : []),
    pool.query<CreateUserRow>(mainQuery, queryParams),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return {
    users: usersResult.rows,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function executeListUsersBySalonId(
  pool: Pool,
  salonId: string
): Promise<CreateUserRow[]> {
  const result = await pool.query<CreateUserRow>(LIST_USERS_BY_SALON_SQL, [
    salonId,
  ]);
  return result.rows;
}
