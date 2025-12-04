import { Pool } from "pg";
import {
  StaffAvailability,
  CreateStaffAvailabilityInput,
  UpdateStaffAvailabilityInput,
  StaffAvailabilityFilterParams,
  StaffAvailabilityWithStaff,
  WeeklyAvailability,
} from "../types/staffAvailability";
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
export class StaffAvailabilityRepository {
  private pool: Pool;
  private tableName: string = '"staff_availability"';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): StaffAvailability {
    return {
      id: row.id,
      salon_staff_id: row.salon_staff_id,
      day_of_week: row.day_of_week,
      start_time: row.start_time,
      end_time: row.end_time,
      is_available: row.is_available,
    };
  }

  private getSelectFields(): string {
    return "id, salon_staff_id, day_of_week, start_time, end_time, is_available";
  }

  async findById(id: string): Promise<StaffAvailability | null> {
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
  ): Promise<PaginationResult<StaffAvailability>> {
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
  async create(
    input: CreateStaffAvailabilityInput
  ): Promise<StaffAvailability> {
    try {
      const query = `
        INSERT INTO "staff_availability" (salon_staff_id, day_of_week, start_time, end_time, is_available)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${this.getSelectFields()}
      `;

      const values = [
        input.salonStaffId,
        input.dayOfWeek,
        input.startTime,
        input.endTime,
        input.isAvailable ?? true,
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to create staff availability", error);
    }
  }

  async update(
    id: string,
    input: UpdateStaffAvailabilityInput
  ): Promise<StaffAvailability | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField =
          key === "salonStaffId"
            ? "salon_staff_id"
            : key === "dayOfWeek"
            ? "day_of_week"
            : key === "startTime"
            ? "start_time"
            : key === "endTime"
            ? "end_time"
            : key === "isAvailable"
            ? "is_available"
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
        UPDATE "staff_availability"
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
      throw new DatabaseError("Failed to update staff availability", error);
    }
  }

  async findBySalonStaffId(salonStaffId: string): Promise<StaffAvailability[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM "staff_availability"
        WHERE salon_staff_id = $1
        ORDER BY day_of_week ASC, start_time ASC
      `;

      const result = await this.pool.query(query, [salonStaffId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError(
        "Failed to find staff availability by salon staff ID",
        error
      );
    }
  }

  async findByDayOfWeek(dayOfWeek: number): Promise<StaffAvailability[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM "staff_availability"
        WHERE day_of_week = $1 AND is_available = true
        ORDER BY start_time ASC
      `;

      const result = await this.pool.query(query, [dayOfWeek]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError(
        "Failed to find staff availability by day of week",
        error
      );
    }
  }

  async findAvailabilityWithStaff(
    filters: StaffAvailabilityFilterParams = {}
  ): Promise<StaffAvailabilityWithStaff[]> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (filters.salon_staff_id) {
        whereConditions.push(`sa.salon_staff_id = $${paramIndex}`);
        queryParams.push(filters.salon_staff_id);
        paramIndex++;
      }

      if (filters.day_of_week !== undefined) {
        whereConditions.push(`sa.day_of_week = $${paramIndex}`);
        queryParams.push(filters.day_of_week);
        paramIndex++;
      }

      if (filters.is_available !== undefined) {
        whereConditions.push(`sa.is_available = $${paramIndex}`);
        queryParams.push(filters.is_available);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
        SELECT 
          sa.id,
          sa.salon_staff_id,
          sa.day_of_week,
          sa.start_time,
          sa.end_time,
          sa.is_available,
          u.first_name,
          u.last_name,
          u.email,
          u.contact_number,
          u.role,
          s.name as salon_name
        FROM "staff_availability" sa
        LEFT JOIN "salon_staff" ss ON sa.salon_staff_id = ss.id
        LEFT JOIN "user" u ON ss.user_id = u.id
        LEFT JOIN "salon" s ON ss.salon_id = s.id
        ${whereClause}
        ORDER BY sa.day_of_week ASC, sa.start_time ASC
      `;

      const result = await this.pool.query(query, queryParams);

      return result.rows.map((row) => ({
        id: row.id,
        salon_staff_id: row.salon_staff_id,
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        is_available: row.is_available,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        contact_number: row.contact_number,
        role: row.role,
        salon_name: row.salon_name,
      }));
    } catch (error) {
      throw new DatabaseError(
        "Failed to find staff availability with staff details",
        error
      );
    }
  }

  async findWeeklyAvailability(
    salonStaffId: string
  ): Promise<WeeklyAvailability> {
    try {
      const availabilityList = await this.findBySalonStaffId(salonStaffId);

      const staffQuery = `
        SELECT ss.name as staff_name
        FROM "salon_staff" ss
        WHERE ss.id = $1
      `;
      const staffResult = await this.pool.query(staffQuery, [salonStaffId]);
      const staffName = staffResult.rows[0]?.staff_name;

      const availability: { [key: number]: StaffAvailability[] } = {};

      availabilityList.forEach((item) => {
        if (!availability[item.day_of_week]) {
          availability[item.day_of_week] = [];
        }
        availability[item.day_of_week].push(item);
      });

      return {
        salon_staff_id: salonStaffId,
        staff_name: staffName,
        availability,
      };
    } catch (error) {
      throw new DatabaseError("Failed to get weekly availability", error);
    }
  }

  async deleteByStaffId(salonStaffId: string): Promise<void> {
    try {
      const query = `DELETE FROM "staff_availability" WHERE salon_staff_id = $1`;
      await this.pool.query(query, [salonStaffId]);
    } catch (error) {
      throw new DatabaseError("Failed to delete staff availability", error);
    }
  }

  async deleteBySalonStaffAndDay(
    salonStaffId: string,
    dayOfWeek: number
  ): Promise<boolean> {
    try {
      const query = `
        DELETE FROM "staff_availability" 
        WHERE salon_staff_id = $1 AND day_of_week = $2
        RETURNING id
      `;

      const result = await this.pool.query(query, [salonStaffId, dayOfWeek]);
      return result.rows.length > 0;
    } catch (error) {
      throw new DatabaseError(
        "Failed to delete staff availability for specific day",
        error
      );
    }
  }

  async createBulk(
    availabilityList: CreateStaffAvailabilityInput[]
  ): Promise<StaffAvailability[]> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const results: StaffAvailability[] = [];

      for (const availability of availabilityList) {
        const query = `
          INSERT INTO "staff_availability" (salon_staff_id, day_of_week, start_time, end_time, is_available)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING ${this.getSelectFields()}
        `;

        const values = [
          availability.salonStaffId,
          availability.dayOfWeek,
          availability.startTime,
          availability.endTime,
          availability.isAvailable ?? true,
        ];

        const result = await client.query(query, values);
        results.push(this.mapRowToEntity(result.rows[0]));
      }

      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      throw new DatabaseError(
        "Failed to create bulk staff availability",
        error
      );
    } finally {
      client.release();
    }
  }

  async searchAvailability(
    searchParams: {
      staff_name?: string;
      salon_name?: string;
      day_of_week?: number;
      time_start?: string;
      time_end?: string;
      is_available?: boolean;
    } = {},
    pagination?: any
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (searchParams.staff_name) {
        whereConditions.push(`ss.name ILIKE $${paramIndex}`);
        queryParams.push(`%${searchParams.staff_name}%`);
        paramIndex++;
      }

      if (searchParams.salon_name) {
        whereConditions.push(`s.name ILIKE $${paramIndex}`);
        queryParams.push(`%${searchParams.salon_name}%`);
        paramIndex++;
      }

      if (searchParams.day_of_week !== undefined) {
        whereConditions.push(`sa.day_of_week = $${paramIndex}`);
        queryParams.push(searchParams.day_of_week);
        paramIndex++;
      }

      if (searchParams.time_start && searchParams.time_end) {
        whereConditions.push(
          `(sa.start_time <= $${paramIndex} AND sa.end_time >= $${
            paramIndex + 1
          })`
        );
        queryParams.push(searchParams.time_end, searchParams.time_start);
        paramIndex += 2;
      } else if (searchParams.time_start) {
        whereConditions.push(`sa.end_time >= $${paramIndex}`);
        queryParams.push(searchParams.time_start);
        paramIndex++;
      } else if (searchParams.time_end) {
        whereConditions.push(`sa.start_time <= $${paramIndex}`);
        queryParams.push(searchParams.time_end);
        paramIndex++;
      }

      if (searchParams.is_available !== undefined) {
        whereConditions.push(`sa.is_available = $${paramIndex}`);
        queryParams.push(searchParams.is_available);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const countQuery = `
        SELECT COUNT(*) as total 
        FROM "staff_availability" sa
        LEFT JOIN "salon_staff" ss ON sa.salon_staff_id = ss.id
        LEFT JOIN "salon" s ON ss.salon_id = s.id
        ${whereClause}
      `;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT 
          sa.id,
          sa.salon_staff_id,
          sa.day_of_week,
          sa.start_time,
          sa.end_time,
          sa.is_available,
          ss.name as staff_name,
          ss.email as staff_email,
          s.name as salon_name,
          s.id as salon_id
        FROM "staff_availability" sa
        LEFT JOIN "salon_staff" ss ON sa.salon_staff_id = ss.id
        LEFT JOIN "salon" s ON ss.salon_id = s.id
        ${whereClause}
        ORDER BY sa.day_of_week ASC, sa.start_time ASC, ss.name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, searchResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: searchResult.rows.map((row) => ({
          id: row.id,
          salon_staff_id: row.salon_staff_id,
          day_of_week: row.day_of_week,
          start_time: row.start_time,
          end_time: row.end_time,
          is_available: row.is_available,
          staff_name: row.staff_name,
          staff_email: row.staff_email,
          salon_name: row.salon_name,
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError("Failed to search staff availability", error);
    }
  }

  async searchAvailableStaff(
    searchParams: {
      day_of_week: number;
      time_start: string;
      time_end: string;
      staff_name?: string;
      salon_name?: string;
    },
    pagination?: any
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    try {
      const whereConditions: string[] = [
        "sa.is_available = true",
        "sa.day_of_week = $1",
        "(sa.start_time <= $2 AND sa.end_time >= $3)",
      ];
      const queryParams: any[] = [
        searchParams.day_of_week,
        searchParams.time_end,
        searchParams.time_start,
      ];
      let paramIndex = 4;

      if (searchParams.staff_name) {
        whereConditions.push(`ss.name ILIKE $${paramIndex}`);
        queryParams.push(`%${searchParams.staff_name}%`);
        paramIndex++;
      }

      if (searchParams.salon_name) {
        whereConditions.push(`s.name ILIKE $${paramIndex}`);
        queryParams.push(`%${searchParams.salon_name}%`);
        paramIndex++;
      }

      const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

      const countQuery = `
        SELECT COUNT(*) as total 
        FROM "staff_availability" sa
        LEFT JOIN "salon_staff" ss ON sa.salon_staff_id = ss.id
        LEFT JOIN "salon" s ON ss.salon_id = s.id
        ${whereClause}
      `;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT 
          sa.id,
          sa.salon_staff_id,
          sa.day_of_week,
          sa.start_time,
          sa.end_time,
          sa.is_available,
          ss.name as staff_name,
          ss.email as staff_email,
          s.name as salon_name,
          s.id as salon_id
        FROM "staff_availability" sa
        LEFT JOIN "salon_staff" ss ON sa.salon_staff_id = ss.id
        LEFT JOIN "salon" s ON ss.salon_id = s.id
        ${whereClause}
        ORDER BY sa.start_time ASC, ss.name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, searchResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: searchResult.rows.map((row) => ({
          id: row.id,
          salon_staff_id: row.salon_staff_id,
          day_of_week: row.day_of_week,
          start_time: row.start_time,
          end_time: row.end_time,
          is_available: row.is_available,
          staff_name: row.staff_name,
          staff_email: row.staff_email,
          salon_name: row.salon_name,
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError("Failed to search available staff", error);
    }
  }

  async findAllWithFilters(
    filters: StaffAvailabilityFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<StaffAvailability>> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (filters.salon_staff_id) {
        whereConditions.push(`salon_staff_id = $${paramIndex}`);
        queryParams.push(filters.salon_staff_id);
        paramIndex++;
      }

      if (filters.day_of_week !== undefined) {
        whereConditions.push(`day_of_week = $${paramIndex}`);
        queryParams.push(filters.day_of_week);
        paramIndex++;
      }

      if (filters.is_available !== undefined) {
        whereConditions.push(`is_available = $${paramIndex}`);
        queryParams.push(filters.is_available);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const countQuery = `SELECT COUNT(*) as total FROM "staff_availability" ${whereClause}`;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT ${this.getSelectFields()}
        FROM "staff_availability"
        ${whereClause}
        ORDER BY day_of_week ASC, start_time ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, availabilityResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: availabilityResult.rows.map((row) => this.mapRowToEntity(row)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError(
        "Failed to find staff availability with filters",
        error
      );
    }
  }
}
