import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { UserService } from "../services/UserService";
import { ProductService } from "../services/ProductService";
import { emailService, OrderConfirmationData } from "../services/EmailService";
import { sendErrorResponse } from "../utils/errors";
import { logger } from "../utils/logger";
import {
  CreateOrderInput,
  UpdateOrderInput,
  CreateOrderBody,
  UpdateOrderBody,
  ListOrdersQuery,
  OrderWithItems,
} from "../types/order";
import { OrderSummaryQuery } from "../schemas/order";

export class OrderController {
  private orderService: OrderService;
  private userService: UserService;
  private productService: ProductService;

  constructor(
    orderService: OrderService,
    userService: UserService,
    productService: ProductService
  ) {
    this.orderService = orderService;
    this.userService = userService;
    this.productService = productService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateOrderBody;

      const input: CreateOrderInput = {
        userId: body.user_id,
        items: body.items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        description: body.description,
        paymentType: body.payment_type,
      };

      const orderWithItems = await this.orderService.create(input);

      // Send order confirmation email after successful order creation
      try {
        await this.sendOrderConfirmationEmail(orderWithItems, body);
        logger.info(`Order confirmation email sent for order: ${orderWithItems.id}`);
      } catch (emailError) {
        // Log email error but don't fail the order creation
        logger.error('Failed to send order confirmation email:', emailError);
      }

      return res.status(201).json({
        data: orderWithItems,
        message: "Order created successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateOrderBody;

      const input: UpdateOrderInput = {};
      if (body.description !== undefined) input.description = body.description;
      if (body.payment_type !== undefined)
        input.paymentType = body.payment_type;
      if (body.amount !== undefined) input.amount = body.amount;
      if (body.is_paid !== undefined) input.isPaid = body.is_paid;

      const order = await this.orderService.update(id, input);

      return res.status(200).json({ order });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.orderService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const orderWithItems = await this.orderService.getOrderWithItems(id);

      return res.status(200).json({
        data: orderWithItems,
        message: "Order retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListOrdersQuery;
      const {
        page,
        limit,
        user_id,
        payment_type,
        is_paid,
        min_amount,
        max_amount,
        start_date,
        end_date,
      } = queryParams;

      const pagination = { page, limit };
      const filters = {
        ...(user_id && { user_id }),
        ...(payment_type && { payment_type }),
        ...(is_paid !== undefined && { is_paid }),
        ...(min_amount !== undefined && { min_amount }),
        ...(max_amount !== undefined && { max_amount }),
        
      };

      const result = await this.orderService.findAllOrders(filters, pagination);

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getUserOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required",
          message: "Please provide a valid user ID",
        });
      }

      const orders = await this.orderService.getUserOrders(userId);

      return res.status(200).json({
        data: orders,
        message: "User orders retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  cancelOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "Order ID is required",
          message: "Please provide a valid order ID",
        });
      }

      const cancelledOrder = await this.orderService.cancelOrder(id);

      return res.status(200).json({
        data: cancelledOrder,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getOrderSummary = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as OrderSummaryQuery;
      const { user_id, start_date, end_date } = queryParams;

      const summary = await this.orderService.getOrderSummary(
        user_id,
        start_date,
        end_date
      );

      return res.status(200).json({
        data: summary,
        message: "Order summary retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  updateOrderPaymentStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { is_paid } = req.body;

      if (!id || is_paid === undefined) {
        return res.status(400).json({
          error: "Missing required parameters",
          message: "Order ID and is_paid status are required",
        });
      }

      const updatedOrder = await this.orderService.update(id, {
        isPaid: is_paid,
      });

      return res.status(200).json({
        data: updatedOrder,
        message: "Order payment status updated successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getOrderDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "Order ID is required",
          message: "Please provide a valid order ID",
        });
      }

      const orderWithItems = await this.orderService.getOrderWithItems(id);

      return res.status(200).json({
        data: orderWithItems,
        message: "Order details retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  private async sendOrderConfirmationEmail(
    orderWithItems: OrderWithItems,
    orderBody: CreateOrderBody
  ): Promise<void> {
    try {
      // Get user details
      const user = await this.userService.findById(orderWithItems.user_id);
      if (!user) {
        throw new Error('User not found');
      }

      // Get product details for all items
      const itemsWithDetails = await Promise.all(
        orderWithItems.items.map(async (item: any) => {
          try {
            const product = await this.productService.findById(item.product_id);
            return {
              name: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            };
          } catch (error) {
            logger.warn(`Failed to get product details for ${item.product_id}:`, error);
            return {
              name: 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            };
          }
        })
      );

      // Extract shipping address from frontend (passed in description or separate field)
      // For now, we'll use default values since shipping address isn't in current order schema
      const shippingAddress = {
        firstName: user.first_name || 'Customer',
        lastName: user.last_name || '',
        address: 'Address provided during checkout',
        city: 'Colombo',
        postalCode: '00100'
      };

      const orderConfirmationData: OrderConfirmationData = {
        customerName: `${user.first_name} ${user.last_name}`.trim(),
        customerEmail: user.email,
        orderId: orderWithItems.id,
        orderDate: new Date().toISOString(),
        items: itemsWithDetails,
        subtotal: orderWithItems.amount,
        total: orderWithItems.amount,
        paymentMethod: orderWithItems.payment_type,
        shippingAddress,
      };

      await emailService.sendOrderConfirmation(orderConfirmationData);
    } catch (error) {
      logger.error('Error in sendOrderConfirmationEmail:', error);
      throw error;
    }
  }
}

export function createOrderControllerInstance(
  orderService: OrderService,
  userService: UserService,
  productService: ProductService
) {
  const controller = new OrderController(orderService, userService, productService);

  return {
    createOrderHandler: controller.create,
    updateOrderHandler: controller.update,
    deleteOrderHandler: controller.delete,
    getOrderByIdHandler: controller.findById,
    listOrdersHandler: controller.findAll,
    getUserOrdersHandler: controller.getUserOrders,
    cancelOrderHandler: controller.cancelOrder,
    getOrderSummaryHandler: controller.getOrderSummary,
    updateOrderPaymentStatusHandler: controller.updateOrderPaymentStatus,
    getOrderDetailsHandler: controller.getOrderDetails,
  };
}
