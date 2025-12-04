import { Request, Response } from "express";
import { SalonService } from "../services/SalonService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateSalonInput,
  UpdateSalonInput,
  CreateSalonBody,
  UpdateSalonBody,
  SalonFilterParams,
} from "../types/salon";
import { ListSalonsQuery } from "../schemas/salon";

export class SalonController {
  private salonService: SalonService;

  constructor(salonService: SalonService) {
    this.salonService = salonService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateSalonBody;

      const input: CreateSalonInput = {
        name: body.name,
        type: body.type,
        bio: body.bio,
        location: body.location,
        contactNumber: body.contact_number,
      };

      const salon = await this.salonService.create(input);

      return res.status(201).json({ salon });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const salon = await this.salonService.findById(id);

      return res.status(200).json({ salon });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateSalonBody;

      const input: UpdateSalonInput = {};
      if (body.name !== undefined) input.name = body.name;
      if (body.type !== undefined) input.type = body.type;
      if (body.bio !== undefined) input.bio = body.bio;
      if (body.location !== undefined) input.location = body.location;
      if (body.contact_number !== undefined)
        input.contactNumber = body.contact_number;
      if (body.status !== undefined) input.status = body.status;

      const salon = await this.salonService.update(id, input);

      return res.status(200).json({ salon });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.salonService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Salon deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  deactivate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const salon = await this.salonService.deactivate(id);

      return res.status(200).json({ salon });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListSalonsQuery;
      const { page, limit, type, status, location } = queryParams;

      const pagination = { page, limit };
      const filters: SalonFilterParams = {};

      if (type) filters.type = type;
      if (status) filters.status = status;
      if (location) filters.location = location;

      const result = await this.salonService.findAllSalons(filters, pagination);

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createSalonControllerInstance(salonService: SalonService) {
  const controller = new SalonController(salonService);

  return {
    createSalonHandler: controller.create,
    getSalonHandler: controller.findById,
    updateSalonHandler: controller.update,
    deleteSalonHandler: controller.delete,
    deactivateSalonHandler: controller.deactivate,
    listSalonsHandler: controller.findAll,
  };
}
