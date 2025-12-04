
interface BackendOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

interface BackendOrder {
  id: string;
  user_id: string;
  description: string;
  payment_type: string;
  amount: number;
  is_paid: boolean;
  items: BackendOrderItem[];
}
export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  description: string;
  paymentType: string;
  totalAmount: number;
  isPaid: boolean;
  items: OrderItem[];

  status?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  orderDate?: string;
  shippingAddress?: string;
  notes?: string;
}
export interface CreateOrderItem {
  product_id: string;
  quantity: number;
  price: number;
}
export interface CreateOrderPayload {
  user_id: string;
  items: CreateOrderItem[];
  description: string;
  payment_type: string;
}
export interface UpdateOrderStatusPayload {
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}
interface OrdersResponse {
  orders: BackendOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {

  const url = `/api_g${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      0
    );
  }
};
const transformBackendOrder = (backendOrder: BackendOrder): Order => {
  return {
    id: backendOrder.id,
    userId: backendOrder.user_id,
    description: backendOrder.description,
    paymentType: backendOrder.payment_type,
    totalAmount: backendOrder.amount,
    isPaid: backendOrder.is_paid,
    items: backendOrder.items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.quantity * item.price,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),

    status: backendOrder.is_paid ? "confirmed" : "pending",
    orderDate: backendOrder.items[0]?.created_at || new Date().toISOString(),
    notes: backendOrder.description,
  };
};
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<BackendOrder> => {
  const response = (await apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { data: BackendOrder; message: string };

  return response.data;
};
export const createOrderFromCart = async (
  userId: string,
  cartItems: CreateOrderItem[],
  description: string,
  paymentType: string
): Promise<BackendOrder> => {
  return createOrder({
    user_id: userId,
    items: cartItems,
    description: description,
    payment_type: paymentType,
  });
};
export const cancelOrder = async (
  orderId: string
): Promise<{ message: string }> => {
  const response = (await apiRequest(`/orders/${orderId}/cancel`, {
    method: "POST",
  })) as { message: string };

  return response;
};
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<Order> => {
  const response = (await apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })) as BackendOrder;

  return transformBackendOrder(response);
};
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  const response = (await apiRequest(
    `/orders/${orderId}/details`
  )) as BackendOrder;

  return transformBackendOrder(response);
};
export const getUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const response = (await apiRequest(
    `/orders?user_id=${userId}&page=${page}&limit=${limit}`
  )) as OrdersResponse;

  return {
    orders: response.orders.map(transformBackendOrder),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};
