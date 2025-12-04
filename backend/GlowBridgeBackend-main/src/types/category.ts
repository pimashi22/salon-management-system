import { BaseEntity, FilterParams, PaginationParams } from "./common";

export interface Category extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryFilterParams extends FilterParams {
  name?: string;
  search?: string;
  is_active?: boolean;
  salon_id?: string;
}

export interface CategoryQueryParams
  extends CategoryFilterParams,
    PaginationParams {}

export interface CreateCategoryBody {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ListCategoriesQuery extends PaginationParams {
  name?: string;
  search?: string;
  is_active?: boolean;
  salon_id?: string;
}

export interface CategoryWithServices extends Category {
  services?: Array<{
    id: string;
    salon_id: string;
    name: string;
    description: string;
    duration: string;
    price?: number;
    is_public: boolean;
    discount?: number;
    is_completed: boolean;
  }>;
}
