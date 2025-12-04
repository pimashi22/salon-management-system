import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateUserInput,
  UpdateUserInput,
  CreateUserBody,
  UpdateUserBody,
  ListUsersQuery,
} from "../types/user";
import { UserRole } from "../constraint";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateUserBody;

      const input: CreateUserInput = {
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        contactNumber: body.contact_number,
        role: body.role,
        password: body.password,
        salonId: body.salon_id,
      };

      const user = await this.userService.create(input);

      return res.status(201).json({ user });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      return res.status(200).json({ user });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateUserBody;

      const input: UpdateUserInput = {};
      if (body.first_name !== undefined) input.firstName = body.first_name;
      if (body.last_name !== undefined) input.lastName = body.last_name;
      if (body.email !== undefined) input.email = body.email;
      if (body.contact_number !== undefined)
        input.contactNumber = body.contact_number;
      if (body.role !== undefined) input.role = body.role;

      const user = await this.userService.update(id, input);

      return res.status(200).json({ user });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.userService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListUsersQuery;
      const { page, limit, role } = queryParams;

      const pagination = { page, limit };
      const filters = role ? { role } : {};

      const result = await this.userService.findAllUsers(filters, pagination);

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findByFirebaseUid = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { firebaseUid } = req.params;
      const user = await this.userService.findByFirebaseUid(firebaseUid);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      // Check if user is salon owner or staff and include salon_id
      let responseData: any = { ...user };

      if (
        user.role === UserRole.SALON_OWNER ||
        user.role === UserRole.SALON_STAFF
      ) {
        try {
          const salonInfo = await this.userService.getSalonInfoByUserId(
            user.id
          );
          if (salonInfo) {
            responseData.salon_id = salonInfo.salon_id;
          }
        } catch (salonError) {
          // Log the error but don't fail the request
          console.warn(
            `Failed to fetch salon info for user ${user.id}:`,
            salonError
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: responseData,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findSalonStaffBySalonId = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonId } = req.params;

      const users = await this.userService.findSalonStaffBySalonId(salonId);

      return res.status(200).json({
        success: true,
        message: "Salon staff retrieved successfully",
        data: users,
        count: users.length,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createUserControllerInstance(userService: UserService) {
  const controller = new UserController(userService);

  return {
    createUserHandler: controller.create,
    updateUserHandler: controller.update,
    deleteUserHandler: controller.delete,
    getUserByIdHandler: controller.findById,
    getUserByFirebaseUidHandler: controller.findByFirebaseUid,
    listUsersHandler: controller.findAll,
    getSalonStaffBySalonIdHandler: controller.findSalonStaffBySalonId,
  };
}
