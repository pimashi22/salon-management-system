import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { UserRepository } from "../repositories/UserRepository";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { AppointmentService } from "../services/AppointmentService";
import { createAppointmentControllerInstance } from "../controllers/AppointmentController";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  listAppointmentsQuerySchema,
} from "../schemas/appointment";

const router = Router();

const appointmentRepository = new AppointmentRepository(pool);
const userRepository = new UserRepository(pool);
const serviceRepository = new ServiceRepository(pool);
const appointmentService = new AppointmentService(appointmentRepository, userRepository, serviceRepository);
const {
  createAppointmentHandler,
  updateAppointmentHandler,
  updateAppointmentStatusHandler,
  deleteAppointmentHandler,
  getAppointmentByIdHandler,
  listAppointmentsHandler,
  getAppointmentsByUserIdHandler,
  getAppointmentsByServiceIdHandler,
  getAppointmentsByDateRangeHandler,
} = createAppointmentControllerInstance(appointmentService);

router.post(
  "/appointments",
  validateBody(createAppointmentSchema),
  createAppointmentHandler
);
router.get(
  "/appointments",
  validateQuery(listAppointmentsQuerySchema),
  listAppointmentsHandler
);
router.get("/appointments/:id", getAppointmentByIdHandler);
router.put(
  "/appointments/:id",
  validateBody(updateAppointmentSchema),
  updateAppointmentHandler
);
router.patch(
  "/appointments/:id/status",
  validateBody(updateAppointmentStatusSchema),
  updateAppointmentStatusHandler
);
router.delete("/appointments/:id", deleteAppointmentHandler);

router.get("/appointments/user/:userId", getAppointmentsByUserIdHandler);
router.get(
  "/appointments/service/:serviceId",
  getAppointmentsByServiceIdHandler
);
router.get("/appointments/date-range", getAppointmentsByDateRangeHandler);

export default router;
