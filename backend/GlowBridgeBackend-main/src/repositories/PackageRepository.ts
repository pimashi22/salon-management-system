import { Pool } from "pg";
import {
  Package,
  CreatePackageInput,
  UpdatePackageInput,
  PackageFilterParams,
  PackageWithServices,
} from "../types/package";
import {
  PaginationParams,
  PaginationResult,
  FilterParams,
} from "../types/common";
import { DatabaseError } from "../utils/errors";
import {
  createPaginationResult,
  getPaginationOffset,
} from "../utils/pagination";
import { createQueryBuilder } from "../utils/queryBuilder";
import {
  executeCreatePackage,
  CreatePackageParams,
} from "../sql/mutation/createPackage";
import {
  executeUpdatePackage,
  UpdatePackageParams,
} from "../sql/mutation/updatePackage";
import { executeDeletePackage } from "../sql/mutation/deletePackage";
import {
  executeGetPackageById,
  executeGetPackageByIdWithServices,
} from "../sql/query/getPackageById";
import {
  executeListPackages,
  ListPackagesParams,
} from "../sql/query/listPackages";
export class PackageRepository {
  private pool: Pool;
  private tableName: string = "package";

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private mapRowToEntity(row: any): Package {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      is_public: row.is_public,
      discount: row.discount,
    };
  }

  private getSelectFields(): string {
    return "id, name, description, is_public, discount";
  }

  async create(input: CreatePackageInput): Promise<Package> {
    try {
      const params: CreatePackageParams = {
        name: input.name,
        description: input.description,
        isPublic: input.isPublic,
        discount: input.discount,
        serviceIds: input.serviceIds,
      };

      const result = await executeCreatePackage(this.pool, params);
      return this.mapRowToEntity(result);
    } catch (error) {
      throw new DatabaseError(`Failed to create package: ${error}`);
    }
  }

  async update(id: string, input: UpdatePackageInput): Promise<Package> {
    try {
      const params: UpdatePackageParams = {
        id,
        name: input.name,
        description: input.description,
        isPublic: input.isPublic,
        discount: input.discount,
        serviceIds: input.serviceIds,
      };

      const result = await executeUpdatePackage(this.pool, params);
      return this.mapRowToEntity(result);
    } catch (error) {
      throw new DatabaseError(`Failed to update package: ${error}`);
    }
  }

  async delete(id: string): Promise<Package> {
    try {
      const result = await executeDeletePackage(this.pool, id);
      return this.mapRowToEntity(result);
    } catch (error) {
      throw new DatabaseError(`Failed to delete package: ${error}`);
    }
  }

  async deleteById(id: string): Promise<string | null> {
    try {
      await this.delete(id);
      return id;
    } catch (error) {
      return null;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.findById(id);
      return result !== null;
    } catch (error) {
      return false;
    }
  }

  async findById(id: string): Promise<Package | null> {
    try {
      const result = await executeGetPackageById(this.pool, id);
      return this.mapRowToEntity(result);
    } catch (error) {
      if ((error as Error).message === "Package not found") {
        return null;
      }
      throw new DatabaseError(`Failed to find package by id: ${error}`);
    }
  }

  async findByIdWithServices(id: string): Promise<PackageWithServices | null> {
    try {
      const result = await executeGetPackageByIdWithServices(this.pool, id);
      return {
        ...this.mapRowToEntity(result),
        services: result.services,
      };
    } catch (error) {
      if ((error as Error).message === "Package not found") {
        return null;
      }
      throw new DatabaseError(`Failed to find package with services: ${error}`);
    }
  }

  async findAll(
    filters: PackageFilterParams = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginationResult<Package>> {
    try {
      const params: ListPackagesParams = {
        ...filters,
        ...pagination,
      };

      const result = await executeListPackages(this.pool, params);

      return {
        data: result.packages.map((pkg) => this.mapRowToEntity(pkg)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to list packages: ${error}`);
    }
  }

  async findAllWithServices(
    filters: PackageFilterParams = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginationResult<PackageWithServices>> {
    try {
      const params: ListPackagesParams = {
        ...filters,
        ...pagination,
      };

      const result = await executeListPackages(this.pool, params);

      return {
        data: result.packages.map((pkg) => ({
          ...this.mapRowToEntity(pkg),
          services: pkg.services,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to list packages with services: ${error}`
      );
    }
  }

  async getPublicPackages(
    filters: Omit<PackageFilterParams, "is_public"> = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginationResult<PackageWithServices>> {
    return this.findAllWithServices(
      { ...filters, is_public: true },
      pagination
    );
  }

  async findByServiceId(serviceId: string): Promise<Package[]> {
    try {
      const query = `
        SELECT DISTINCT p.${this.getSelectFields()}
        FROM package p
        INNER JOIN package_service ps ON p.id = ps.package_id
        WHERE ps.service_id = $1
        ORDER BY p.name ASC
      `;

      const result = await this.pool.query(query, [serviceId]);
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      throw new DatabaseError(
        `Failed to find packages by service ID: ${error}`
      );
    }
  }

  async updateServices(id: string, serviceIds: string[]): Promise<Package> {
    try {
      const params: UpdatePackageParams = {
        id,
        serviceIds,
      };

      const result = await executeUpdatePackage(this.pool, params);
      return this.mapRowToEntity(result);
    } catch (error) {
      throw new DatabaseError(`Failed to update package services: ${error}`);
    }
  }

  async togglePublicStatus(id: string): Promise<Package> {
    try {
      const currentPackage = await this.findById(id);
      if (!currentPackage) {
        throw new Error("Package not found");
      }

      const params: UpdatePackageParams = {
        id,
        isPublic: !currentPackage.is_public,
      };

      const result = await executeUpdatePackage(this.pool, params);
      return this.mapRowToEntity(result);
    } catch (error) {
      throw new DatabaseError(
        `Failed to toggle package public status: ${error}`
      );
    }
  }
}
