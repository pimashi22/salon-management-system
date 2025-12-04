import { Pool } from "pg";
import {
  Product,
  ProductWithSalon,
  CreateProductInput,
  UpdateProductInput,
  ProductFilterParams,
} from "../types/product";
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

export class ProductRepository {
  private pool: Pool;
  private tableName: string = '"product"';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Product {
    return {
      id: row.id,
      salon_id: row.salon_id,
      name: row.name,
      description: row.description,
      price: row.price,
      available_quantity: row.available_quantity,
      is_public: row.is_public,
      discount: row.discount,
      image_url: row.image_url,
    };
  }

  private getSelectFields(): string {
    return "id, salon_id, name, description, price, available_quantity, is_public, discount, image_url";
  }

  async findById(id: string): Promise<Product | null> {
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
  ): Promise<PaginationResult<Product>> {
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

  async create(input: CreateProductInput): Promise<Product> {
    try {
      const query = `
        INSERT INTO "product" (salon_id, name, description, price, available_quantity, is_public, discount, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING ${this.getSelectFields()}
      `;

      const values = [
        input.salonId,
        input.name,
        input.description || null,
        input.price,
        input.availableQuantity,
        input.isPublic ?? true,
        input.discount ?? 0,
        input.imageUrl || null,
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to create product", error);
    }
  }

  async update(id: string, input: UpdateProductInput): Promise<Product | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField =
          key === "salonId"
            ? "salon_id"
            : key === "availableQuantity"
            ? "available_quantity"
            : key === "isPublic"
            ? "is_public"
            : key === "imageUrl"
            ? "image_url"
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
        UPDATE "product"
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
      throw new DatabaseError("Failed to update product", error);
    }
  }

  async findBySalonId(salonId: string): Promise<Product[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM "product"
        WHERE salon_id = $1
        ORDER BY name ASC
      `;

      const result = await this.pool.query(query, [salonId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find products by salon ID", error);
    }
  }

  async findPublicProducts(): Promise<ProductWithSalon[]> {
    try {
      const query = `
        SELECT 
          p.id, p.salon_id, p.name, p.description, p.price, 
          p.available_quantity, p.is_public, p.discount, p.image_url,
          s.name as salon_name,
          s.type as salon_type,
          s.location as salon_location
        FROM "product" p
        LEFT JOIN "salon" s ON p.salon_id = s.id
        WHERE p.is_public = true
        ORDER BY p.name ASC
      `;

      const result = await this.pool.query(query);
      return result.rows.map((row) => this.mapRowToEntityWithSalon(row));
    } catch (error) {
      throw new DatabaseError("Failed to find public products", error);
    }
  }

  private mapRowToEntityWithSalon(row: any): ProductWithSalon {
    return {
      id: row.id,
      salon_id: row.salon_id,
      name: row.name,
      description: row.description,
      price: row.price,
      available_quantity: row.available_quantity,
      is_public: row.is_public,
      discount: row.discount,
      image_url: row.image_url,
      salon_name: row.salon_name,
      salon_type: row.salon_type,
      salon_location: row.salon_location,
    };
  }

  async findAllWithFilters(
    filters: ProductFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Product>> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (filters.salon_id) {
        whereConditions.push(`salon_id = $${paramIndex}`);
        queryParams.push(filters.salon_id);
        paramIndex++;
      }

      if (filters.is_public !== undefined) {
        whereConditions.push(`is_public = $${paramIndex}`);
        queryParams.push(filters.is_public);
        paramIndex++;
      }

      if (filters.min_price !== undefined) {
        whereConditions.push(`price >= $${paramIndex}`);
        queryParams.push(filters.min_price);
        paramIndex++;
      }

      if (filters.max_price !== undefined) {
        whereConditions.push(`price <= $${paramIndex}`);
        queryParams.push(filters.max_price);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const countQuery = `SELECT COUNT(*) as total FROM "product" ${whereClause}`;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT ${this.getSelectFields()}
        FROM "product"
        ${whereClause}
        ORDER BY name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, productsResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: productsResult.rows.map((row) => this.mapRowToEntity(row)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError("Failed to find products with filters", error);
    }
  }
}
