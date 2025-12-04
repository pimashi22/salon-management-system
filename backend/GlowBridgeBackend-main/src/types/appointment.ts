import { BaseEntity, FilterParams, PaginationParams } from "./common";

export interface Appointment extends BaseEntity {
  user_id: string;
  note: string;
  service_id: string;
  start_at: Date;
  end_at: Date;
  payment_type: string;
  amount: number;
  is_paid: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentWithRelations extends Appointment {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    duration: string;
  };
}

export interface CreateAppointmentInput {
  userId: string;
  note: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  paymentType: string;
  amount: number;
  isPaid?: boolean;
  status?: string;
}

export interface UpdateAppointmentInput {
  id?: string;
  userId?: string;
  note?: string;
  serviceId?: string;
  startAt?: Date;
  endAt?: Date;
  paymentType?: string;
  amount?: number;
  isPaid?: boolean;
  status?: string;
}

export interface AppointmentFilterParams {
  user_id?: string;
  service_id?: string;
  payment_type?: string;
  is_paid?: boolean;
  status?: string;
  start_at_from?: Date;
  start_at_to?: Date;
  [key: string]: string | number | boolean | Date | undefined;
}

export interface AppointmentQueryParams
  extends AppointmentFilterParams,
    PaginationParams {}

export interface CreateAppointmentBody {
  user_id: string;
  note: string;
  service_id: string;
  start_at: string; 
  end_at: string; 
  payment_type: string;
  amount: number;
  is_paid?: boolean;
  status?: string;
}

export interface UpdateAppointmentBody {
  user_id?: string;
  note?: string;
  service_id?: string;
  start_at?: string; 
  end_at?: string; 
  payment_type?: string;
  amount?: number;
  is_paid?: boolean;
  status?: string;
}

export interface ListAppointmentsQuery extends PaginationParams {
  user_id?: string;
  service_id?: string;
  payment_type?: string;
  is_paid?: string; 
  status?: string;
  start_at_from?: string; 
  start_at_to?: string; 
}

export interface UpdateAppointmentStatusBody {
  status: "upcoming" | "in_progress" | "completed";
}
