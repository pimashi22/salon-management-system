import { Pool, PoolClient } from "pg";
import {
  Order,
  OrderItem,
  CreateOrderInput,
  CreateOrderItemInput,
  UpdateOrderInput,
  OrderFilterParams,
  OrderWithItems,
  OrderItemWithProduct,
  OrderSummary,
} from "../types/order";
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
export class OrderRepository {
  private pool: Pool;
  private tableName: string = '"order"';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Order {
    return {
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      payment_type: row.payment_type,
      amount: parseFloat(row.amount),
      is_paid: row.is_paid,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  protected mapOrderItemRow(row: any): OrderItem {
    return {
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      quantity: row.quantity,
      price: parseFloat(row.price),
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  private getSelectFields(): string {
    return "id, user_id, description, payment_type, amount, is_paid";
  }

  protected getOrderItemSelectFields(): string {
    return "id, order_id, product_id, quantity, price, created_at, updated_at";
  }

  async findById(id: string): Promise<Order | null> {
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
  ): Promise<PaginationResult<Order>> {
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
  async createOrderWithItems(input: CreateOrderInput): Promise<OrderWithItems> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderQuery = `
        INSERT INTO "order" (user_id, description, payment_type, amount, is_paid)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${this.getSelectFields()}
      `;

      const orderValues = [
        input.userId,
        input.description || null,
        input.paymentType,
        totalAmount,
        false, 
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = this.mapRowToEntity(orderResult.rows[0]);

      const orderItems: OrderItem[] = [];
      for (const item of input.items) {
        const itemQuery = `
          INSERT INTO "order_item" (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING ${this.getOrderItemSelectFields()}
        `;

        const itemValues = [
          order.id,
          item.productId,
          item.quantity,
          item.price,
        ];
        const itemResult = await client.query(itemQuery, itemValues);
        orderItems.push(this.mapOrderItemRow(itemResult.rows[0]));
      }

      await client.query("COMMIT");

      return {
        ...order,
        items: orderItems.map((item) => ({
          ...item,
          product_name: undefined,
          product_description: undefined,
          product_available_quantity: undefined,
        })),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw new DatabaseError("Failed to create order", error);
    } finally {
      client.release();
    }
  }

  async update(id: string, input: UpdateOrderInput): Promise<Order | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(input).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;

        const dbField =
          key === "paymentType"
            ? "payment_type"
            : key === "isPaid"
            ? "is_paid"
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
        UPDATE "order"
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
      throw new DatabaseError("Failed to update order", error);
    }
  }

  async findOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
    try {
      
      const order = await this.findById(orderId);
      if (!order) {
        return null;
      }

      const itemsQuery = `
        SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          oi.created_at,
          oi.updated_at,
          p.name as product_name,
          p.description as product_description,
          p.available_quantity as product_available_quantity
        FROM "order_item" oi
        LEFT JOIN "product" p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.created_at ASC
      `;

      const itemsResult = await this.pool.query(itemsQuery, [orderId]);

      const items: OrderItemWithProduct[] = itemsResult.rows.map((row) => ({
        id: row.id,
        order_id: row.order_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: parseFloat(row.price),
        created_at: row.created_at ? new Date(row.created_at) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
        product_name: row.product_name,
        product_description: row.product_description,
        product_available_quantity: row.product_available_quantity,
      }));

      return {
        ...order,
        items,
      };
    } catch (error) {
      throw new DatabaseError("Failed to find order with items", error);
    }
  }

  async findOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const query = `
        SELECT ${this.getSelectFields()}
        FROM "order"
        WHERE user_id = $1
        ORDER BY id DESC
      `;

      const result = await this.pool.query(query, [userId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError("Failed to find orders by user ID", error);
    }
  }

  async findAllWithFilters(
    filters: OrderFilterParams = {},
    pagination?: any
  ): Promise<PaginationResult<Order>> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (filters.user_id !== undefined) {
        whereConditions.push(`user_id = $${paramIndex}`);
        queryParams.push(filters.user_id);
        paramIndex++;
      }

      if (filters.payment_type) {
        whereConditions.push(`payment_type = $${paramIndex}`);
        queryParams.push(filters.payment_type);
        paramIndex++;
      }

      if (filters.is_paid !== undefined) {
        whereConditions.push(`is_paid = $${paramIndex}`);
        queryParams.push(filters.is_paid);
        paramIndex++;
      }

      if (filters.min_amount !== undefined) {
        whereConditions.push(`amount >= $${paramIndex}`);
        queryParams.push(filters.min_amount);
        paramIndex++;
      }

      if (filters.max_amount !== undefined) {
        whereConditions.push(`amount <= $${paramIndex}`);
        queryParams.push(filters.max_amount);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const countQuery = `SELECT COUNT(*) as total FROM "order" ${whereClause}`;

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const mainQuery = `
        SELECT ${this.getSelectFields()}
        FROM "order"
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const paginationParams = [...queryParams, limit, offset];

      const [countResult, ordersResult] = await Promise.all([
        this.pool.query<{ total: string }>(countQuery, queryParams),
        this.pool.query(mainQuery, paginationParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: ordersResult.rows.map((row) => this.mapRowToEntity(row)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new DatabaseError("Failed to find orders with filters", error);
    }
  }

  async getOrderSummary(
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<OrderSummary> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (userId !== undefined) {
        whereConditions.push(`user_id = $${paramIndex}`);
        queryParams.push(userId);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const summaryQuery = `
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_order_value,
          payment_type,
          COUNT(*) as payment_type_count,
          SUM(CASE WHEN is_paid = true THEN 1 ELSE 0 END) as paid_orders,
          SUM(CASE WHEN is_paid = false THEN 1 ELSE 0 END) as unpaid_orders
        FROM "order"
        ${whereClause}
        GROUP BY ROLLUP(payment_type)
        ORDER BY payment_type NULLS LAST
      `;

      const result = await this.pool.query(summaryQuery, queryParams);

      const ordersByPaymentType: { [key: string]: number } = {};

      let totalOrders = 0;
      let totalAmount = 0;
      let averageOrderValue = 0;
      let paidOrders = 0;
      let unpaidOrders = 0;

      result.rows.forEach((row) => {
        if (row.payment_type === null) {
          
          totalOrders = parseInt(row.total_orders);
          totalAmount = parseFloat(row.total_amount);
          averageOrderValue = parseFloat(row.average_order_value);
          paidOrders = parseInt(row.paid_orders);
          unpaidOrders = parseInt(row.unpaid_orders);
        } else {
          
          ordersByPaymentType[row.payment_type] = parseInt(
            row.payment_type_count
          );
        }
      });

      return {
        total_orders: totalOrders,
        total_amount: totalAmount,
        average_order_value: averageOrderValue,
        orders_by_payment_type: ordersByPaymentType,
        paid_orders: paidOrders,
        unpaid_orders: unpaidOrders,
      };
    } catch (error) {
      throw new DatabaseError("Failed to get order summary", error);
    }
  }
}
