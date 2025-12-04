import { BaseService } from "./BaseService";
import { ProductRepository } from "../repositories/ProductRepository";
import {
  Product,
  ProductWithSalon,
  CreateProductInput,
  UpdateProductInput,
  ProductFilterParams,
} from "../types/product";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, NotFoundError } from "../utils/errors";

export class ProductService extends BaseService<
  Product,
  CreateProductInput,
  UpdateProductInput
> {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    super(productRepository);
    this.productRepository = productRepository;
  }

  protected getEntityName(): string {
    return "Product";
  }

  async create(input: CreateProductInput): Promise<Product> {
    
    this.validateInput(input, [
      "salonId",
      "name",
      "price",
      "availableQuantity",
    ]);

    if (input.price < 0) {
      throw new ValidationError("Price must be non-negative");
    }

    if (input.availableQuantity < 0) {
      throw new ValidationError("Available quantity must be non-negative");
    }

    if (
      input.discount !== undefined &&
      (input.discount < 0 || input.discount > 100)
    ) {
      throw new ValidationError("Discount must be between 0 and 100");
    }

    return this.productRepository.create(input);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    
    if (!id) {
      throw new ValidationError("Product ID is required");
    }

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError("Price must be non-negative");
    }

    if (input.availableQuantity !== undefined && input.availableQuantity < 0) {
      throw new ValidationError("Available quantity must be non-negative");
    }

    if (
      input.discount !== undefined &&
      (input.discount < 0 || input.discount > 100)
    ) {
      throw new ValidationError("Discount must be between 0 and 100");
    }

    const updatedProduct = await this.productRepository.update(id, {
      ...input,
      id,
    });

    if (!updatedProduct) {
      throw new NotFoundError("Product");
    }

    return updatedProduct;
  }

  async findAllProducts(
    filters: ProductFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<Product>> {
    return this.productRepository.findAllWithFilters(filters, pagination);
  }

  async findBySalonId(salonId: string): Promise<Product[]> {
    if (!salonId) {
      throw new ValidationError("Salon ID is required");
    }

    return this.productRepository.findBySalonId(salonId);
  }

  async findPublicProducts(): Promise<ProductWithSalon[]> {
    return this.productRepository.findPublicProducts();
  }

  async findAll(
    filters?: ProductFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<Product>> {
    return this.findAllProducts(filters || {}, pagination);
  }
}
