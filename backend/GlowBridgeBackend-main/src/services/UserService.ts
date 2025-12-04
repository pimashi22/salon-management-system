import { BaseService } from "./BaseService";
import { UserRepository } from "../repositories/UserRepository";
import { FirebaseService } from "./FirebaseService";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilterParams,
} from "../types/user";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, ConflictError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { UserRole } from "../constraint";
import { Pool } from "pg";
import { executeCreateSalonOwner } from "../sql/mutation/createSalonOwner";
import { executeCreateSalonStaff } from "../sql/mutation/createSalonStaff";
import {
  executeGetSalonIdByUserId,
  UserSalonInfo,
} from "../sql/query/getSalonIdByUserId";

export class UserService extends BaseService<
  User,
  CreateUserInput,
  UpdateUserInput
> {
  private userRepository: UserRepository;
  private firebaseService: FirebaseService;
  private pool: Pool;

  constructor(
    userRepository: UserRepository,
    pool: Pool,
    firebaseService?: FirebaseService
  ) {
    super(userRepository);
    this.userRepository = userRepository;
    this.pool = pool;
    this.firebaseService = firebaseService || new FirebaseService();
  }

  protected getEntityName(): string {
    return "User";
  }

  async create(input: CreateUserInput): Promise<User> {
    this.validateInput(input, [
      "firstName",
      "lastName",
      "email",
      "contactNumber",
      "role",
    ]);

    if (!this.isValidEmail(input.email)) {
      throw new ValidationError("Invalid email format");
    }

    // Validate salonId is required for salon_owner and salon_staff roles
    if (
      (input.role === UserRole.SALON_OWNER ||
        input.role === UserRole.SALON_STAFF) &&
      !input.salonId
    ) {
      throw new ValidationError(`salonId is required for ${input.role} role`);
    }

    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    try {
      logger.info(`Creating Firebase user for email: ${input.email}`);
      const firebaseUid = await this.firebaseService.createUser({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        contactNumber: input.contactNumber,
        password: "Test@12345",
      });

      logger.info(`Firebase user created with UID: ${firebaseUid}`);

      logger.info(`Creating database user for email: ${input.email}`);
      const userInput = { ...input, firebaseUid };
      const createdUser = await this.userRepository.create(userInput);

      logger.info(
        `User created successfully in database with ID: ${createdUser.id} and Firebase UID: ${firebaseUid}`
      );

      // Handle salon assignments
      if (input.salonId && createdUser.id) {
        try {
          if (input.role === UserRole.SALON_OWNER) {
            await executeCreateSalonOwner(this.pool, {
              salonId: input.salonId,
              userId: createdUser.id,
            });
            logger.info(
              `User ${createdUser.id} assigned as salon owner to salon ${input.salonId}`
            );
          } else if (input.role === UserRole.SALON_STAFF) {
            await executeCreateSalonStaff(this.pool, {
              userId: createdUser.id,
              salonId: input.salonId,
            });
            logger.info(
              `User ${createdUser.id} assigned as salon staff to salon ${input.salonId}`
            );
          }
        } catch (salonAssignmentError) {
          logger.error(
            `Failed to assign user to salon: ${salonAssignmentError}`
          );
          // Note: User is already created, salon assignment failed
          // You might want to handle this scenario differently based on business requirements
          throw new Error(
            `User created but salon assignment failed: ${
              (salonAssignmentError as Error).message
            }`
          );
        }
      }

      return createdUser;
    } catch (error) {
      logger.error("Failed to create user:", error);

      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }

      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    if (!id) {
      throw new ValidationError("User ID is required");
    }

    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError("Invalid email format");
    }

    if (input.email) {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictError("Email already exists");
      }
    }

    const updatedUser = await this.userRepository.update(id, { ...input, id });

    if (!updatedUser) {
      throw new NotFoundError("User");
    }

    return updatedUser;
  }

  async findAllUsers(
    filters: UserFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<User>> {
    return this.userRepository.findAllWithFilters(filters, pagination);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new ValidationError("Email is required");
    }

    if (!this.isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    return this.userRepository.findByEmail(email);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    if (!firebaseUid) {
      throw new ValidationError("Firebase UID is required");
    }

    return this.userRepository.findByFirebaseUid(firebaseUid);
  }

  async getSalonInfoByUserId(userId: string): Promise<UserSalonInfo | null> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    return executeGetSalonIdByUserId(this.pool, userId);
  }

  async deleteById(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("User ID is required");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }

    try {
      await this.userRepository.deleteById(id);

      if (user.firebase_uid) {
        await this.firebaseService.deleteUser(user.firebase_uid);
        logger.info(`Deleted Firebase user with UID: ${user.firebase_uid}`);
      }

      logger.info(`User deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete user ${id}:`, error);
      throw new Error(`Failed to delete user: ${(error as Error).message}`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async findAll(
    filters?: UserFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<User>> {
    return this.findAllUsers(filters || {}, pagination);
  }

  async findSalonStaffBySalonId(salonId: string): Promise<User[]> {
    if (!salonId) {
      throw new ValidationError("Salon ID is required");
    }

    return this.userRepository.findSalonStaffBySalonId(salonId);
  }
}
