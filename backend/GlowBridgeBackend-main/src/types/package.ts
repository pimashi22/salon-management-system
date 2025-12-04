import { BaseEntity, FilterParams, PaginationParams } from "./common";

export interface Package extends BaseEntity {
  id: string; 
  name: string;
  description?: string;
  is_public: boolean;
  discount?: number;
}

export interface PackageWithServices extends Package {
  services?: Array<{
    id: string;
    name: string;
    description: string;
    duration: string;
    price?: number | null;
    salon_id: string;
  }>;
}

export interface CreatePackageInput {
  name: string;
  description?: string;
  isPublic: boolean;
  discount?: number;
  serviceIds?: string[]; 
}

export interface UpdatePackageInput {
  id?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  discount?: number;
  serviceIds?: string[]; 
}

export interface PackageFilterParams extends FilterParams {
  name?: string;
  search?: string;
  is_public?: boolean;
  service_id?: string; 
}

export interface PackageQueryParams
  extends PackageFilterParams,
    PaginationParams {}

export interface CreatePackageBody {
  name: string;
  description?: string;
  is_public: boolean;
  discount?: number;
  service_ids?: string[]; 
}

export interface UpdatePackageBody {
  name?: string;
  description?: string;
  is_public?: boolean;
  discount?: number;
  service_ids?: string[]; 
}

export interface ListPackagesQuery extends PaginationParams {
  name?: string;
  search?: string;
  is_public?: boolean;
  service_id?: string;
}
