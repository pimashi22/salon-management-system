import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { pool } from "../config/db";
import { SalonRepository } from "../repositories/SalonRepository";
import { SalonService } from "../services/SalonService";
import { createSalonControllerInstance } from "../controllers/SalonController";
import {
  createSalonSchema,
  updateSalonSchema,
  listSalonsQuerySchema,
} from "../schemas/salon";

const router = Router();

const salonRepository = new SalonRepository(pool);
const salonService = new SalonService(salonRepository);
const {
  createSalonHandler,
  getSalonHandler,
  updateSalonHandler,
  deleteSalonHandler,
  deactivateSalonHandler,
  listSalonsHandler,
} = createSalonControllerInstance(salonService);

router.get("/salons", validateQuery(listSalonsQuerySchema), listSalonsHandler);
router.get("/salons/:id", getSalonHandler);
router.post("/salons", validateBody(createSalonSchema), createSalonHandler);
router.put("/salons/:id", validateBody(updateSalonSchema), updateSalonHandler);
router.delete("/salons/:id", deleteSalonHandler);
router.post("/salons/:id/deactivate", deactivateSalonHandler);

export default router;
