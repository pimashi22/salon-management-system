export interface UpdateAppointmentParams {
  id: string;
  userId?: string;
  note?: string;
  serviceId?: string;
  startAt?: Date;
  endAt?: Date;
  paymentType?: string;
  amount?: number;
  isPaid?: boolean;
}

export interface UpdateAppointmentRow {
  id: string;
  user_id: string;
  note: string;
  service_id: string;
  start_at: Date;
  end_at: Date;
  payment_type: string;
  amount: number;
  is_paid: boolean;
  created_at: Date;
  updated_at: Date;
}
