import { BaseEntity, FilterParams, PaginationParams } from "./common";
import { UserRole } from "../constraint";

export interface User extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: UserRole;
  firebase_uid?: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: UserRole;
  password?: string;
  firebaseUid?: string;
  salonId?: string;
}

export interface UpdateUserInput {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  role?: UserRole;
  firebaseUid?: string;
}

export interface UserFilterParams extends FilterParams {
  role?: UserRole;
}

export interface UserQueryParams extends UserFilterParams, PaginationParams {}

export interface CreateUserBody {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: UserRole;
  password?: string;
  salon_id?: string;
}

export interface UpdateUserBody {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
  role?: UserRole;
}

export interface ListUsersQuery extends PaginationParams {
  role?: UserRole;
}
