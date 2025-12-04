import { BaseEntity, FilterParams, PaginationParams } from "./common";

export interface Service extends BaseEntity {
  id: string; 
  salon_id: string; 
  is_completed: boolean;
  name: string;
  description: string;
  duration: string;
  price?: number;
  is_public: boolean;
  discount?: number;
}

export interface CreateServiceInput {
  salonId: string;
  name: string;
  description: string;
  duration: string;
  price?: number;
  isPublic: boolean;
  discount?: number;
  isCompleted?: boolean;
  categoryIds?: number[]; 
}

export interface UpdateServiceInput {
  id?: string;
  salonId?: string;
  name?: string;
  description?: string;
  duration?: string;
  price?: number;
  isPublic?: boolean;
  discount?: number;
  isCompleted?: boolean;
  categoryIds?: number[]; 
}

export interface ServiceFilterParams extends FilterParams {
  salon_id?: string;
  is_completed?: boolean;
  name?: string;
  search?: string;
  is_public?: boolean;
  category_id?: number; 
}

export interface ServiceQueryParams
  extends ServiceFilterParams,
    PaginationParams {}

export interface CreateServiceBody {
  salon_id: string;
  name: string;
  description: string;
  duration: string;
  price?: number;
  is_public: boolean;
  discount?: number;
  is_completed?: boolean;
  category_ids?: number[]; 
}

export interface UpdateServiceBody {
  salon_id?: string;
  name?: string;
  description?: string;
  duration?: string;
  price?: number;
  is_public?: boolean;
  discount?: number;
  is_completed?: boolean;
  category_ids?: number[]; 
}

export interface ListServicesQuery extends PaginationParams {
  salon_id?: string;
  is_completed?: boolean;
  name?: string;
  search?: string;
  is_public?: boolean;
  category_id?: number;
}

export interface ServiceWithCategories extends Service {
  categories?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}
