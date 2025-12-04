import { BaseService } from "./BaseService";
import { SalonRepository } from "../repositories/SalonRepository";
import {
  Salon,
  CreateSalonInput,
  UpdateSalonInput,
  SalonFilterParams,
} from "../types/salon";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, NotFoundError } from "../utils/errors";

export class SalonService extends BaseService<
  Salon,
  CreateSalonInput,
  UpdateSalonInput
> {
  private salonRepository: SalonRepository;

  constructor(salonRepository: SalonRepository) {
    super(salonRepository);
    this.salonRepository = salonRepository;
  }

  protected getEntityName(): string {
    return "Salon";
  }

  async create(input: CreateSalonInput): Promise<Salon> {
    this.validateInput(input, ["name", "type", "location", "contactNumber"]);

    if (input.bio && input.bio.trim().length === 0) {
      throw new ValidationError("Bio cannot be empty");
    }

    return this.salonRepository.create(input);
  }

  async update(id: string, input: UpdateSalonInput): Promise<Salon> {
    if (!id) {
      throw new ValidationError("Salon ID is required");
    }

    if (input.bio !== undefined && input.bio.trim().length === 0) {
      throw new ValidationError("Bio cannot be empty if provided");
    }

    const updatedSalon = await this.salonRepository.update(id, {
      ...input,
      id,
    });

    if (!updatedSalon) {
      throw new NotFoundError("Salon");
    }

    return updatedSalon;
  }

  async deactivate(id: string): Promise<Salon> {
    if (!id) {
      throw new ValidationError("Salon ID is required");
    }

    const exists = await this.salonRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Salon");
    }

    const deactivatedSalon = await this.salonRepository.deactivate(id);
    if (!deactivatedSalon) {
      throw new NotFoundError("Salon");
    }

    return deactivatedSalon;
  }

  async findAllSalons(
    filters: SalonFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<Salon>> {
    return this.salonRepository.findAllWithFilters(filters, pagination);
  }

  async findByLocation(location: string): Promise<Salon[]> {
    if (!location || location.trim().length === 0) {
      throw new ValidationError("Location is required");
    }

    return this.salonRepository.findByLocation(location.trim());
  }

  async findByType(type: string): Promise<Salon[]> {
    if (!type) {
      throw new ValidationError("Salon type is required");
    }

    return this.salonRepository.findByType(type);
  }

  async findAll(
    filters?: SalonFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<Salon>> {
    return this.findAllSalons(filters || {}, pagination);
  }
}
