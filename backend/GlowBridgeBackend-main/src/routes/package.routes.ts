import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { PackageRepository } from "../repositories/PackageRepository";
import { PackageService } from "../services/PackageService";
import { createPackageControllerInstance } from "../controllers/PackageController";
import {
  createPackageSchema,
  updatePackageSchema,
  listPackagesQuerySchema,
} from "../schemas/package";

const router = Router();

const packageRepository = new PackageRepository(pool);
const packageService = new PackageService(packageRepository);
const {
  createPackageHandler,
  updatePackageHandler,
  deletePackageHandler,
  getPackageByIdHandler,
  listPackagesHandler,
  getPublicPackagesHandler,
  getPackagesByServiceHandler,
  togglePackagePublicStatusHandler,
  updatePackageServicesHandler,
} = createPackageControllerInstance(packageService);

router.post(
  "/packages",
  validateBody(createPackageSchema),
  createPackageHandler
);
router.get(
  "/packages",
  validateQuery(listPackagesQuerySchema),
  listPackagesHandler
);
router.get("/packages/public", getPublicPackagesHandler);
router.get("/packages/:id", getPackageByIdHandler);
router.put(
  "/packages/:id",
  validateBody(updatePackageSchema),
  updatePackageHandler
);
router.delete("/packages/:id", deletePackageHandler);

router.get("/packages/service/:serviceId", getPackagesByServiceHandler);
router.patch("/packages/:id/toggle-public", togglePackagePublicStatusHandler);
router.patch("/packages/:id/services", updatePackageServicesHandler);

export default router;
