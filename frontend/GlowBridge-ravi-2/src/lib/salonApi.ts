import { SalonType } from "@/constraint";
interface BackendSalon {
  id: string;
  name: string;
  type: string;
  bio: string;
  location: string;
  contact_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}
export interface Salon {
  id: string;
  name: string;
  type: SalonType;
  bio: string;
  location: string;
  contact_number: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
interface CreateSalonPayload {
  name: string;
  type: string;
  bio: string;
  location: string;
  contact_number: string;
  status?: string;
}
interface UpdateSalonPayload {
  name?: string;
  type?: string;
  bio?: string;
  location?: string;
  contact_number?: string;
  status?: string;
}
interface SalonsResponse {
  data: BackendSalon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SalonResponse {
  salon: BackendSalon;
}

interface DeleteResponse {
  message: string;
}
const mapSalonTypeToBackendType = (salonType: SalonType): string => {
  return salonType;
};
const mapBackendTypeToSalonType = (backendType: string): SalonType => {

  const typeMapping: Record<string, SalonType> = {
    salon: SalonType.SALON,
    "Hair & Makeup": SalonType.MAKEUP_SALON,
    "Full Service Salon": SalonType.SALON,
    "Spa & Wellness": SalonType.BEAUTY_PARLOR,
    barbershop: SalonType.BARBERSHOP,
    beauty_parlor: SalonType.BEAUTY_PARLOR,
    nail_salon: SalonType.NAIL_SALON,
    hair_salon: SalonType.HAIR_SALON,
    makeup_salon: SalonType.MAKEUP_SALON,
  };

  return typeMapping[backendType] || SalonType.SALON;
};
const transformBackendSalon = (backendSalon: BackendSalon): Salon => {
  return {
    id: backendSalon.id,
    name: backendSalon.name,
    type: mapBackendTypeToSalonType(backendSalon.type),
    bio: backendSalon.bio,
    location: backendSalon.location,
    contact_number: backendSalon.contact_number,
    status: backendSalon.status,
    created_at: backendSalon.created_at,
    updated_at: backendSalon.updated_at,
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
export const fetchSalons = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  salons: Salon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const response = (await apiRequest(
    `/salons?page=${page}&limit=${limit}`
  )) as SalonsResponse;
  return {
    salons: response.data.map(transformBackendSalon),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};
export const fetchSalonById = async (id: string): Promise<Salon> => {
  const response = (await apiRequest(`/salons/${id}`)) as SalonResponse;
  return transformBackendSalon(response.salon);
};
export const createSalon = async (salonData: {
  name: string;
  type: SalonType;
  bio: string;
  location: string;
  contact_number: string;
  status?: string;
}): Promise<Salon> => {
  const payload: CreateSalonPayload = {
    name: salonData.name,
    type: mapSalonTypeToBackendType(salonData.type),
    bio: salonData.bio,
    location: salonData.location,
    contact_number: salonData.contact_number,
    status: salonData.status || "active",
  };

  const response = (await apiRequest("/salons", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as SalonResponse;

  return transformBackendSalon(response.salon);
};
export const updateSalon = async (
  id: string,
  salonData: {
    name?: string;
    type?: SalonType;
    bio?: string;
    location?: string;
    contact_number?: string;
    status?: string;
  }
): Promise<Salon> => {
  const payload: UpdateSalonPayload = {};

  if (salonData.name) payload.name = salonData.name;
  if (salonData.type) payload.type = mapSalonTypeToBackendType(salonData.type);
  if (salonData.bio) payload.bio = salonData.bio;
  if (salonData.location) payload.location = salonData.location;
  if (salonData.contact_number)
    payload.contact_number = salonData.contact_number;
  if (salonData.status) payload.status = salonData.status;

  const response = (await apiRequest(`/salons/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as SalonResponse;

  return transformBackendSalon(response.salon);
};
export const deleteSalon = async (id: string): Promise<{ message: string }> => {
  return (await apiRequest(`/salons/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;
};
