import { BaseService } from "./BaseService";
import { PackageRepository } from "../repositories/PackageRepository";
import {
  Package,
  CreatePackageInput,
  UpdatePackageInput,
  PackageFilterParams,
  PackageWithServices,
} from "../types/package";
import { PaginationResult } from "../types/common";
import { NotFoundError, ValidationError } from "../utils/errors";
import { validatePaginationParams } from "../utils/pagination";

export class PackageService extends BaseService<
  Package,
  CreatePackageInput,
  UpdatePackageInput
> {
  private packageRepository: PackageRepository;

  constructor(packageRepository: PackageRepository) {
    super(packageRepository);
    this.packageRepository = packageRepository;
  }

  protected getEntityName(): string {
    return "Package";
  }

  async create(input: CreatePackageInput): Promise<Package> {
    this.validateCreateInput(input);
    return await this.packageRepository.create(input);
  }

  async update(id: string, input: UpdatePackageInput): Promise<Package> {
    if (!id) {
      throw new ValidationError("Package ID is required");
    }

    this.validateUpdateInput(input);

    const existingPackage = await this.packageRepository.findById(id);
    if (!existingPackage) {
      throw new NotFoundError("Package not found");
    }

    return await this.packageRepository.update(id, input);
  }

  async delete(id: string): Promise<Package> {
    if (!id) {
      throw new ValidationError("Package ID is required");
    }

    const existingPackage = await this.packageRepository.findById(id);
    if (!existingPackage) {
      throw new NotFoundError("Package not found");
    }

    return await this.packageRepository.delete(id);
  }

  async findById(id: string): Promise<Package> {
    if (!id) {
      throw new ValidationError("Package ID is required");
    }

    const package_ = await this.packageRepository.findById(id);
    if (!package_) {
      throw new NotFoundError("Package not found");
    }

    return package_;
  }

  async findByIdWithServices(id: string): Promise<PackageWithServices> {
    if (!id) {
      throw new ValidationError("Package ID is required");
    }

    const package_ = await this.packageRepository.findByIdWithServices(id);
    if (!package_) {
      throw new NotFoundError("Package not found");
    }

    return package_;
  }

  async findAll(
    filters: PackageFilterParams = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginationResult<Package>> {
    validatePaginationParams(pagination);
    return await this.packageRepository.findAll(filters, pagination);
  }

  async findAllPackagesWithServices(
    filters: PackageFilterParams = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginationResult<PackageWithServices>> {
    validatePaginationParams(pagination);
    return await this.packageRepository.findAllWithServices(
      filters,
      pagination
    );
  }

  async getPublicPackages(
    filters: Omit<PackageFilterParams, "is_public"> = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginationResult<PackageWithServices>> {
    validatePaginationParams(pagination);
    return await this.packageRepository.getPublicPackages(filters, pagination);
  }

  async findByServiceId(serviceId: string): Promise<Package[]> {
    if (!serviceId) {
      throw new ValidationError("Service ID is required");
    }

    return await this.packageRepository.findByServiceId(serviceId);
  }

  async updatePackageServices(
    id: string,
    serviceIds: string[]
  ): Promise<Package> {
    if (!id) {
      throw new ValidationError("Package ID is required");
    }

    if (!Array.isArray(serviceIds)) {
      throw new ValidationError("Service IDs must be an array");
    }

    const existingPackage = await this.packageRepository.findById(id);
    if (!existingPackage) {
      throw new NotFoundError("Package not found");
    }

    return await this.packageRepository.updateServices(id, serviceIds);
  }

  async togglePackagePublicStatus(id: string): Promise<Package> {
    if (!id) {
      throw new ValidationError("Package ID is required");
    }

    const existingPackage = await this.packageRepository.findById(id);
    if (!existingPackage) {
      throw new NotFoundError("Package not found");
    }

    return await this.packageRepository.togglePublicStatus(id);
  }

  private validateCreateInput(input: CreatePackageInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Package name is required");
    }

    if (typeof input.isPublic !== "boolean") {
      throw new ValidationError("is_public must be a boolean");
    }

    if (input.discount !== undefined) {
      if (
        typeof input.discount !== "number" ||
        input.discount < 0 ||
        input.discount > 100
      ) {
        throw new ValidationError(
          "Discount must be a number between 0 and 100"
        );
      }
    }

    if (input.serviceIds && !Array.isArray(input.serviceIds)) {
      throw new ValidationError("Service IDs must be an array");
    }

    if (input.serviceIds) {
      for (const serviceId of input.serviceIds) {
        if (typeof serviceId !== "string" || serviceId.trim().length === 0) {
          throw new ValidationError("All service IDs must be valid strings");
        }
      }
    }
  }

  private validateUpdateInput(input: UpdatePackageInput): void {
    
    const hasFields = [
      input.name,
      input.description,
      input.isPublic,
      input.discount,
      input.serviceIds,
    ].some((field) => field !== undefined);

    if (!hasFields) {
      throw new ValidationError(
        "At least one field must be provided for update"
      );
    }

    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError("Package name cannot be empty");
    }

    if (input.isPublic !== undefined && typeof input.isPublic !== "boolean") {
      throw new ValidationError("is_public must be a boolean");
    }

    if (input.discount !== undefined) {
      if (
        typeof input.discount !== "number" ||
        input.discount < 0 ||
        input.discount > 100
      ) {
        throw new ValidationError(
          "Discount must be a number between 0 and 100"
        );
      }
    }

    if (input.serviceIds !== undefined && !Array.isArray(input.serviceIds)) {
      throw new ValidationError("Service IDs must be an array");
    }

    if (input.serviceIds) {
      for (const serviceId of input.serviceIds) {
        if (typeof serviceId !== "string" || serviceId.trim().length === 0) {
          throw new ValidationError("All service IDs must be valid strings");
        }
      }
    }
  }
}
