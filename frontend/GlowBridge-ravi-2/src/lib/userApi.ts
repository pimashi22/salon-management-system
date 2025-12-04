import { UserRole } from "@/constraint";

interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "active" | "inactive";
  joinDate: string;
  salonId: string;
}

interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  password?: string;
}

interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
  role?: string;
}

interface UsersResponse {
  users: BackendUser[];
}

interface PaginatedUsersResponse {
  data: BackendUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserResponse {
  user: BackendUser;
}

interface DeleteResponse {
  message: string;
}

export interface StaffAvailabilityItem {
  id: string;
  salon_staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  salon_name: string;
}

interface StaffAvailabilityResponse {
  data: StaffAvailabilityItem[];
  message: string;
}

interface UpdateStaffAvailabilityPayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface UpdateStaffAvailabilityResponse {
  message: string;
}

const mapUserRoleToBackendRole = (userRole: UserRole | string): string => {
  if (typeof userRole === "string") {
    const roleString = userRole.toLowerCase();
    switch (roleString) {
      case "admin":
        return "admin";
      case "staff":
      case "salon_staff":
        return "salon_staff";
      case "salon_owner":
        return "salon_owner";
      case "customer":
      default:
        return "customer";
    }
  }

  switch (userRole) {
    case UserRole.ADMIN:
      return "admin";
    case UserRole.STAFF:
      return "salon_staff";
    case UserRole.SALON_OWNER:
      return "salon_owner";
    case UserRole.CUSTOMER:
    default:
      return "customer";
  }
};

const mapBackendRoleToUserRole = (backendRole: string): UserRole => {
  switch (backendRole) {
    case "admin":
      return UserRole.ADMIN;
    case "salon_staff":
      return UserRole.STAFF;
    case "salon_owner":
      return UserRole.SALON_OWNER;
    case "customer":
    default:
      return UserRole.CUSTOMER;
  }
};

const transformBackendUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    name: `${backendUser.first_name} ${backendUser.last_name}`.trim(),
    email: backendUser.email,
    phone: backendUser.contact_number,
    role: mapBackendRoleToUserRole(backendUser.role),
    status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    salonId: "1",
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

export interface PaginatedUsersResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  role?: string
): Promise<PaginatedUsersResult> => {
  let endpoint = `/users?page=${String(page)}&limit=${String(limit)}`;
  if (role && role !== "all") {
    endpoint += `&role=${encodeURIComponent(role)}`;
  }

  const response = (await apiRequest(endpoint)) as PaginatedUsersResponse;
  return {
    users: response.data.map(transformBackendUser),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

export const fetchSalonUsers = async (salonId: string): Promise<User[]> => {
  const response = (await apiRequest(
    `/salon/${salonId}/user`
  )) as UsersResponse;
  return response.users.map((user) => ({
    ...transformBackendUser(user),
    salonId: salonId,
  }));
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = (await apiRequest(`/users/${id}`)) as UserResponse;
  return transformBackendUser(response.user);
};

export const fetchUserByEmail = async (email: string): Promise<User> => {
  try {
    try {
      const directResponse = await apiRequest(
        `/users?page=1&limit=1&email=${encodeURIComponent(email)}`
      );

      const response = directResponse as PaginatedUsersResponse;
      if (response.data && response.data.length > 0) {
        const user = response.data.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          return transformBackendUser(user);
        }
      }
    } catch {}

    let page = 1;
    const limit = 100;

    while (true) {
      const result = await fetchUsers(page, limit);

      const userWithEmail = result.users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (userWithEmail) {
        return userWithEmail;
      }

      if (page >= result.totalPages || result.users.length === 0) {
        break;
      }

      page++;
    }

    throw new ApiError(`User with email ${email} not found`, 404);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to fetch user by email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
};

export const fetchUserByFirebaseUID = async (
  firebaseUid: string
): Promise<User> => {
  const response = await apiRequest(`/users/firebase/${firebaseUid}`);

  const apiResponse = response as {
    success: boolean;
    message: string;
    data: BackendUser;
  };

  if (!apiResponse.success || !apiResponse.data) {
    throw new ApiError(
      apiResponse.message || `User with Firebase UID ${firebaseUid} not found`,
      404
    );
  }

  return transformBackendUser(apiResponse.data);
};

export const createUser = async (userData: {
  name: string;
  email: string;
  phone: string;
  role: UserRole | string;
  status: "active" | "inactive";
  password?: string;
}): Promise<User> => {
  const nameParts = userData.name.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const payload: CreateUserPayload = {
    first_name: firstName,
    last_name: lastName,
    email: userData.email,
    contact_number: userData.phone,
    role: mapUserRoleToBackendRole(userData.role),
  };

  if (userData.password) {
    payload.password = userData.password;
  }

  try {
    const response = (await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    })) as UserResponse;

    return transformBackendUser(response.user);
  } catch (error) {
    if (error instanceof ApiError) {
      let errorMessage = error.message;

      if (
        error.message.includes("Email already exists") ||
        error.message.includes("already exists in Firebase")
      ) {
        errorMessage = "An account with this email already exists";
      } else if (
        error.message.includes("weak password") ||
        error.message.includes("password")
      ) {
        errorMessage = "Password is too weak. Please use at least 6 characters";
      } else if (
        error.message.includes("invalid email") ||
        error.message.includes("email")
      ) {
        errorMessage = "Please enter a valid email address";
      }

      throw new ApiError(errorMessage, error.status, error.response);
    }

    throw error;
  }
};

export const createUserDirect = async (userData: {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  password?: string;
}): Promise<User> => {
  const payload: CreateUserPayload = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    contact_number: userData.contact_number,
    role: mapUserRoleToBackendRole(userData.role),
  };

  if (userData.password) {
    payload.password = userData.password;
  }

  const response = (await apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as UserResponse;

  return transformBackendUser(response.user);
};

export const updateUser = async (
  id: string,
  userData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    status?: "active" | "inactive";
  }
): Promise<User> => {
  const payload: UpdateUserPayload = {};

  if (userData.name) {
    const nameParts = userData.name.trim().split(" ");
    payload.first_name = nameParts[0] || "";
    payload.last_name = nameParts.slice(1).join(" ") || "";
  }

  if (userData.email) payload.email = userData.email;
  if (userData.phone) payload.contact_number = userData.phone;
  if (userData.role) payload.role = mapUserRoleToBackendRole(userData.role);

  const response = (await apiRequest(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as UserResponse;

  return transformBackendUser(response.user);
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  return (await apiRequest(`/users/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;
};

export const fetchStaffAvailability = async (): Promise<
  StaffAvailabilityItem[]
> => {
  const response = (await apiRequest(
    "/staff-availability"
  )) as StaffAvailabilityResponse;
  return response.data;
};

export const updateStaffAvailability = async (
  availabilityId: string,
  updateData: UpdateStaffAvailabilityPayload
): Promise<{ message: string }> => {
  const response = (await apiRequest(`/staff-availability/${availabilityId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  })) as UpdateStaffAvailabilityResponse;

  return response;
};
