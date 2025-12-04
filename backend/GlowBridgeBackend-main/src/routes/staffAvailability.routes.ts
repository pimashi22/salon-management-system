import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { StaffAvailabilityRepository } from "../repositories/StaffAvailabilityRepository";
import { StaffAvailabilityService } from "../services/StaffAvailabilityService";
import { createStaffAvailabilityControllerInstance } from "../controllers/StaffAvailabilityController";
import {
  updateStaffAvailabilitySchema,
  listStaffAvailabilityQuerySchema,
} from "../schemas/staffAvailability";

const router = Router();

const staffAvailabilityRepository = new StaffAvailabilityRepository(pool);
const staffAvailabilityService = new StaffAvailabilityService(
  staffAvailabilityRepository
);
const {
  updateStaffAvailabilityHandler,
  getAvailabilityWithStaffDetailsHandler,
} = createStaffAvailabilityControllerInstance(staffAvailabilityService);

router.get(
  "/staff-availability",
  validateQuery(listStaffAvailabilityQuerySchema),
  getAvailabilityWithStaffDetailsHandler
);

router.put(
  "/staff-availability/:id",
  validateBody(updateStaffAvailabilitySchema),
  updateStaffAvailabilityHandler
);

export default router;
