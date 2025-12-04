import { Request, Response } from "express";
import { PackageService } from "../services/PackageService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreatePackageInput,
  UpdatePackageInput,
  CreatePackageBody,
  UpdatePackageBody,
  ListPackagesQuery,
} from "../types/package";

export class PackageController {
  private packageService: PackageService;

  constructor(packageService: PackageService) {
    this.packageService = packageService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreatePackageBody;

      const input: CreatePackageInput = {
        name: body.name,
        description: body.description,
        isPublic: body.is_public,
        discount: body.discount,
        serviceIds: body.service_ids,
      };

      const package_ = await this.packageService.create(input);

      return res.status(201).json({ package: package_ });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdatePackageBody;

      const input: UpdatePackageInput = {};
      if (body.name !== undefined) input.name = body.name;
      if (body.description !== undefined) input.description = body.description;
      if (body.is_public !== undefined) input.isPublic = body.is_public;
      if (body.discount !== undefined) input.discount = body.discount;
      if (body.service_ids !== undefined) input.serviceIds = body.service_ids;

      const package_ = await this.packageService.update(id, input);

      return res.status(200).json({ package: package_ });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.packageService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Package deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListPackagesQuery;
      const {
        page = 1,
        limit = 10,
        name,
        search,
        is_public,
        service_id,
      } = queryParams;

      const pagination = { page, limit };
      const filters: any = {};

      if (name) filters.name = name;
      if (search) filters.search = search;
      if (is_public !== undefined) filters.is_public = is_public;
      if (service_id) filters.service_id = service_id;

      const result = await this.packageService.findAllPackagesWithServices(
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
      const package_ = await this.packageService.findByIdWithServices(id);

      return res.status(200).json({ package: package_ });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getPublicPackages = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = req.query as any;
      const { page = 1, limit = 10, service_id, search, name } = queryParams;

      const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const filters: any = {};
      if (service_id) filters.service_id = service_id;
      if (search) filters.search = search;
      if (name) filters.name = name;

      const result = await this.packageService.getPublicPackages(
        filters,
        pagination
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getPackagesByService = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { serviceId } = req.params;
      const packages = await this.packageService.findByServiceId(serviceId);

      return res.status(200).json({
        data: packages,
        total: packages.length,
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
      const package_ = await this.packageService.togglePackagePublicStatus(id);

      return res.status(200).json({ package: package_ });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  updateServices = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { service_ids } = req.body;

      if (!Array.isArray(service_ids)) {
        return res.status(400).json({
          success: false,
          error: "service_ids must be an array",
        });
      }

      const package_ = await this.packageService.updatePackageServices(
        id,
        service_ids
      );
      return res.status(200).json({ package: package_ });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createPackageControllerInstance(
  packageService: PackageService
) {
  const controller = new PackageController(packageService);

  return {
    createPackageHandler: controller.create,
    updatePackageHandler: controller.update,
    deletePackageHandler: controller.delete,
    getPackageByIdHandler: controller.findById,
    listPackagesHandler: controller.findAll,
    getPublicPackagesHandler: controller.getPublicPackages,
    getPackagesByServiceHandler: controller.getPackagesByService,
    togglePackagePublicStatusHandler: controller.togglePublicStatus,
    updatePackageServicesHandler: controller.updateServices,
  };
}
