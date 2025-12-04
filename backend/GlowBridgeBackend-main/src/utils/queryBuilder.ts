import { FilterParams, PaginationParams, QueryParams } from "../types/common";

export class QueryBuilder {
  private baseQuery: string;
  private whereConditions: string[] = [];
  private parameters: any[] = [];
  private paramIndex: number = 1;

  constructor(baseQuery: string) {
    this.baseQuery = baseQuery;
  }

  addFilter(column: string, value: any, operator: string = "="): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push(`${column} ${operator} $${this.paramIndex}`);
      this.parameters.push(value);
      this.paramIndex++;
    }
    return this;
  }

  addFilters(filters: FilterParams): QueryBuilder {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        this.addFilter(key, value);
      }
    });
    return this;
  }

  addPagination(pagination: PaginationParams): QueryBuilder {
    const offset = (pagination.page - 1) * pagination.limit;
    this.parameters.push(pagination.limit, offset);
    return this;
  }

  buildQuery(orderBy?: string): QueryParams {
    let query = this.baseQuery;

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(" AND ")}`;
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    return {
      text: query,
      values: this.parameters,
    };
  }

  buildCountQuery(tableName: string): QueryParams {
    let query = `SELECT COUNT(*) as total FROM ${tableName}`;

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(" AND ")}`;
    }

    const filterParamsCount = this.parameters.length - 2; 
    const countParams = this.parameters.slice(0, filterParamsCount);

    return {
      text: query,
      values: countParams,
    };
  }

  buildPaginatedQuery(orderBy: string = "id"): QueryParams {
    const limitParam = this.paramIndex;
    const offsetParam = this.paramIndex + 1;

    let query = this.baseQuery;

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(" AND ")}`;
    }

    query += ` ORDER BY ${orderBy} LIMIT $${limitParam} OFFSET $${offsetParam}`;

    return {
      text: query,
      values: this.parameters,
    };
  }

  reset(): QueryBuilder {
    this.whereConditions = [];
    this.parameters = [];
    this.paramIndex = 1;
    return this;
  }
}

export function createQueryBuilder(baseQuery: string): QueryBuilder {
  return new QueryBuilder(baseQuery);
}
