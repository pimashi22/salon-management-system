import { Service } from "./categoryApi";
interface BackendPackage {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  is_public: boolean;
  discount: number;
  total_price: number;
  final_price: number;
  image?: string;
  status: string;
  services?: Service[];
  service_count?: number;
  created_at?: string;
  updated_at?: string;
}
export interface Package {
  id: string;
  name: string;
  description: string;
  image?: string;
  services: string[];
  serviceIds: string[];
  serviceCount: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  isPrivate: boolean;
  status: string;
  salonId: string;
  createdAt?: string;
  updatedAt?: string;
}
interface CreatePackagePayload {
  salon_id?: string;
  name: string;
  description: string;
  is_public: boolean;
  service_ids: string[];
  discount?: number;
}
interface UpdatePackagePayload {
  name?: string;
  description?: string;
  is_public?: boolean;
  service_ids: string[];
  discount?: number;
}
interface PackagesResponse {
  data: BackendPackage[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

interface PackageResponse {
  package?: BackendPackage;
  data?: BackendPackage;
  message?: string;
  success?: boolean;
}

interface DeleteResponse {
  message: string;
  success?: boolean;
}
const calculatePackagePricing = (
  services: Service[],
  discount: number
): { totalPrice: number; finalPrice: number } => {
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
  const finalPrice = totalPrice - (totalPrice * discount) / 100;
  return { totalPrice, finalPrice };
};
const transformBackendPackage = (backendPackage: BackendPackage): Package => {
  const services = backendPackage.services || [];
  const { totalPrice, finalPrice } =
    backendPackage.total_price && backendPackage.final_price
      ? {
          totalPrice: backendPackage.total_price,
          finalPrice: backendPackage.final_price,
        }
      : calculatePackagePricing(services, backendPackage.discount);

  return {
    id: backendPackage.id,
    name: backendPackage.name,
    description: backendPackage.description,
    image: backendPackage.image,
    services: services.map((service) => service.name),
    serviceIds: services.map((service) => service.id),
    serviceCount: backendPackage.service_count || services.length,
    totalPrice,
    discount: backendPackage.discount,
    finalPrice,
    isPrivate: !backendPackage.is_public,
    status: backendPackage.status,
    salonId: backendPackage.salon_id,
    createdAt: backendPackage.created_at,
    updatedAt: backendPackage.updated_at,
  };
};
const transformToBackendPayload = (packageData: {
  name: string;
  description: string;
  selectedServices: string[];
  isPrivate: boolean;
  discount: string;
  salonId?: string;
}): CreatePackagePayload => {
  return {
    salon_id: packageData.salonId,
    name: packageData.name,
    description: packageData.description,
    is_public: !packageData.isPrivate,
    service_ids: packageData.selectedServices,
    discount: parseFloat(packageData.discount) || 0,
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
        errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`,
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
export interface PaginatedPackagesResult {
  packages: Package[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export const fetchPackages = async (
  page: number = 1,
  limit: number = 10,
  name?: string,
  salonId?: string,
  isPublic?: boolean
): Promise<PaginatedPackagesResult> => {
  let endpoint = `/packages?page=${page}&limit=${limit}`;

  if (name) endpoint += `&name=${encodeURIComponent(name)}`;
  if (salonId) endpoint += `&salon_id=${salonId}`;
  if (isPublic !== undefined) endpoint += `&is_public=${isPublic}`;

  const response = (await apiRequest(endpoint)) as PackagesResponse;

  return {
    packages: response.data.map(transformBackendPackage),
    total: response.total || response.data.length,
    page: response.page || page,
    limit: response.limit || limit,
    totalPages:
      response.totalPages ||
      Math.ceil((response.total || response.data.length) / limit),
  };
};
export const fetchAllPackages = async (
  name?: string,
  salonId?: string
): Promise<Package[]> => {
  let endpoint = `/packages`;
  const params = new URLSearchParams();

  if (name) params.append("name", name);
  if (salonId) params.append("salon_id", salonId);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  const response = (await apiRequest(endpoint)) as PackagesResponse;
  return response.data.map(transformBackendPackage);
};
export const searchPackagesByName = async (
  name: string
): Promise<Package[]> => {
  const response = (await apiRequest(
    `/packages?name=${encodeURIComponent(name)}`
  )) as PackagesResponse;
  return response.data.map(transformBackendPackage);
};
export const fetchPublicPackages = async (): Promise<Package[]> => {
  const response = (await apiRequest(`/packages/public`)) as PackagesResponse;
  return response.data.map(transformBackendPackage);
};
export const fetchSalonPackages = async (
  salonId: string
): Promise<Package[]> => {
  const response = (await apiRequest(
    `/salons/${salonId}/packages`
  )) as PackagesResponse;
  return response.data.map(transformBackendPackage);
};
export const fetchPackageById = async (id: string): Promise<Package> => {
  const response = (await apiRequest(`/packages/${id}`)) as PackageResponse;
  const packageData = response.package || response.data;
  if (!packageData) {
    throw new ApiError("Package not found", 404);
  }
  return transformBackendPackage(packageData);
};
export const createPackage = async (packageData: {
  name: string;
  description: string;
  selectedServices: string[];
  isPrivate: boolean;
  discount: string;
  salonId?: string;
}): Promise<Package> => {
  const payload = transformToBackendPayload(packageData);

  const response = (await apiRequest("/packages", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as PackageResponse;

  const createdPackage = response.package || response.data;
  if (!createdPackage) {
    throw new ApiError("Failed to create package", 500);
  }
  return transformBackendPackage(createdPackage);
};
export const updatePackage = async (
  id: string,
  packageData: {
    name?: string;
    description?: string;
    selectedServices: string[];
    isPrivate?: boolean;
    discount?: string;
  }
): Promise<Package> => {
  const payload: UpdatePackagePayload = {
    service_ids: packageData.selectedServices,
  };

  if (packageData.name !== undefined) payload.name = packageData.name;
  if (packageData.description !== undefined)
    payload.description = packageData.description;
  if (packageData.isPrivate !== undefined)
    payload.is_public = !packageData.isPrivate;
  if (packageData.discount !== undefined)
    payload.discount = parseFloat(packageData.discount) || 0;


  await apiRequest(`/packages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });


  const refreshedPackage = await fetchPackageById(id);
  return refreshedPackage;
};
export const deletePackage = async (
  id: string
): Promise<{ message: string }> => {
  const response = (await apiRequest(`/packages/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;

  return { message: response.message };
};
export const togglePackagePublicStatus = async (
  id: string
): Promise<Package> => {
  const response = (await apiRequest(`/packages/${id}/toggle-public`, {
    method: "PATCH",
  })) as PackageResponse;

  const updatedPackage = response.package || response.data;
  if (!updatedPackage) {
    throw new ApiError("Failed to toggle package status", 500);
  }
  return transformBackendPackage(updatedPackage);
};
