// src/routes/packageReport.routes.ts
import { Router } from "express";
import { pool } from "../config/db";
import { PackageRepository } from "../repositories/PackageRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { PackageReportService } from "../services/PackageReportService";
import { createPackageReportControllerInstance } from "../controllers/PackageReportController";
import { validateQuery } from "../middleware/validate";
import { packageReportQuerySchema } from "../schemas/packageReport";

const router = Router();

const packageRepository = new PackageRepository(pool);
const appointmentRepository = new AppointmentRepository(pool);
const reportService = new PackageReportService(packageRepository, appointmentRepository);
const { getPackagesReportHandler } = createPackageReportControllerInstance(reportService);

// GET /reports/packages?package_id=...&start_at_from=...&start_at_to=...
router.get(
  "/reports/packages",
  validateQuery(packageReportQuerySchema),
  getPackagesReportHandler
);

export default router;
