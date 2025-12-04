import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateProductInput,
  UpdateProductInput,
  CreateProductBody,
  UpdateProductBody,
  ListProductsQuery,
} from "../types/product";

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateProductBody;

      const input: CreateProductInput = {
        salonId: body.salon_id,
        name: body.name,
        description: body.description,
        price: body.price,
        availableQuantity: body.available_quantity,
        isPublic: body.is_public,
        discount: body.discount,
        imageUrl: body.image_url,
      };

      const product = await this.productService.create(input);

      return res.status(201).json({ product });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const product = await this.productService.findById(id);

      return res.status(200).json({ product });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateProductBody;

      const input: UpdateProductInput = {};
      if (body.salon_id !== undefined) input.salonId = body.salon_id;
      if (body.name !== undefined) input.name = body.name;
      if (body.description !== undefined) input.description = body.description;
      if (body.price !== undefined) input.price = body.price;
      if (body.available_quantity !== undefined)
        input.availableQuantity = body.available_quantity;
      if (body.is_public !== undefined) input.isPublic = body.is_public;
      if (body.discount !== undefined) input.discount = body.discount;
      if (body.image_url !== undefined) input.imageUrl = body.image_url;

      const product = await this.productService.update(id, input);

      return res.status(200).json({ product });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.productService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListProductsQuery;
      const { page, limit, salon_id, is_public, min_price, max_price } =
        queryParams;

      const pagination = { page, limit };
      const filters = {
        ...(salon_id && { salon_id }),
        ...(is_public !== undefined && { is_public }),
        ...(min_price !== undefined && { min_price }),
        ...(max_price !== undefined && { max_price }),
      };

      const result = await this.productService.findAllProducts(
        filters,
        pagination
      );

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findBySalonId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { salonId } = req.params;

      if (!salonId) {
        return res.status(400).json({
          error: "Salon ID is required",
          message: "Please provide a valid salon ID",
        });
      }

      const products = await this.productService.findBySalonId(salonId);

      return res.status(200).json({
        data: products,
        message: "Products retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findPublicProducts = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const products = await this.productService.findPublicProducts();

      return res.status(200).json({
        data: products,
        message: "Public products retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createProductControllerInstance(
  productService: ProductService
) {
  const controller = new ProductController(productService);

  return {
    createProductHandler: controller.create,
    updateProductHandler: controller.update,
    deleteProductHandler: controller.delete,
    getProductByIdHandler: controller.findById,
    listProductsHandler: controller.findAll,
    getProductsBySalonIdHandler: controller.findBySalonId,
    getPublicProductsHandler: controller.findPublicProducts,
  };
}
