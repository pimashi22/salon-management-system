import { Pool } from "pg";
import {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceFilterParams,
  ServiceWithCategories,
} from "../types/service";
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
export class ServiceRepository {
  private pool: Pool;
  private tableName: string = "service";

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Service {
    return {
      id: row.id,
      salon_id: row.salon_id,
      is_completed: row.is_completed,
      name: row.name,
      description: row.description,
      duration: row.duration,
      price: row.price,
      is_public: row.is_public,
      discount: row.discount,
    };
  }

  private getSelectFields(): string {
    return "id, salon_id, is_completed, name, description, duration, price, is_public, discount";
  }

  async findById(id: string): Promise<Service | null> {
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
  ): Promise<PaginationResult<Service>> {
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
  async create(input: CreateServiceInput): Promise<Service> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const serviceQuery = `
        INSERT INTO service (salon_id, is_completed, name, description, duration, price, is_public, discount)
        VALUES ($1, COALESCE($2, false), $3, $4, $5, $6, $7, COALESCE($8, 0))
        RETURNING ${this.getSelectFields()}
      `;

      const serviceValues = [
        input.salonId,
        input.isCompleted ?? null,
        input.name,
        input.description,
        input.duration,
        input.price ?? null,
        input.isPublic,
        input.discount ?? null,
      ];

      const serviceResult = await client.query(serviceQuery, serviceValues);
      const service = this.mapRowToEntity(serviceResult.rows[0]);

      if (input.categoryIds && input.categoryIds.length > 0) {
        const categoryQuery = `
          INSERT INTO service_category (category_id, service_id)
          VALUES ($1, $2)
        `;

        for (const categoryId of input.categoryIds) {
          await client.query(categoryQuery, [categoryId, service.id]);
        }
      }

      await client.query("COMMIT");
      return service;
    } catch (error) {
      await client.query("ROLLBACK");
      throw new DatabaseError("Failed to create service", error);
    } finally {
      client.release();
    }
  }

  async update(id: string, input: UpdateServiceInput): Promise<Service | null> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || key === "categoryIds" || value === undefined)
          return;

        const dbField =
          key === "salonId"
            ? "salon_id"
            : key === "isCompleted"
            ? "is_completed"
            : key === "isPublic"
            ? "is_public"
            : key;

        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      });

      let service: Service | null = null;

      if (updateFields.length > 0) {
        
        values.push(id);

        const serviceQuery = `
          UPDATE service
          SET ${updateFields.join(", ")}
          WHERE id = $${paramIndex}
          RETURNING ${this.getSelectFields()}
        `;

        const result = await client.query(serviceQuery, values);
        service = result.rows[0] ? this.mapRowToEntity(result.rows[0]) : null;
      } else {
        
        service = await this.findById(id);
      }

      if (input.categoryIds !== undefined && service) {
        
        await client.query(
          "DELETE FROM service_category WHERE service_id = $1",
          [id]
        );

        if (input.categoryIds.length > 0) {
          const categoryQuery = `
            INSERT INTO service_category (category_id, service_id)
            VALUES ($1, $2)
          `;

          for (const categoryId of input.categoryIds) {
            await client.query(categoryQuery, [categoryId, id]);
          }
        }
      }

      await client.query("COMMIT");
      return service;
    } catch (error) {
      await client.query("ROLLBACK");
      throw new DatabaseError("Failed to update service", error);
    } finally {
      client.release();
    }
  }

  async findAllWithFilters(
    filters: ServiceFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Service>> {
    
    if (filters.search) {
      return this.findAllWithSearch(filters, pagination);
    }

    const orderBy = "name ASC";
    return this.findAll(filters, pagination, orderBy);
  }

  private async findAllWithSearch(
    filters: ServiceFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Service>> {
    try {
      const { search, salon_id, is_completed, is_public, category_id } =
        filters;
      const whereClauses: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (search) {
        whereClauses.push(
          `(s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`
        );
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (salon_id) {
        whereClauses.push(`s.salon_id = $${paramIndex}`);
        queryParams.push(salon_id);
        paramIndex++;
      }

      if (is_completed !== undefined) {
        whereClauses.push(`s.is_completed = $${paramIndex}`);
        queryParams.push(is_completed);
        paramIndex++;
      }

      if (is_public !== undefined) {
        whereClauses.push(`s.is_public = $${paramIndex}`);
        queryParams.push(is_public);
        paramIndex++;
      }

      if (category_id) {
        whereClauses.push(`EXISTS (
          SELECT 1 FROM service_category sc 
          WHERE sc.service_id = s.id AND sc.category_id = $${paramIndex}
        )`);
        queryParams.push(category_id);
        paramIndex++;
      }

      const whereClause =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countQuery = `SELECT COUNT(DISTINCT s.id) as total FROM service s ${whereClause}`;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT DISTINCT ${this.getSelectFields()
          .split(", ")
          .map((field) => `s.${field.trim()}`)
          .join(", ")}
        FROM service s
        ${whereClause}
        ORDER BY s.name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, servicesResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      const entities = servicesResult.rows.map((row) =>
        this.mapRowToEntity(row)
      );

      return {
        data: entities,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError("Failed to search services", error);
    }
  }

  async findByIdWithCategories(
    id: string
  ): Promise<ServiceWithCategories | null> {
    try {
      const serviceQuery = `
        SELECT ${this.getSelectFields()}
        FROM service
        WHERE id = $1
      `;

      const categoriesQuery = `
        SELECT c.id, c.name, c.description
        FROM category c
        INNER JOIN service_category sc ON c.id = sc.category_id
        WHERE sc.service_id = $1
        ORDER BY c.name ASC
      `;

      const [serviceResult, categoriesResult] = await Promise.all([
        this.pool.query(serviceQuery, [id]),
        this.pool.query(categoriesQuery, [id]),
      ]);

      const service = serviceResult.rows[0];
      if (!service) {
        return null;
      }

      return {
        ...this.mapRowToEntity(service),
        categories: categoriesResult.rows,
      };
    } catch (error) {
      throw new DatabaseError("Failed to find service with categories", error);
    }
  }

  async findAllWithCategories(
    filters: ServiceFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<ServiceWithCategories>> {
    try {
      
      const servicesResult = await this.findAllWithFilters(filters, pagination);

      if (servicesResult.data.length === 0) {
        return {
          ...servicesResult,
          data: [],
        };
      }

      const serviceIds = servicesResult.data.map((s) => s.id);
      const categoriesQuery = `
        SELECT sc.service_id, c.id, c.name, c.description
        FROM category c
        INNER JOIN service_category sc ON c.id = sc.category_id
        WHERE sc.service_id = ANY($1)
        ORDER BY sc.service_id, c.name ASC
      `;

      const categoriesResult = await this.pool.query(categoriesQuery, [
        serviceIds,
      ]);

      const categoriesByService = categoriesResult.rows.reduce(
        (acc: any, cat: any) => {
          if (!acc[cat.service_id]) {
            acc[cat.service_id] = [];
          }
          acc[cat.service_id].push({
            id: cat.id,
            name: cat.name,
            description: cat.description,
          });
          return acc;
        },
        {}
      );

      const servicesWithCategories = servicesResult.data.map((service) => ({
        ...service,
        categories: categoriesByService[service.id] || [],
      }));

      return {
        ...servicesResult,
        data: servicesWithCategories,
      };
    } catch (error) {
      throw new DatabaseError("Failed to find services with categories", error);
    }
  }

  async findBySalonId(salonId: string): Promise<Service[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM service
        WHERE salon_id = $1
        ORDER BY name ASC
      `;

      const result = await this.pool.query(query, [salonId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find services by salon ID", error);
    }
  }

  async findByCategoryId(categoryId: number): Promise<Service[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()
          .split(", ")
          .map((field) => `s.${field.trim()}`)
          .join(", ")}
        FROM service s
        INNER JOIN service_category sc ON s.id = sc.service_id
        WHERE sc.category_id = $1
        ORDER BY s.name ASC
      `;

      const result = await this.pool.query(query, [categoryId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find services by category ID", error);
    }
  }
}
