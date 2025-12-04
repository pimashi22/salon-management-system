import { BaseEntity, FilterParams, PaginationParams } from "./common";

export interface Product extends BaseEntity {
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
  image_url?: string;
}

export interface ProductWithSalon extends Product {
  salon_name?: string;
  salon_type?: string;
  salon_location?: string;
}

export interface CreateProductInput {
  salonId: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity: number;
  isPublic?: boolean;
  discount?: number;
  imageUrl?: string;
}

export interface UpdateProductInput {
  id?: string;
  salonId?: string;
  name?: string;
  description?: string;
  price?: number;
  availableQuantity?: number;
  isPublic?: boolean;
  discount?: number;
  imageUrl?: string;
}

export interface ProductFilterParams extends FilterParams {
  salon_id?: string;
  is_public?: boolean;
  min_price?: number;
  max_price?: number;
}

export interface ProductQueryParams
  extends ProductFilterParams,
    PaginationParams {}

export interface CreateProductBody {
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_public?: boolean;
  discount?: number;
  image_url?: string;
}

export interface UpdateProductBody {
  salon_id?: string;
  name?: string;
  description?: string;
  price?: number;
  available_quantity?: number;
  is_public?: boolean;
  discount?: number;
  image_url?: string;
}

export interface ListProductsQuery extends PaginationParams {
  salon_id?: string;
  is_public?: boolean;
  min_price?: number;
  max_price?: number;
}
