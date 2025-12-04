import { Pool } from "pg";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilterParams,
  CategoryWithServices,
} from "../types/category";
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

export class CategoryRepository {
  private pool: Pool;
  private tableName: string = "category";

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Category {
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      is_active: row.is_active,
    };
  }

  private getSelectFields(): string {
    return "id, name, description, is_active";
  }

  async findAll(
    filters?: FilterParams,
    pagination?: PaginationParams,
    orderBy: string = "created_at DESC"
  ): Promise<PaginationResult<Category>> {
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

  async create(input: CreateCategoryInput): Promise<Category> {
    try {
      const query = `
        INSERT INTO category (name, description, is_active)
        VALUES ($1, $2, COALESCE($3, true))
        RETURNING ${this.getSelectFields()}
      `;

      const values = [
        input.name,
        input.description || null,
        input.isActive ?? null,
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to create category", error);
    }
  }

  async update(
    id: string,
    input: UpdateCategoryInput
  ): Promise<Category | null> {
    try {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        throw new Error("Invalid category ID");
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField = key === "isActive" ? "is_active" : key;

        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      });

      if (updateFields.length === 0) {
        return this.findById(id);
      }

      values.push(categoryId);

      const query = `
        UPDATE category
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
      throw new DatabaseError("Failed to update category", error);
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        return null;
      }

      const query = `
        SELECT ${this.getSelectFields()}
        FROM category
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [categoryId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to find category by id", error);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        return false;
      }

      const query = `
        SELECT 1 FROM category
        WHERE id = $1
        LIMIT 1
      `;

      const result = await this.pool.query(query, [categoryId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new DatabaseError("Failed to check category existence", error);
    }
  }

  async deleteById(id: string): Promise<string | null> {
    try {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        return null;
      }

      const query = `
        DELETE FROM category
        WHERE id = $1
        RETURNING id
      `;

      const result = await this.pool.query(query, [categoryId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].id.toString();
    } catch (error) {
      throw new DatabaseError("Failed to delete category", error);
    }
  }

  async findAllWithFilters(
    filters: CategoryFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Category>> {
    if (filters.search) {
      return this.findAllWithSearch(filters, pagination);
    }

    const orderBy = "name ASC";
    return this.findAll(filters, pagination, orderBy);
  }

  private async findAllWithSearch(
    filters: CategoryFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Category>> {
    try {
      const { search, is_active } = filters;
      const whereClauses: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (search) {
        whereClauses.push(
          `(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
        );
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (is_active !== undefined) {
        whereClauses.push(`is_active = $${paramIndex}`);
        queryParams.push(is_active);
        paramIndex++;
      }

      const whereClause =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countQuery = `SELECT COUNT(*) as total FROM category ${whereClause}`;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT ${this.getSelectFields()}
        FROM category
        ${whereClause}
        ORDER BY name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, categoriesResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      const entities = categoriesResult.rows.map((row) =>
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
      throw new DatabaseError("Failed to search categories", error);
    }
  }

  async findByName(name: string): Promise<Category | null> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM category
        WHERE name = $1
      `;

      const result = await this.pool.query(query, [name]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      throw new DatabaseError("Failed to find category by name", error);
    }
  }

  async findCategoriesWithServicesBySalonId(
    salonId: string,
    filters: CategoryFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<CategoryWithServices>> {
    try {
      const { search, is_active } = filters;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      // Separate parameters for count and main queries
      const countQueryParams: any[] = [];
      const mainQueryParams: any[] = [salonId]; // salon_id is $1 in main query

      let countParamIndex = 1;
      let mainParamIndex = 2; // Start from $2 since $1 is salon_id

      // Build WHERE clauses
      const countWhereClauses: string[] = [];
      const mainWhereClauses: string[] = [];

      if (search) {
        countWhereClauses.push(
          `(c.name ILIKE $${countParamIndex} OR c.description ILIKE $${countParamIndex})`
        );
        mainWhereClauses.push(
          `(c.name ILIKE $${mainParamIndex} OR c.description ILIKE $${mainParamIndex})`
        );
        countQueryParams.push(`%${search}%`);
        mainQueryParams.push(`%${search}%`);
        countParamIndex++;
        mainParamIndex++;
      }

      if (is_active !== undefined) {
        countWhereClauses.push(`c.is_active = $${countParamIndex}`);
        mainWhereClauses.push(`c.is_active = $${mainParamIndex}`);
        countQueryParams.push(is_active);
        mainQueryParams.push(is_active);
        countParamIndex++;
        mainParamIndex++;
      }

      const countWhereClause =
        countWhereClauses.length > 0
          ? `WHERE ${countWhereClauses.join(" AND ")}`
          : "";

      const mainWhereClause =
        mainWhereClauses.length > 0
          ? `WHERE ${mainWhereClauses.join(" AND ")}`
          : "";

      // Count query for pagination - count all categories that match filters
      const countQuery = `
        SELECT COUNT(*) as total
        FROM category c
        ${countWhereClause}
      `;

      // Main query - get all categories with their services filtered by salon_id
      const mainQuery = `
        SELECT 
          c.id as category_id,
          c.name as category_name,
          c.description as category_description,
          c.is_active as category_is_active,
          s.id as service_id,
          s.salon_id as service_salon_id,
          s.name as service_name,
          s.description as service_description,
          s.duration as service_duration,
          s.price as service_price,
          s.is_public as service_is_public,
          s.discount as service_discount,
          s.is_completed as service_is_completed
        FROM category c
        LEFT JOIN service_category sc ON c.id = sc.category_id
        LEFT JOIN service s ON sc.service_id = s.id AND s.salon_id = $1
        ${mainWhereClause}
        ORDER BY c.name ASC, s.name ASC NULLS LAST
        LIMIT $${mainParamIndex} OFFSET $${mainParamIndex + 1}
      `;

      const paginationParams = [...mainQueryParams, limit, offset];

      const [countResult, dataResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, countQueryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      // Debug logging - remove in production
      console.log("Debug - Salon ID:", salonId);
      console.log("Debug - Main Query:", mainQuery);
      console.log("Debug - Pagination Params:", paginationParams);
      console.log("Debug - Data Result Count:", dataResult.rows.length);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Group services by category
      const categoriesMap = new Map<string, CategoryWithServices>();

      dataResult.rows.forEach((row) => {
        const categoryId = row.category_id.toString();

        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            id: categoryId,
            name: row.category_name,
            description: row.category_description,
            is_active: row.category_is_active,
            services: [],
          });
        }

        // Only add service if it exists (LEFT JOIN might return null services)
        if (row.service_id) {
          const category = categoriesMap.get(categoryId)!;
          category.services!.push({
            id: row.service_id,
            salon_id: row.service_salon_id,
            name: row.service_name,
            description: row.service_description,
            duration: row.service_duration,
            price: row.service_price,
            is_public: row.service_is_public,
            discount: row.service_discount || 0,
            is_completed: row.service_is_completed,
          });
        }
      });

      const entities = Array.from(categoriesMap.values());

      return {
        data: entities,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError(
        "Failed to find categories with services by salon ID",
        error
      );
    }
  }
}
