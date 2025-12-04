import { BaseService } from "./BaseService";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { SalonRepository } from "../repositories/SalonRepository";
import {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceFilterParams,
  ServiceWithCategories,
} from "../types/service";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, ConflictError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class ServiceService extends BaseService<
  Service,
  CreateServiceInput,
  UpdateServiceInput
> {
  private serviceRepository: ServiceRepository;
  private categoryRepository: CategoryRepository;
  private salonRepository: SalonRepository;

  constructor(
    serviceRepository: ServiceRepository,
    categoryRepository: CategoryRepository,
    salonRepository: SalonRepository
  ) {
    super(serviceRepository);
    this.serviceRepository = serviceRepository;
    this.categoryRepository = categoryRepository;
    this.salonRepository = salonRepository;
  }

  protected getEntityName(): string {
    return "Service";
  }

  async create(input: CreateServiceInput): Promise<Service> {
    
    this.validateInput(input, [
      "salonId",
      "name",
      "description",
      "duration",
      "isPublic",
    ]);

    const salonExists = await this.salonRepository.exists(input.salonId);
    if (!salonExists) {
      throw new NotFoundError("Salon");
    }

    if (input.categoryIds && input.categoryIds.length > 0) {
      for (const categoryId of input.categoryIds) {
        const categoryExists = await this.categoryRepository.exists(
          categoryId.toString()
        );
        if (!categoryExists) {
          throw new NotFoundError(`Category with ID ${categoryId}`);
        }
      }
    }

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError("Price must be non-negative");
    }

    if (
      input.discount !== undefined &&
      (input.discount < 0 || input.discount > 100)
    ) {
      throw new ValidationError("Discount must be between 0 and 100");
    }

    try {
      const createdService = await this.serviceRepository.create(input);
      logger.info(`Service created successfully with ID: ${createdService.id}`);
      return createdService;
    } catch (error) {
      logger.error("Failed to create service:", error);
      throw new Error(`Failed to create service: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateServiceInput): Promise<Service> {
    
    if (!id) {
      throw new ValidationError("Service ID is required");
    }

    if (input.salonId) {
      const salonExists = await this.salonRepository.exists(input.salonId);
      if (!salonExists) {
        throw new NotFoundError("Salon");
      }
    }

    if (input.categoryIds && input.categoryIds.length > 0) {
      for (const categoryId of input.categoryIds) {
        const categoryExists = await this.categoryRepository.exists(
          categoryId.toString()
        );
        if (!categoryExists) {
          throw new NotFoundError(`Category with ID ${categoryId}`);
        }
      }
    }

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError("Price must be non-negative");
    }

    if (
      input.discount !== undefined &&
      (input.discount < 0 || input.discount > 100)
    ) {
      throw new ValidationError("Discount must be between 0 and 100");
    }

    const updatedService = await this.serviceRepository.update(id, {
      ...input,
      id,
    });

    if (!updatedService) {
      throw new NotFoundError("Service");
    }

    logger.info(`Service updated successfully: ${id}`);
    return updatedService;
  }

  async findAllServices(
    filters: ServiceFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<Service>> {
    return this.serviceRepository.findAllWithFilters(filters, pagination);
  }

  async findAllServicesWithCategories(
    filters: ServiceFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<ServiceWithCategories>> {
    return this.serviceRepository.findAllWithCategories(filters, pagination);
  }

  async findByIdWithCategories(id: string): Promise<ServiceWithCategories> {
    if (!id) {
      throw new ValidationError("Service ID is required");
    }

    const service = await this.serviceRepository.findByIdWithCategories(id);
    if (!service) {
      throw new NotFoundError("Service");
    }

    return service;
  }

  async findBySalonId(salonId: string): Promise<Service[]> {
    if (!salonId) {
      throw new ValidationError("Salon ID is required");
    }

    return this.serviceRepository.findBySalonId(salonId);
  }

  async findByCategoryId(categoryId: number): Promise<Service[]> {
    if (!categoryId) {
      throw new ValidationError("Category ID is required");
    }

    return this.serviceRepository.findByCategoryId(categoryId);
  }

  async deleteById(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("Service ID is required");
    }

    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Service");
    }

    try {
      
      await this.serviceRepository.deleteById(id);
      logger.info(`Service deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete service ${id}:`, error);
      throw new Error(`Failed to delete service: ${(error as Error).message}`);
    }
  }

  async findAll(
    filters?: ServiceFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<Service>> {
    return this.findAllServices(filters || {}, pagination);
  }

  async getPublicServices(
    filters: ServiceFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<ServiceWithCategories>> {
    const publicFilters = { ...filters, is_public: true };
    return this.findAllServicesWithCategories(publicFilters, pagination);
  }

  async getCompletedServices(
    filters: ServiceFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<ServiceWithCategories>> {
    const completedFilters = { ...filters, is_completed: true };
    return this.findAllServicesWithCategories(completedFilters, pagination);
  }

  async toggleServicePublicStatus(id: string): Promise<Service> {
    const service = await this.findById(id);
    return this.update(id, { isPublic: !service.is_public });
  }

  async toggleServiceCompletedStatus(id: string): Promise<Service> {
    const service = await this.findById(id);
    return this.update(id, { isCompleted: !service.is_completed });
  }

  async updateServiceCategories(
    id: string,
    categoryIds: number[]
  ): Promise<Service> {
    
    for (const categoryId of categoryIds) {
      const categoryExists = await this.categoryRepository.exists(
        categoryId.toString()
      );
      if (!categoryExists) {
        throw new NotFoundError(`Category with ID ${categoryId}`);
      }
    }

    return this.update(id, { categoryIds });
  }
}
