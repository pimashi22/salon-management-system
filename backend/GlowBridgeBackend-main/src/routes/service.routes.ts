import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { SalonRepository } from "../repositories/SalonRepository";
import { ServiceService } from "../services/ServiceService";
import { createServiceControllerInstance } from "../controllers/ServiceController";
import {
  createServiceSchema,
  updateServiceSchema,
  listServicesQuerySchema,
} from "../schemas/service";

const router = Router();

const serviceRepository = new ServiceRepository(pool);
const categoryRepository = new CategoryRepository(pool);
const salonRepository = new SalonRepository(pool);
const serviceService = new ServiceService(
  serviceRepository,
  categoryRepository,
  salonRepository
);
const {
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
  getServiceByIdHandler,
  listServicesHandler,
  getPublicServicesHandler,
  getCompletedServicesHandler,
  getServicesBySalonHandler,
  getServicesByCategoryHandler,
  toggleServicePublicStatusHandler,
  toggleServiceCompletedStatusHandler,
  updateServiceCategoriesHandler,
} = createServiceControllerInstance(serviceService);

router.post(
  "/services",
  validateBody(createServiceSchema),
  createServiceHandler
);
router.get(
  "/services",
  validateQuery(listServicesQuerySchema),
  listServicesHandler
);
router.get("/services/public", getPublicServicesHandler);
router.get("/services/completed", getCompletedServicesHandler);
router.get("/services/:id", getServiceByIdHandler);
router.put(
  "/services/:id",
  validateBody(updateServiceSchema),
  updateServiceHandler
);
router.delete("/services/:id", deleteServiceHandler);

router.get("/services/salon/:salonId", getServicesBySalonHandler);
router.get("/services/category/:categoryId", getServicesByCategoryHandler);
router.patch("/services/:id/toggle-public", toggleServicePublicStatusHandler);
router.patch(
  "/services/:id/toggle-completed",
  toggleServiceCompletedStatusHandler
);
router.patch("/services/:id/categories", updateServiceCategoriesHandler);

export default router;
