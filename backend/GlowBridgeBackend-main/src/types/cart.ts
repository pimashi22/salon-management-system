import { BaseEntity, FilterParams, PaginationParams } from "./common";

export interface Cart extends BaseEntity {
  user_id: string;
  product_id: string;
  quantity: number;
}

export interface CreateCartInput {
  userId: string;
  productId: string;
  quantity: number;
}

export interface UpdateCartInput {
  id?: string;
  userId?: string;
  productId?: string;
  quantity?: number;
}

export interface CartFilterParams extends FilterParams {
  user_id?: string;
  product_id?: string;
}

export interface CartQueryParams extends CartFilterParams, PaginationParams {}

export interface CreateCartBody {
  user_id: string;
  product_id: string;
  quantity: number;
}

export interface UpdateCartBody {
  user_id?: string;
  product_id?: string;
  quantity?: number;
}

export interface ListCartQuery extends PaginationParams {
  user_id?: string;
  product_id?: string;
}

export interface CartWithProduct extends Cart {
  product_name?: string;
  product_price?: number;
  product_description?: string;
  product_available_quantity?: number;
}
