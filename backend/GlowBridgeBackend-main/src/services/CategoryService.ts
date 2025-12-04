import { BaseService } from "./BaseService";
import { CategoryRepository } from "../repositories/CategoryRepository";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilterParams,
  CategoryWithServices,
} from "../types/category";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, ConflictError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class CategoryService extends BaseService<
  Category,
  CreateCategoryInput,
  UpdateCategoryInput
> {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository) {
    super(categoryRepository);
    this.categoryRepository = categoryRepository;
  }

  protected getEntityName(): string {
    return "Category";
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    this.validateInput(input, ["name"]);

    const existingCategory = await this.categoryRepository.findByName(
      input.name
    );
    if (existingCategory) {
      throw new ConflictError("Category name already exists");
    }

    try {
      const createdCategory = await this.categoryRepository.create(input);
      logger.info(
        `Category created successfully with ID: ${createdCategory.id}`
      );
      return createdCategory;
    } catch (error) {
      logger.error("Failed to create category:", error);
      throw new Error(`Failed to create category: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    if (!id) {
      throw new ValidationError("Category ID is required");
    }

    if (input.name) {
      const existingCategory = await this.categoryRepository.findByName(
        input.name
      );
      if (existingCategory && existingCategory.id.toString() !== id) {
        throw new ConflictError("Category name already exists");
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, {
      ...input,
      id,
    });

    if (!updatedCategory) {
      throw new NotFoundError("Category");
    }

    logger.info(`Category updated successfully: ${id}`);
    return updatedCategory;
  }

  async findAllCategories(
    filters: CategoryFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<Category>> {
    return this.categoryRepository.findAllWithFilters(filters, pagination);
  }

  async findByName(name: string): Promise<Category | null> {
    if (!name) {
      throw new ValidationError("Category name is required");
    }

    return this.categoryRepository.findByName(name);
  }

  async deleteById(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("Category ID is required");
    }

    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category");
    }

    try {
      await this.categoryRepository.deleteById(id);
      logger.info(`Category deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete category ${id}:`, error);
      throw new Error(`Failed to delete category: ${(error as Error).message}`);
    }
  }

  async findAll(
    filters?: CategoryFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<Category>> {
    return this.findAllCategories(filters || {}, pagination);
  }

  async getActiveCategories(
    pagination?: PaginationParams
  ): Promise<PaginationResult<Category>> {
    return this.findAllCategories({ is_active: true }, pagination);
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const category = await this.findById(id);
    return this.update(id, { isActive: !category.is_active });
  }

  async findCategoriesWithServicesBySalonId(
    salonId: string,
    filters: CategoryFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<CategoryWithServices>> {
    if (!salonId) {
      throw new ValidationError("Salon ID is required");
    }

    try {
      return await this.categoryRepository.findCategoriesWithServicesBySalonId(
        salonId,
        filters,
        pagination
      );
    } catch (error) {
      logger.error(
        "Failed to find categories with services by salon ID:",
        error
      );
      throw new Error(
        `Failed to find categories with services: ${(error as Error).message}`
      );
    }
  }
}
