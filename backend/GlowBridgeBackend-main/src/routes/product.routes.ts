import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { ProductRepository } from "../repositories/ProductRepository";
import { ProductService } from "../services/ProductService";
import { createProductControllerInstance } from "../controllers/ProductController";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from "../schemas/product";

const router = Router();

const productRepository = new ProductRepository(pool);
const productService = new ProductService(productRepository);
const {
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getProductByIdHandler,
  listProductsHandler,
  getProductsBySalonIdHandler,
  getPublicProductsHandler,
} = createProductControllerInstance(productService);

router.get(
  "/products",
  validateQuery(listProductsQuerySchema),
  listProductsHandler
);
router.get("/products/public", getPublicProductsHandler);
router.post(
  "/products",
  validateBody(createProductSchema),
  createProductHandler
);
router.get("/products/:id", getProductByIdHandler);
router.put(
  "/products/:id",
  validateBody(updateProductSchema),
  updateProductHandler
);
router.delete("/products/:id", deleteProductHandler);

router.get("/salons/:salonId/products", getProductsBySalonIdHandler);

export default router;
