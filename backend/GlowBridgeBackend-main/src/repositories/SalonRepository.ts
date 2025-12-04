import { Pool } from "pg";
import {
  Salon,
  CreateSalonInput,
  UpdateSalonInput,
  SalonFilterParams,
} from "../types/salon";
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

export class SalonRepository {
  private pool: Pool;
  private tableName: string = "salon";

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Salon {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      bio: row.bio,
      location: row.location,
      contact_number: row.contact_number,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private getSelectFields(): string {
    return "id, name, type, bio, location, contact_number, status, created_at, updated_at";
  }

  async findById(id: string): Promise<Salon | null> {
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
  ): Promise<PaginationResult<Salon>> {
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

  async create(input: CreateSalonInput): Promise<Salon> {
    try {
      const query = `
        INSERT INTO salon (name, type, bio, location, contact_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${this.getSelectFields()}
      `;

      const values = [
        input.name,
        input.type,
        input.bio,
        input.location,
        input.contactNumber,
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to create salon", error);
    }
  }

  async update(id: string, input: UpdateSalonInput): Promise<Salon | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField = key === "contactNumber" ? "contact_number" : key;

        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      });

      if (updateFields.length === 0) {
        
        return this.findById(id);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      values.push(id);

      const query = `
        UPDATE salon
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
      throw new DatabaseError("Failed to update salon", error);
    }
  }

  async deactivate(id: string): Promise<Salon | null> {
    try {
      const query = `
        UPDATE salon
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING ${this.getSelectFields()}
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to deactivate salon", error);
    }
  }

  async findByLocation(location: string): Promise<Salon[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM salon
        WHERE location ILIKE $1
        ORDER BY name ASC
      `;

      const result = await this.pool.query(query, [`%${location}%`]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find salons by location", error);
    }
  }

  async findByType(type: string): Promise<Salon[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM salon
        WHERE type = $1
        ORDER BY name ASC
      `;

      const result = await this.pool.query(query, [type]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find salons by type", error);
    }
  }

  async findAllWithFilters(
    filters: SalonFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Salon>> {
    const orderBy = "name ASC";
    return this.findAll(filters, pagination, orderBy);
  }
}
