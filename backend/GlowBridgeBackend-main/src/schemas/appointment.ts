import { z } from "zod";

export const createAppointmentSchema = z
  .object({
    user_id: z.string().uuid("user_id must be a valid UUID"),
    note: z.string().min(1, "note is required"),
    service_id: z.string().uuid("service_id must be a valid UUID"),
    start_at: z.string().datetime("start_at must be a valid ISO datetime"),
    end_at: z.string().datetime("end_at must be a valid ISO datetime"),
    payment_type: z.string().min(1, "payment_type is required"),
    amount: z.number().min(0, "amount must be greater than or equal to 0"),
    is_paid: z.boolean().default(false).optional(),
    status: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      const startAt = new Date(data.start_at);
      const endAt = new Date(data.end_at);
      return endAt > startAt;
    },
    {
      message: "end_at must be after start_at",
      path: ["end_at"],
    }
  );

export const updateAppointmentSchema = z
  .object({
    user_id: z.string().uuid("user_id must be a valid UUID").optional(),
    note: z.string().min(1).optional(),
    service_id: z.string().uuid("service_id must be a valid UUID").optional(),
    start_at: z
      .string()
      .datetime("start_at must be a valid ISO datetime")
      .optional(),
    end_at: z
      .string()
      .datetime("end_at must be a valid ISO datetime")
      .optional(),
    payment_type: z.string().min(1).optional(),
    amount: z
      .number()
      .min(0, "amount must be greater than or equal to 0")
      .optional(),
    is_paid: z.boolean().optional(),
    status: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.start_at && data.end_at) {
        const startAt = new Date(data.start_at);
        const endAt = new Date(data.end_at);
        return endAt > startAt;
      }
      return true;
    },
    {
      message: "end_at must be after start_at",
      path: ["end_at"],
    }
  );

export const listAppointmentsQuerySchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID").optional(),
  service_id: z.string().uuid("service_id must be a valid UUID").optional(),
  payment_type: z.string().optional(),
  is_paid: z.enum(["true", "false"]).optional(),
  status: z.string().optional(),
  start_at_from: z
    .string()
    .datetime("start_at_from must be a valid ISO datetime")
    .optional(),
  start_at_to: z
    .string()
    .datetime("start_at_to must be a valid ISO datetime")
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["upcoming", "in_progress", "completed"], {
    message: "status must be one of: upcoming, in_progress, completed",
  }),
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type UpdateAppointmentStatusBody = z.infer<
  typeof updateAppointmentStatusSchema
>;
