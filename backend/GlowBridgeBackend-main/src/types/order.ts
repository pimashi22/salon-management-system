import { BaseEntity, FilterParams, PaginationParams } from "./common";

export enum PaymentType {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  CASH = "cash",
  DIGITAL_WALLET = "digital_wallet",
}

export interface Order extends BaseEntity {
  user_id: string;
  description?: string;
  payment_type: string;
  amount: number;
  is_paid: boolean;
}

export interface OrderItem extends BaseEntity {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number; 
}

export interface CreateOrderInput {
  userId: string;
  items: CreateOrderItemInput[];
  description?: string;
  paymentType: string;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface UpdateOrderInput {
  id?: string;
  description?: string;
  paymentType?: string;
  amount?: number;
  isPaid?: boolean;
}

export interface OrderFilterParams extends FilterParams {
  user_id?: string;
  payment_type?: string;
  is_paid?: boolean;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
}

export interface OrderQueryParams extends OrderFilterParams, PaginationParams {}

export interface CreateOrderBody {
  user_id: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  description?: string;
  payment_type: string;
}

export interface UpdateOrderBody {
  description?: string;
  payment_type?: string;
  amount?: number;
  is_paid?: boolean;
}

export interface ListOrdersQuery extends PaginationParams {
  user_id?: string;
  payment_type?: string;
  is_paid?: boolean;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  product_name?: string;
  product_description?: string;
  product_available_quantity?: number;
}

export interface OrderSummary {
  total_orders: number;
  total_amount: number;
  average_order_value: number;
  orders_by_payment_type: {
    [key: string]: number;
  };
  paid_orders: number;
  unpaid_orders: number;
}
