import {
  BaseEntity,
  PaginationParams,
  PaginationResult,
  FilterParams,
} from "../types/common";
import { NotFoundError, ValidationError } from "../utils/errors";
import { validatePaginationParams } from "../utils/pagination";

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(
    filters?: FilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<T>>;
  deleteById(id: string): Promise<string | null>;
  exists(id: string): Promise<boolean>;
}

export abstract class BaseService<
  T extends BaseEntity,
  CreateInput,
  UpdateInput
> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  abstract create(input: CreateInput): Promise<T>;
  abstract update(id: string, input: UpdateInput): Promise<T>;

  async findById(id: string): Promise<T> {
    if (!id) {
      throw new ValidationError("ID is required");
    }

    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(this.getEntityName());
    }

    return entity;
  }

  async findAll(
    filters?: FilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<T>> {
    
    if (pagination) {
      validatePaginationParams(pagination);
    }

    return this.repository.findAll(filters, pagination, orderBy);
  }

  async deleteById(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("ID is required");
    }

    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError(this.getEntityName());
    }

    await this.repository.deleteById(id);
  }

  async exists(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }

    return this.repository.exists(id);
  }

  protected abstract getEntityName(): string;

  protected validateInput(input: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!input[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }
  }

  protected validatePartialInput(input: any, validFields: string[]): void {
    const inputFields = Object.keys(input);
    const invalidFields = inputFields.filter(
      (field) => !validFields.includes(field)
    );

    if (invalidFields.length > 0) {
      throw new ValidationError(`Invalid fields: ${invalidFields.join(", ")}`);
    }
  }
}
