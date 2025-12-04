import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { OrderRepository } from "../repositories/OrderRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { UserRepository } from "../repositories/UserRepository";
import { OrderService } from "../services/OrderService";
import { ProductService } from "../services/ProductService";
import { UserService } from "../services/UserService";
import { FirebaseService } from "../services/FirebaseService";
import { createOrderControllerInstance } from "../controllers/OrderController";
import {
  createOrderSchema,
  updateOrderSchema,
  listOrdersQuerySchema,
  orderSummaryQuerySchema,
} from "../schemas/order";

const router = Router();

const orderRepository = new OrderRepository(pool);
const productRepository = new ProductRepository(pool);
const userRepository = new UserRepository(pool);
const firebaseService = new FirebaseService();

const orderService = new OrderService(orderRepository, productRepository);
const productService = new ProductService(productRepository);
const userService = new UserService(userRepository, pool, firebaseService);
const {
  createOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
  getOrderByIdHandler,
  listOrdersHandler,
  getUserOrdersHandler,
  cancelOrderHandler,
  getOrderSummaryHandler,
  updateOrderPaymentStatusHandler,
  getOrderDetailsHandler,
} = createOrderControllerInstance(orderService, userService, productService);

router.get("/orders", validateQuery(listOrdersQuerySchema), listOrdersHandler);
router.post("/orders", validateBody(createOrderSchema), createOrderHandler);
router.get("/orders/:id", getOrderByIdHandler);
router.put("/orders/:id", validateBody(updateOrderSchema), updateOrderHandler);
router.delete("/orders/:id", deleteOrderHandler);

router.get("/users/:userId/orders", getUserOrdersHandler);

router.post("/orders/:id/cancel", cancelOrderHandler);
router.patch("/orders/:id/payment-status", updateOrderPaymentStatusHandler);
router.get("/orders/:id/details", getOrderDetailsHandler);

router.get(
  "/orders/analytics/summary",
  validateQuery(orderSummaryQuerySchema),
  getOrderSummaryHandler
);

export default router;
