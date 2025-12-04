import { Pool } from "pg";

export interface CreateSalonOwnerParams {
  salonId: string;
  userId: string;
}

export interface CreateSalonOwnerRow {
  id: string;
  salon_id: string;
  user_id: string;
}

const INSERT_SALON_OWNER_SQL = `
  INSERT INTO salon_owner (salon_id, user_id)
  VALUES ($1, $2)
  RETURNING id, salon_id, user_id
`;

export async function executeCreateSalonOwner(
  pool: Pool,
  params: CreateSalonOwnerParams
): Promise<CreateSalonOwnerRow> {
  const { salonId, userId } = params;
  const result = await pool.query<CreateSalonOwnerRow>(INSERT_SALON_OWNER_SQL, [
    salonId,
    userId,
  ]);
  return result.rows[0];
}
