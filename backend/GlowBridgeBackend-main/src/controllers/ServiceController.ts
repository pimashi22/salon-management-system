import { Request, Response } from "express";
import { ServiceService } from "../services/ServiceService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateServiceInput,
  UpdateServiceInput,
  CreateServiceBody,
  UpdateServiceBody,
  ListServicesQuery,
} from "../types/service";

export class ServiceController {
  private serviceService: ServiceService;

  constructor(serviceService: ServiceService) {
    this.serviceService = serviceService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateServiceBody;

      const input: CreateServiceInput = {
        salonId: body.salon_id,
        name: body.name,
        description: body.description,
        duration: body.duration,
        price: body.price,
        isPublic: body.is_public,
        discount: body.discount,
        isCompleted: body.is_completed,
        categoryIds: body.category_ids,
      };

      const service = await this.serviceService.create(input);

      return res.status(201).json({ service });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateServiceBody;

      const input: UpdateServiceInput = {};
      if (body.salon_id !== undefined) input.salonId = body.salon_id;
      if (body.name !== undefined) input.name = body.name;
      if (body.description !== undefined) input.description = body.description;
      if (body.duration !== undefined) input.duration = body.duration;
      if (body.price !== undefined) input.price = body.price;
      if (body.is_public !== undefined) input.isPublic = body.is_public;
      if (body.discount !== undefined) input.discount = body.discount;
      if (body.is_completed !== undefined)
        input.isCompleted = body.is_completed;
      if (body.category_ids !== undefined)
        input.categoryIds = body.category_ids;

      const service = await this.serviceService.update(id, input);

      return res.status(200).json({ service });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.serviceService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListServicesQuery;
      const {
        page = 1,
        limit = 10,
        salon_id,
        is_completed,
        name,
        search,
        is_public,
        category_id,
      } = queryParams;

      const pagination = { page, limit };
      const filters: any = {};

      if (salon_id) filters.salon_id = salon_id;
      if (is_completed !== undefined) filters.is_completed = is_completed;
      if (name) filters.name = name;
      if (search) filters.search = search;
      if (is_public !== undefined) filters.is_public = is_public;
      if (category_id) filters.category_id = category_id;

      const result = await this.serviceService.findAllServicesWithCategories(
        filters,
        pagination
      );

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const service = await this.serviceService.findByIdWithCategories(id);

      return res.status(200).json({ service });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getPublicServices = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = req.query as any;
      const {
        page = 1,
        limit = 10,
        salon_id,
        category_id,
        search,
      } = queryParams;

      const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const filters: any = {};
      if (salon_id) filters.salon_id = salon_id;
      if (category_id)
        filters.category_id = parseInt(category_id as string, 10);
      if (search) filters.search = search;

      const result = await this.serviceService.getPublicServices(
        filters,
        pagination
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getCompletedServices = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = req.query as any;
      const {
        page = 1,
        limit = 10,
        salon_id,
        category_id,
        search,
      } = queryParams;

      const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const filters: any = {};
      if (salon_id) filters.salon_id = salon_id;
      if (category_id)
        filters.category_id = parseInt(category_id as string, 10);
      if (search) filters.search = search;

      const result = await this.serviceService.getCompletedServices(
        filters,
        pagination
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getServicesBySalon = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonId } = req.params;
      const services = await this.serviceService.findBySalonId(salonId);

      return res.status(200).json({
        data: services,
        total: services.length,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getServicesByCategory = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { categoryId } = req.params;
      const services = await this.serviceService.findByCategoryId(
        parseInt(categoryId, 10)
      );

      return res.status(200).json({
        data: services,
        total: services.length,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  togglePublicStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const service = await this.serviceService.toggleServicePublicStatus(id);

      return res.status(200).json({ service });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  toggleCompletedStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const service = await this.serviceService.toggleServiceCompletedStatus(
        id
      );

      return res.status(200).json({ service });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  updateCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { category_ids } = req.body;

      if (!Array.isArray(category_ids)) {
        return res.status(400).json({
          success: false,
          error: "category_ids must be an array",
        });
      }

      const service = await this.serviceService.updateServiceCategories(
        id,
        category_ids
      );
      return res.status(200).json({ service });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createServiceControllerInstance(
  serviceService: ServiceService
) {
  const controller = new ServiceController(serviceService);

  return {
    createServiceHandler: controller.create,
    updateServiceHandler: controller.update,
    deleteServiceHandler: controller.delete,
    getServiceByIdHandler: controller.findById,
    listServicesHandler: controller.findAll,
    getPublicServicesHandler: controller.getPublicServices,
    getCompletedServicesHandler: controller.getCompletedServices,
    getServicesBySalonHandler: controller.getServicesBySalon,
    getServicesByCategoryHandler: controller.getServicesByCategory,
    toggleServicePublicStatusHandler: controller.togglePublicStatus,
    toggleServiceCompletedStatusHandler: controller.toggleCompletedStatus,
    updateServiceCategoriesHandler: controller.updateCategories,
  };
}
