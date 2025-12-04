import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateCategoryBody,
  UpdateCategoryBody,
  ListCategoriesQuery,
} from "../types/category";

export class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateCategoryBody;

      const input: CreateCategoryInput = {
        name: body.name,
        description: body.description,
        isActive: body.is_active,
      };

      const category = await this.categoryService.create(input);

      return res.status(201).json({ category });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.findById(id);

      return res.status(200).json({ category });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateCategoryBody;

      const input: UpdateCategoryInput = {};
      if (body.name !== undefined) input.name = body.name;
      if (body.description !== undefined) input.description = body.description;
      if (body.is_active !== undefined) input.isActive = body.is_active;

      const category = await this.categoryService.update(id, input);

      return res.status(200).json({ category });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListCategoriesQuery;
      const {
        page = 1,
        limit = 10,
        name,
        search,
        is_active,
        salon_id,
      } = queryParams;

      const pagination = { page, limit };
      const filters: any = {};

      if (name) filters.name = name;
      if (search) filters.search = search;
      if (is_active !== undefined) filters.is_active = is_active;

      // If salon_id is provided, return categories with their services filtered by salon_id
      if (salon_id) {
        const result =
          await this.categoryService.findCategoriesWithServicesBySalonId(
            salon_id,
            filters,
            pagination
          );
        return res.status(200).json(result);
      }

      // Otherwise, return categories without services (original behavior)
      const result = await this.categoryService.findAllCategories(
        filters,
        pagination
      );

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getActiveCategories = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const result = await this.categoryService.getActiveCategories(pagination);
      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  toggleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.toggleCategoryStatus(id);

      return res.status(200).json({ category });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findByName = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name } = req.params;
      const category = await this.categoryService.findByName(name);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      return res.status(200).json({ category });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createCategoryControllerInstance(
  categoryService: CategoryService
) {
  const controller = new CategoryController(categoryService);

  return {
    createCategoryHandler: controller.create,
    updateCategoryHandler: controller.update,
    deleteCategoryHandler: controller.delete,
    getCategoryByIdHandler: controller.findById,
    listCategoriesHandler: controller.findAll,
    getActiveCategoriesHandler: controller.getActiveCategories,
    toggleCategoryStatusHandler: controller.toggleStatus,
    findCategoryByNameHandler: controller.findByName,
  };
}
