
interface BackendProduct {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
  salon_name?: string;
  salon_type?: string;
  salon_location?: string;
}
export interface Product {
  id: string;
  name: string;
  category: "hair-care" | "skin-care" | "tools" | "accessories";
  quantity: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
  salonId: string;
  description?: string;
  isPublic: boolean;
  discount: number;
  imageUrl?: string;
}
interface CreateProductPayload {
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
  image_url?: string;
}
interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  available_quantity?: number;
  is_public?: boolean;
  discount?: number;
  image_url?: string;
}
interface ProductsResponse {
  data: BackendProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductResponse {
  product: BackendProduct;
  message?: string;
}

interface DeleteResponse {
  message: string;
}
const determineCategory = (
  name: string,
  description?: string
): "hair-care" | "skin-care" | "tools" | "accessories" => {
  const text = `${name} ${description || ""}`.toLowerCase();

  if (
    text.includes("hair") ||
    text.includes("shampoo") ||
    text.includes("conditioner") ||
    text.includes("treatment")
  ) {
    return "hair-care";
  }
  if (
    text.includes("skin") ||
    text.includes("facial") ||
    text.includes("cleanser") ||
    text.includes("moisturizer")
  ) {
    return "skin-care";
  }
  if (
    text.includes("dryer") ||
    text.includes("tool") ||
    text.includes("equipment") ||
    text.includes("machine")
  ) {
    return "tools";
  }
  return "accessories";
};
const determineStatus = (
  quantity: number
): "in-stock" | "low-stock" | "out-of-stock" => {
  if (quantity === 0) return "out-of-stock";
  if (quantity <= 5) return "low-stock";
  return "in-stock";
};
const transformBackendProduct = (backendProduct: BackendProduct): Product => {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    category: determineCategory(
      backendProduct.name,
      backendProduct.description
    ),
    quantity: backendProduct.available_quantity,
    price: backendProduct.price,
    status: determineStatus(backendProduct.available_quantity),
    lastUpdated: new Date().toISOString().split("T")[0],
    salonId: backendProduct.salon_id,
    description: backendProduct.description,
    isPublic: backendProduct.is_public,
    discount: backendProduct.discount,
    imageUrl: backendProduct.image_url,
  };
};
const transformToBackendPayload = (product: {
  name: string;
  quantity: number;
  price: number;
  status: string;
  salonId: string;
  description?: string;
  isPublic?: boolean;
  discount?: number;
  imageUrl?: string;
}): CreateProductPayload => {
  return {
    salon_id: product.salonId,
    name: product.name,
    description: product.description,
    price: product.price,
    available_quantity: product.quantity,
    is_public: product.isPublic ?? true,
    discount: product.discount ?? 0,
    image_url: product.imageUrl,
  };
};
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
export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export const fetchProducts = async (
  page: number = 1,
  limit: number = 10,
  salonId?: string,
  isPublic?: boolean,
  minPrice?: number,
  maxPrice?: number
): Promise<PaginatedProductsResult> => {
  let endpoint = `/products?page=${page}&limit=${limit}`;

  if (salonId) endpoint += `&salon_id=${salonId}`;
  if (isPublic !== undefined) endpoint += `&is_public=${isPublic}`;
  if (minPrice !== undefined) endpoint += `&min_price=${minPrice}`;
  if (maxPrice !== undefined) endpoint += `&max_price=${maxPrice}`;

  const response = (await apiRequest(endpoint)) as ProductsResponse;
  return {
    products: response.data.map(transformBackendProduct),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};
export const fetchSalonProducts = async (
  salonId: string
): Promise<Product[]> => {
  const response = (await apiRequest(`/salons/${salonId}/products`)) as {
    data: BackendProduct[];
    message: string;
  };
  return response.data.map((product) => ({
    ...transformBackendProduct(product),
    salonId: salonId,
  }));
};
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = (await apiRequest(`/products/${id}`)) as ProductResponse;
  return transformBackendProduct(response.product);
};
export const fetchPublicProducts = async (): Promise<Product[]> => {
  const response = (await apiRequest(`/products/public`)) as {
    data: BackendProduct[];
    message: string;
  };
  return response.data.map(transformBackendProduct);
};
export const createProduct = async (productData: {
  name: string;
  quantity: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  salonId: string;
  description?: string;
  isPublic?: boolean;
  discount?: number;
  imageUrl?: string;
}): Promise<Product> => {
  const payload = transformToBackendPayload(productData);

  const response = (await apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as ProductResponse;

  return transformBackendProduct(response.product);
};
export const updateProduct = async (
  id: string,
  productData: {
    name?: string;
    quantity?: number;
    price?: number;
    status?: "in-stock" | "low-stock" | "out-of-stock";
    description?: string;
    isPublic?: boolean;
    discount?: number;
    imageUrl?: string;
  }
): Promise<Product> => {
  const payload: UpdateProductPayload = {};

  if (productData.name) payload.name = productData.name;
  if (productData.price !== undefined) payload.price = productData.price;
  if (productData.quantity !== undefined)
    payload.available_quantity = productData.quantity;
  if (productData.description !== undefined)
    payload.description = productData.description;
  if (productData.isPublic !== undefined)
    payload.is_public = productData.isPublic;
  if (productData.discount !== undefined)
    payload.discount = productData.discount;
  if (productData.imageUrl !== undefined)
    payload.image_url = productData.imageUrl;

  const response = (await apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as ProductResponse;

  return transformBackendProduct(response.product);
};
export const deleteProduct = async (
  id: string
): Promise<{ message: string }> => {
  return (await apiRequest(`/products/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;
};
