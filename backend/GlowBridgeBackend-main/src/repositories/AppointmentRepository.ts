import { Pool } from "pg";
import {
  Appointment,
  AppointmentWithRelations,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilterParams,
} from "../types/appointment";
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
export class AppointmentRepository {
  private pool: Pool;
  private tableName: string = "appointment";

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Appointment {
    return {
      id: row.id,
      user_id: row.user_id,
      note: row.note,
      service_id: row.service_id,
      start_at: row.start_at,
      end_at: row.end_at,
      payment_type: row.payment_type,
      amount: parseFloat(row.amount),
      is_paid: row.is_paid,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToEntityWithRelations(row: any): AppointmentWithRelations {
    return {
      id: row.id,
      user_id: row.user_id,
      note: row.note,
      service_id: row.service_id,
      start_at: row.start_at,
      end_at: row.end_at,
      payment_type: row.payment_type,
      amount: parseFloat(row.amount),
      is_paid: row.is_paid,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        first_name: row.user_first_name,
        last_name: row.user_last_name,
        email: row.user_email,
        contact_number: row.user_contact_number,
      },
      service: {
        id: row.service_id,
        name: row.service_name,
        description: row.service_description,
        duration: row.service_duration,
      },
    };
  }

  private getSelectFields(): string {
    return "id, user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, status, created_at, updated_at";
  }

  private getSelectFieldsWithRelations(): string {
    return `
      a.id, a.user_id, a.note, a.service_id, a.start_at, a.end_at, 
      a.payment_type, a.amount, a.is_paid, a.status, a.created_at, a.updated_at,
      u.first_name as user_first_name, u.last_name as user_last_name, 
      u.email as user_email, u.contact_number as user_contact_number,
      s.name as service_name, s.description as service_description, s.duration as service_duration
    `;
  }

  async findById(id: string): Promise<AppointmentWithRelations | null> {
    try {
      const query = `
        SELECT ${this.getSelectFieldsWithRelations()}
        FROM ${this.tableName} a
        LEFT JOIN "user" u ON a.user_id = u.id
        LEFT JOIN service s ON a.service_id = s.id
        WHERE a.id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntityWithRelations(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.tableName} by id`, error);
    }
  }

  async findAll(
    filters?: FilterParams,
    pagination?: PaginationParams,
    orderBy: string = "created_at DESC"
  ): Promise<PaginationResult<Appointment>> {
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
  async create(input: CreateAppointmentInput): Promise<Appointment> {
    try {
      const query = `
        INSERT INTO appointment (user_id, note, service_id, start_at, end_at, payment_type, amount, is_paid, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING ${this.getSelectFields()}
      `;

      const values = [
        input.userId,
        input.note,
        input.serviceId,
        input.startAt,
        input.endAt,
        input.paymentType,
        input.amount,
        input.isPaid || false,
        input.status || "upcoming",
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to create appointment", error);
    }
  }

  async update(
    id: string,
    input: UpdateAppointmentInput
  ): Promise<Appointment | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField =
          key === "userId"
            ? "user_id"
            : key === "serviceId"
            ? "service_id"
            : key === "startAt"
            ? "start_at"
            : key === "endAt"
            ? "end_at"
            : key === "paymentType"
            ? "payment_type"
            : key === "isPaid"
            ? "is_paid"
            : key === "status"
            ? "status"
            : key;

        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      });

      if (updateFields.length === 0) {
        
        return this.findById(id);
      }

      updateFields.push(`updated_at = NOW()`);

      values.push(id);

      const query = `
        UPDATE appointment
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
      throw new DatabaseError("Failed to update appointment", error);
    }
  }

  async findByUserId(userId: string): Promise<Appointment[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM appointment
        WHERE user_id = $1
        ORDER BY start_at DESC
      `;

      const result = await this.pool.query(query, [userId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find appointments by user ID", error);
    }
  }

  async findByServiceId(serviceId: string): Promise<Appointment[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM appointment
        WHERE service_id = $1
        ORDER BY start_at DESC
      `;

      const result = await this.pool.query(query, [serviceId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError(
        "Failed to find appointments by service ID",
        error
      );
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM appointment
        WHERE start_at >= $1 AND start_at <= $2
        ORDER BY start_at ASC
      `;

      const result = await this.pool.query(query, [startDate, endDate]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError(
        "Failed to find appointments by date range",
        error
      );
    }
  }

  async findAllWithFilters(
    filters: AppointmentFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<AppointmentWithRelations>> {
    try {
      const baseQuery = `
        SELECT ${this.getSelectFieldsWithRelations()} 
        FROM appointment a
        LEFT JOIN "user" u ON a.user_id = u.id
        LEFT JOIN service s ON a.service_id = s.id
      `;
      const { createQueryBuilder } = await import("../utils/queryBuilder");
      const { createPaginationResult } = await import("../utils/pagination");

      const whereConditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (filters.user_id) {
        whereConditions.push(`a.user_id = $${paramIndex}`);
        values.push(filters.user_id);
        paramIndex++;
      }
      if (filters.service_id) {
        whereConditions.push(`a.service_id = $${paramIndex}`);
        values.push(filters.service_id);
        paramIndex++;
      }
      if (filters.payment_type) {
        whereConditions.push(`a.payment_type = $${paramIndex}`);
        values.push(filters.payment_type);
        paramIndex++;
      }
      if (filters.is_paid !== undefined) {
        whereConditions.push(`a.is_paid = $${paramIndex}`);
        values.push(filters.is_paid);
        paramIndex++;
      }
      if (filters.status) {
        whereConditions.push(`a.status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
      }
      if (filters.start_at_from) {
        whereConditions.push(`a.start_at >= $${paramIndex}`);
        values.push(filters.start_at_from);
        paramIndex++;
      }
      if (filters.start_at_to) {
        whereConditions.push(`a.start_at <= $${paramIndex}`);
        values.push(filters.start_at_to);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? ` WHERE ${whereConditions.join(" AND ")}`
          : "";

      const countQuery = `SELECT COUNT(*) as total FROM appointment a${whereClause}`;
      const countResult = await this.pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total, 10);

      const orderBy = "a.start_at DESC";
      const offset = pagination ? (pagination.page - 1) * pagination.limit : 0;
      const limit = pagination?.limit || total;

      const dataQuery = `${baseQuery}${whereClause} ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${
        paramIndex + 1
      }`;
      const dataValues = [...values, limit, offset];

      const dataResult = await this.pool.query(dataQuery, dataValues);
      const entities = dataResult.rows.map((row) =>
        this.mapRowToEntityWithRelations(row)
      );

      return createPaginationResult(
        entities,
        total,
        pagination?.page || 1,
        pagination?.limit || entities.length
      );
    } catch (error) {
      throw new DatabaseError("Failed to find appointment records", error);
    }
  }

// inside AppointmentRepository class (src/repositories/AppointmentRepository.ts)
async findByServiceIdsWithRelations(
  serviceIds: string[],
  startAt?: Date,
  endAt?: Date
): Promise<AppointmentWithRelations[]> {
  try {
    if (!serviceIds || serviceIds.length === 0) return [];

    const values: any[] = [serviceIds];
    let paramIndex = 2;
    let dateClause = "";

    if (startAt) {
      dateClause += ` AND a.start_at >= $${paramIndex}`;
      values.push(startAt);
      paramIndex++;
    }
    if (endAt) {
      dateClause += ` AND a.start_at <= $${paramIndex}`;
      values.push(endAt);
      paramIndex++;
    }

    const query = `
      SELECT ${this.getSelectFieldsWithRelations()}
      FROM appointment a
      LEFT JOIN "user" u ON a.user_id = u.id
      LEFT JOIN service s ON a.service_id = s.id
      WHERE a.service_id = ANY($1)
      ${dateClause}
      ORDER BY a.start_at DESC
    `;

    const result = await this.pool.query(query, values);
    return result.rows.map((r) => this.mapRowToEntityWithRelations(r));
  } catch (error) {
    throw new DatabaseError("Failed to fetch appointments for services", error);
  }
}

// inside AppointmentRepository class
async findByPackageId(
  packageId: string,
  startAt?: Date,
  endAt?: Date
): Promise<AppointmentWithRelations[]> {
  try {
    // If appointment table has package_id column, this query will work.
    const values: any[] = [packageId];
    let paramIndex = 2;
    let dateClause = "";

    if (startAt) {
      dateClause += ` AND a.start_at >= $${paramIndex}`;
      values.push(startAt);
      paramIndex++;
    }
    if (endAt) {
      dateClause += ` AND a.start_at <= $${paramIndex}`;
      values.push(endAt);
      paramIndex++;
    }

    const query = `
      SELECT ${this.getSelectFieldsWithRelations()}
      FROM appointment a
      LEFT JOIN "user" u ON a.user_id = u.id
      LEFT JOIN service s ON a.service_id = s.id
      WHERE a.package_id = $1
      ${dateClause}
      ORDER BY a.start_at DESC
    `;

    const result = await this.pool.query(query, values);
    return result.rows.map((r) => this.mapRowToEntityWithRelations(r));
  } catch (error) {
    // Bubble up DB errors so service can fallback to service-based lookup if needed
    throw new DatabaseError("Failed to fetch appointments for package", error);
  }
}



}
