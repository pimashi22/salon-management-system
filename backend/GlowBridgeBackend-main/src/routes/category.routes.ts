import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
} from "../schemas/category";
import { pool } from "../config/db";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { CategoryService } from "../services/CategoryService";
import { createCategoryControllerInstance } from "../controllers/CategoryController";

const router = Router();

const categoryRepository = new CategoryRepository(pool);
const categoryService = new CategoryService(categoryRepository);
const {
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  getCategoryByIdHandler,
  listCategoriesHandler,
  getActiveCategoriesHandler,
  toggleCategoryStatusHandler,
  findCategoryByNameHandler,
} = createCategoryControllerInstance(categoryService);

router.post(
  "/categories",
  validateBody(createCategorySchema),
  createCategoryHandler
);
router.get(
  "/categories",
  validateQuery(listCategoriesQuerySchema),
  listCategoriesHandler
);
router.get("/categories/active", getActiveCategoriesHandler);
router.get("/categories/:id", getCategoryByIdHandler);
router.put(
  "/categories/:id",
  validateBody(updateCategorySchema),
  updateCategoryHandler
);
router.delete("/categories/:id", deleteCategoryHandler);

router.patch("/categories/:id/toggle-status", toggleCategoryStatusHandler);
router.get("/categories/name/:name", findCategoryByNameHandler);

export default router;
