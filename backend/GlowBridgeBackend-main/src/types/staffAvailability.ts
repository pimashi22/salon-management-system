import { FilterParams, PaginationParams } from "./common";

export interface StaffAvailability {
  id: string;
  salon_staff_id: string;
  day_of_week: number; 
  start_time: string; 
  end_time: string; 
  is_available: boolean;
}

export interface CreateStaffAvailabilityInput {
  salonStaffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface UpdateStaffAvailabilityInput {
  id?: string;
  salonStaffId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
}

export interface StaffAvailabilityFilterParams extends FilterParams {
  salon_staff_id?: string;
  day_of_week?: number;
  is_available?: boolean;
}

export interface StaffAvailabilityQueryParams
  extends StaffAvailabilityFilterParams,
    PaginationParams {}

export interface CreateStaffAvailabilityBody {
  salon_staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

export interface UpdateStaffAvailabilityBody {
  salon_staff_id?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
}

export interface ListStaffAvailabilityQuery extends PaginationParams {
  salon_staff_id?: string;
  day_of_week?: number;
  is_available?: boolean;
}

export interface StaffAvailabilityWithStaff extends StaffAvailability {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
  role?: string;
  salon_name?: string;
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export interface WeeklyAvailability {
  salon_staff_id: string;
  staff_name?: string;
  availability: {
    [key in DayOfWeek]?: StaffAvailability[];
  };
}
