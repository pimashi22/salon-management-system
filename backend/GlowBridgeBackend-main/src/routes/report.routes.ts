// src/routes/report.routes.ts
import { Router } from "express";
import { pool } from "../config/db";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ReportService } from "../services/ReportService";
import { createReportControllerInstance } from "../controllers/ReportController";
import { validateQuery } from "../middleware/validate";
import { serviceReportQuerySchema } from "../schemas/report";

const router = Router();

const serviceRepository = new ServiceRepository(pool);
const appointmentRepository = new AppointmentRepository(pool);
const reportService = new ReportService(serviceRepository, appointmentRepository);
const { getServicesReportHandler } = createReportControllerInstance(reportService);

// GET /api/reports/services
router.get(
  "/reports/services",
  validateQuery(serviceReportQuerySchema),
  getServicesReportHandler
);

export default router;
