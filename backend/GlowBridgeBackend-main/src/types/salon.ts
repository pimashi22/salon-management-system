import { BaseEntity, FilterParams, PaginationParams } from "./common";
import { SalonType } from "../constraint";

export interface Salon extends BaseEntity {
  name: string;
  type: SalonType;
  bio: string;
  location: string;
  contact_number: string;
  status: string;
}

export interface CreateSalonInput {
  name: string;
  type: SalonType;
  bio: string;
  location: string;
  contactNumber: string;
}

export interface UpdateSalonInput {
  id?: string;
  name?: string;
  type?: SalonType;
  bio?: string;
  location?: string;
  contactNumber?: string;
  status?: string;
}

export interface SalonFilterParams extends FilterParams {
  type?: SalonType;
  status?: string;
  location?: string;
}

export interface SalonQueryParams extends SalonFilterParams, PaginationParams {}

export interface CreateSalonBody {
  name: string;
  type: SalonType;
  bio: string;
  location: string;
  contact_number: string;
}

export interface UpdateSalonBody {
  name?: string;
  type?: SalonType;
  bio?: string;
  location?: string;
  contact_number?: string;
  status?: string;
}

export interface ListSalonsQuery extends PaginationParams {
  type?: SalonType;
  status?: string;
  location?: string;
}
