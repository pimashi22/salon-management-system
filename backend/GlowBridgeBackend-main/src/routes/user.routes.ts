import { Router } from "express";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  salonIdParamSchema,
} from "../schemas/user";
import { pool } from "../config/db";
import { UserRepository } from "../repositories/UserRepository";
import { FirebaseService } from "../services/FirebaseService";
import { UserService } from "../services/UserService";
import { createUserControllerInstance } from "../controllers/UserController";

const router = Router();

const userRepository = new UserRepository(pool);
const firebaseService = new FirebaseService();
const userService = new UserService(userRepository, pool, firebaseService);
const {
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUserByFirebaseUidHandler,
  listUsersHandler,
  getSalonStaffBySalonIdHandler,
} = createUserControllerInstance(userService);

router.post("/users", validateBody(createUserSchema), createUserHandler);
router.get("/users", validateQuery(listUsersQuerySchema), listUsersHandler);
router.get("/users/:id", getUserByIdHandler);
router.get("/users/firebase/:firebaseUid", getUserByFirebaseUidHandler);
router.get(
  "/salon/:salonId/users",
  validateParams(salonIdParamSchema),
  getSalonStaffBySalonIdHandler
);
router.put("/users/:id", validateBody(updateUserSchema), updateUserHandler);
router.delete("/users/:id", deleteUserHandler);

export default router;
