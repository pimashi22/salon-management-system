
export interface CreateAppointmentPayload {
  user_id: string;
  note: string;
  service_id: string;
  start_at: string;
  end_at: string;
  payment_type: "cash" | "card" | "online";
  amount: number;
}
export interface Service {
  id: string;
  salon_id: string;
  is_completed: boolean;
  name: string;
  description: string;
  duration: string;
  price: number;
  is_public: boolean;
  discount: number;
  categories: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}
export interface AppointmentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
}
export interface AppointmentService {
  id: string;
  name: string;
  description: string;
  duration: string;
}
export interface Appointment {
  id: string;
  user_id: string;
  note: string;
  service_id: string;
  start_at: string;
  end_at: string;
  payment_type: string;
  amount: number;
  is_paid: boolean;
  status: "upcoming" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  user: AppointmentUser;
  service: AppointmentService;
}
export interface AllAppointmentsResponse {
  success: boolean;
  message: string;
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
interface ServiceResponse {
  success: boolean;
  data: Service;
}

interface AppointmentResponse {
  appointment: Appointment;
}

interface AppointmentsResponse {
  appointments: Appointment[];
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
export const fetchServiceById = async (serviceId: string): Promise<Service> => {
  const response = (await apiRequest(
    `/services/${serviceId}`
  )) as ServiceResponse;

  if (!response.success) {
    throw new ApiError("Failed to fetch service details", 404);
  }

  return response.data;
};
export const createAppointment = async (
  appointmentData: CreateAppointmentPayload
): Promise<Appointment> => {
  const response = (await apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  })) as AppointmentResponse;

  return response.appointment;
};
export const fetchUserAppointments = async (
  userId: string
): Promise<Appointment[]> => {
  const response = (await apiRequest(
    `/appointments/user/${userId}`
  )) as AppointmentsResponse;
  return response.appointments;
};
export const fetchAppointmentById = async (
  id: string
): Promise<Appointment> => {
  const response = (await apiRequest(
    `/appointments/${id}`
  )) as AppointmentResponse;
  return response.appointment;
};
export const updateAppointment = async (
  id: string,
  appointmentData: Partial<CreateAppointmentPayload>
): Promise<Appointment> => {
  const response = (await apiRequest(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointmentData),
  })) as AppointmentResponse;

  return response.appointment;
};
export const cancelAppointment = async (
  id: string
): Promise<{ message: string }> => {
  return (await apiRequest(`/appointments/${id}`, {
    method: "DELETE",
  })) as { message: string };
};
export const updateAppointmentStatus = async (
  id: string,
  status: "upcoming" | "in_progress" | "completed"
): Promise<Appointment> => {

  const url = `/api_g/appointments/${id}/status`;

  const config: RequestInit = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
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

    const result = await response.json();

    if (!result.success) {
      throw new ApiError(
        result.message || "Failed to update appointment status",
        400
      );
    }

    return result.data;
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
export const fetchAllAppointments = async (
  limit: number = 100,
  page: number = 1
): Promise<AllAppointmentsResponse> => {

  const url = `/api_g/appointments?limit=${limit}&page=${page}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
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
