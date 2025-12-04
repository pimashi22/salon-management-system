import { BaseService } from "./BaseService";
import { OrderRepository } from "../repositories/OrderRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { emailService } from "./EmailService";
import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilterParams,
  OrderWithItems,
  OrderSummary,
} from "../types/order";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class OrderService extends BaseService<
  Order,
  CreateOrderInput,
  UpdateOrderInput
> {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;

  constructor(
    orderRepository: OrderRepository,
    productRepository: ProductRepository
  ) {
    super(orderRepository);
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
  }

  protected getEntityName(): string {
    return "Order";
  }

  async create(input: CreateOrderInput): Promise<OrderWithItems> {
    
    this.validateInput(input, ["userId", "items"]);

    if (!input.items || input.items.length === 0) {
      throw new ValidationError("At least one item is required");
    }

    for (const item of input.items) {
      if (!item.productId || item.quantity <= 0 || item.price < 0) {
        throw new ValidationError(
          "Each item must have valid productId, quantity, and price"
        );
      }

      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      if (product.available_quantity < item.quantity) {
        throw new ValidationError(
          `Insufficient quantity for product ${product.name}. Available: ${product.available_quantity}, Requested: ${item.quantity}`
        );
      }
    }

    const order = await this.orderRepository.createOrderWithItems(input);

    // Update product quantities and check for low stock
    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        const newQuantity = product.available_quantity - item.quantity;
        await this.productRepository.update(item.productId, {
          availableQuantity: newQuantity,
        });
        
        // Check if stock is low and send alert
        await this.checkAndSendLowStockAlert(item.productId);
      }
    }

    return order;
  }

  async update(id: string, input: UpdateOrderInput): Promise<Order> {
    if (!id) {
      throw new ValidationError("Order ID is required");
    }

    const updatedOrder = await this.orderRepository.update(id, {
      ...input,
      id,
    });

    if (!updatedOrder) {
      throw new NotFoundError("Order");
    }

    return updatedOrder;
  }

  async getOrderWithItems(orderId: string): Promise<OrderWithItems> {
    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }

    const order = await this.orderRepository.findOrderWithItems(orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }

    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    return this.orderRepository.findOrdersByUserId(userId);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.is_paid) {
      throw new ValidationError("Cannot cancel a paid order");
    }

    const cancelledOrder = await this.update(orderId, {
      description: (order.description || "") + " - CANCELLED",
      isPaid: false,
    });

    const orderWithItems = await this.orderRepository.findOrderWithItems(
      orderId
    );
    if (orderWithItems) {
      for (const item of orderWithItems.items) {
        const product = await this.productRepository.findById(item.product_id);
        if (product) {
          const newQuantity = product.available_quantity + item.quantity;
          await this.productRepository.update(item.product_id, {
            availableQuantity: newQuantity,
          });
          
          // Check if stock is still low after restoring quantity
          await this.checkAndSendLowStockAlert(item.product_id);
        }
      }
    }

    return cancelledOrder;
  }

  async getOrderSummary(
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<OrderSummary> {
    return this.orderRepository.getOrderSummary(userId, startDate, endDate);
  }

  async findAllOrders(
    filters: OrderFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<Order>> {
    return this.orderRepository.findAllWithFilters(filters, pagination);
  }

  async findAll(
    filters?: OrderFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<Order>> {
    return this.findAllOrders(filters || {}, pagination);
  }

  private calculateOrderTotal(
    items: Array<{ quantity: number; price: number }>
  ): number {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  }

  private async validateItemAvailability(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      if (product.available_quantity < item.quantity) {
        throw new ValidationError(
          `Insufficient quantity for product ${product.name}. Available: ${product.available_quantity}, Requested: ${item.quantity}`
        );
      }
    }
  }

  private async checkAndSendLowStockAlert(productId: string): Promise<void> {
    const LOW_STOCK_THRESHOLD = 5;
    
    try {
      const product = await this.productRepository.findById(productId);
      
      if (!product) {
        logger.warn(`Product ${productId} not found for low stock check`);
        return;
      }

      if (product.available_quantity < LOW_STOCK_THRESHOLD) {
        const alertData = {
          productName: product.name,
          productId: product.id,
          currentStock: product.available_quantity,
          lowStockThreshold: LOW_STOCK_THRESHOLD,
          salonName: 'GlowBridge Salon' // You can enhance this by fetching actual salon name
        };

        const emailSent = await emailService.sendLowStockAlert(alertData);
        
        if (emailSent) {
          logger.info(`Low stock alert sent for product: ${product.name} (${product.available_quantity} units remaining)`);
        } else {
          logger.warn(`Failed to send low stock alert for product: ${product.name}`);
        }
      }
    } catch (error) {
      logger.error(`Error checking low stock for product ${productId}:`, error);
    }
  }
}
