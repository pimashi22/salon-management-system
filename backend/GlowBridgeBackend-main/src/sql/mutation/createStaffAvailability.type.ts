export interface CreateStaffAvailabilityParams {
  salonStaffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface CreateStaffAvailabilityRow {
  id: string;
  salon_staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}
