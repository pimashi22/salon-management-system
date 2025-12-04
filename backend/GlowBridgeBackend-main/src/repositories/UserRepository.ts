import { Pool } from "pg";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilterParams,
} from "../types/user";
import {
  PaginationParams,
  PaginationResult,
  FilterParams,
} from "../types/common";
import { DatabaseError } from "../utils/errors";
import {
  createPaginationResult,
  getPaginationOffset,
} from "../utils/pagination";
import { createQueryBuilder } from "../utils/queryBuilder";
import { executeGetSalonStaffUsersBySalonId } from "../sql/query/getSalonStaffUsersBySalonId";

export class UserRepository {
  private pool: Pool;
  private tableName: string = '"user"';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): User {
    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      contact_number: row.contact_number,
      role: row.role,
      firebase_uid: row.firebase_uid,
    };
  }

  private getSelectFields(): string {
    return "id, first_name, last_name, email, contact_number, role, firebase_uid";
  }

  async findById(id: string): Promise<User | null> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM ${this.tableName}
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.tableName} by id`, error);
    }
  }

  async findAll(
    filters?: FilterParams,
    pagination?: PaginationParams,
    orderBy: string = "created_at DESC"
  ): Promise<PaginationResult<User>> {
    try {
      const baseQuery = `SELECT ${this.getSelectFields()} FROM ${
        this.tableName
      }`;
      const builder = createQueryBuilder(baseQuery);

      if (filters) {
        builder.addFilters(filters);
      }

      if (pagination) {
        builder.addPagination(pagination);
      }

      const countQuery = builder.buildCountQuery(this.tableName);
      const dataQuery = builder.buildPaginatedQuery(orderBy);

      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery.text, countQuery.values),
        this.pool.query(dataQuery.text, dataQuery.values),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const entities = dataResult.rows.map((row) => this.mapRowToEntity(row));

      return createPaginationResult(
        entities,
        total,
        pagination?.page || 1,
        pagination?.limit || entities.length
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to find ${this.tableName} records`,
        error
      );
    }
  }

  async deleteById(id: string): Promise<string | null> {
    try {
      const query = `
        DELETE FROM ${this.tableName}
        WHERE id = $1
        RETURNING id
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].id;
    } catch (error) {
      throw new DatabaseError(`Failed to delete ${this.tableName}`, error);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1 FROM ${this.tableName}
        WHERE id = $1
        LIMIT 1
      `;

      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw new DatabaseError(
        `Failed to check ${this.tableName} existence`,
        error
      );
    }
  }

  private async executeQuery<R = any>(
    query: string,
    params: any[] = []
  ): Promise<R[]> {
    try {
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new DatabaseError("Query execution failed", error);
    }
  }

  private async executeQuerySingle<R = any>(
    query: string,
    params: any[] = []
  ): Promise<R | null> {
    const rows = await this.executeQuery<R>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const query = `
        INSERT INTO "user" (first_name, last_name, email, contact_number, role, firebase_uid)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING ${this.getSelectFields()}
      `;

      const values = [
        input.firstName,
        input.lastName,
        input.email,
        input.contactNumber,
        input.role,
        input.firebaseUid || null,
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to create user", error);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField =
          key === "firstName"
            ? "first_name"
            : key === "lastName"
            ? "last_name"
            : key === "contactNumber"
            ? "contact_number"
            : key === "firebaseUid"
            ? "firebase_uid"
            : key;

        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      });

      if (updateFields.length === 0) {
        return this.findById(id);
      }

      values.push(id);

      const query = `
        UPDATE "user"
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING ${this.getSelectFields()}
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to update user", error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM "user"
        WHERE email = $1
      `;

      const result = await this.pool.query(query, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to find user by email", error);
    }
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM "user"
        WHERE firebase_uid = $1
      `;

      const result = await this.pool.query(query, [firebaseUid]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to find user by Firebase UID", error);
    }
  }

  async findAllWithFilters(
    filters: UserFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<User>> {
    const orderBy = "first_name ASC, last_name ASC";
    return this.findAll(filters, pagination, orderBy);
  }

  async findSalonStaffBySalonId(salonId: string): Promise<User[]> {
    try {
      const rows = await executeGetSalonStaffUsersBySalonId(this.pool, salonId);
      return rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find salon staff by salon ID", error);
    }
  }
}
