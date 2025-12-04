import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createStaffAvailabilitySchema = z
  .object({
    salon_staff_id: z.string().uuid("salon_staff_id must be a valid UUID"),
    day_of_week: z
      .number()
      .int()
      .min(0, "day_of_week must be between 0 and 6")
      .max(6, "day_of_week must be between 0 and 6"),
    start_time: z
      .string()
      .regex(timeRegex, "start_time must be in HH:MM format (24-hour)"),
    end_time: z
      .string()
      .regex(timeRegex, "end_time must be in HH:MM format (24-hour)"),
    is_available: z.boolean().default(true),
  })
  .refine(
    (data) => {
      
      const [startHour, startMin] = data.start_time.split(":").map(Number);
      const [endHour, endMin] = data.end_time.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMin;
      const endTotalMinutes = endHour * 60 + endMin;

      return startTotalMinutes < endTotalMinutes;
    },
    {
      message: "start_time must be before end_time",
      path: ["start_time"],
    }
  );

export const updateStaffAvailabilitySchema = z
  .object({
    salon_staff_id: z.string().uuid().optional(),
    day_of_week: z.number().int().min(0).max(6).optional(),
    start_time: z
      .string()
      .regex(timeRegex, "start_time must be in HH:MM format (24-hour)")
      .optional(),
    end_time: z
      .string()
      .regex(timeRegex, "end_time must be in HH:MM format (24-hour)")
      .optional(),
    is_available: z.boolean().optional(),
  })
  .refine(
    (data) => {
      
      if (data.start_time && data.end_time) {
        const [startHour, startMin] = data.start_time.split(":").map(Number);
        const [endHour, endMin] = data.end_time.split(":").map(Number);

        const startTotalMinutes = startHour * 60 + startMin;
        const endTotalMinutes = endHour * 60 + endMin;

        return startTotalMinutes < endTotalMinutes;
      }
      return true;
    },
    {
      message: "start_time must be before end_time",
      path: ["start_time"],
    }
  );

export const listStaffAvailabilityQuerySchema = z.object({
  salon_staff_id: z.string().uuid().optional(),
  day_of_week: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(6))
    .optional(),
  is_available: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const createWeeklyAvailabilitySchema = z.object({
  salon_staff_id: z.string().uuid("salon_staff_id must be a valid UUID"),
  availability: z
    .array(
      z
        .object({
          day_of_week: z.number().int().min(0).max(6),
          start_time: z.string().regex(timeRegex),
          end_time: z.string().regex(timeRegex),
          is_available: z.boolean().default(true),
        })
        .refine(
          (data) => {
            const [startHour, startMin] = data.start_time
              .split(":")
              .map(Number);
            const [endHour, endMin] = data.end_time.split(":").map(Number);

            const startTotalMinutes = startHour * 60 + startMin;
            const endTotalMinutes = endHour * 60 + endMin;

            return startTotalMinutes < endTotalMinutes;
          },
          {
            message: "start_time must be before end_time",
            path: ["start_time"],
          }
        )
    )
    .min(1, "At least one availability slot is required"),
});

export const searchStaffAvailabilitySchema = z
  .object({
    staff_name: z.string().min(1).optional(),
    salon_name: z.string().min(1).optional(),
    day_of_week: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(0).max(6))
      .optional(),
    time_start: z
      .string()
      .regex(timeRegex, "time_start must be in HH:MM format (24-hour)")
      .optional(),
    time_end: z
      .string()
      .regex(timeRegex, "time_end must be in HH:MM format (24-hour)")
      .optional(),
    is_available: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().min(1)),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().min(1).max(100)),
  })
  .refine(
    (data) => {
      
      if (data.time_start && data.time_end) {
        const [startHour, startMin] = data.time_start.split(":").map(Number);
        const [endHour, endMin] = data.time_end.split(":").map(Number);

        const startTotalMinutes = startHour * 60 + startMin;
        const endTotalMinutes = endHour * 60 + endMin;

        return startTotalMinutes < endTotalMinutes;
      }
      return true;
    },
    {
      message: "time_start must be before time_end",
      path: ["time_start"],
    }
  );

export const searchAvailableStaffSchema = z
  .object({
    day_of_week: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(0).max(6)),
    time_start: z
      .string()
      .regex(timeRegex, "time_start must be in HH:MM format (24-hour)"),
    time_end: z
      .string()
      .regex(timeRegex, "time_end must be in HH:MM format (24-hour)"),
    staff_name: z.string().min(1).optional(),
    salon_name: z.string().min(1).optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().min(1)),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().min(1).max(100)),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.time_start.split(":").map(Number);
      const [endHour, endMin] = data.time_end.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMin;
      const endTotalMinutes = endHour * 60 + endMin;

      return startTotalMinutes < endTotalMinutes;
    },
    {
      message: "time_start must be before time_end",
      path: ["time_start"],
    }
  );

export const quickSearchStaffSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const findAvailableStaffAtTimeSchema = z.object({
  day_of_week: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(6)),
  time_slot: z
    .string()
    .regex(timeRegex, "time_slot must be in HH:MM format (24-hour)"),
  duration: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(480))
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

export const staffScheduleSchema = z.object({
  staff_name: z.string().min(1, "Staff name is required"),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export type CreateStaffAvailabilityBody = z.infer<
  typeof createStaffAvailabilitySchema
>;
export type UpdateStaffAvailabilityBody = z.infer<
  typeof updateStaffAvailabilitySchema
>;
export type ListStaffAvailabilityQuery = z.infer<
  typeof listStaffAvailabilityQuerySchema
>;
export type CreateWeeklyAvailabilityBody = z.infer<
  typeof createWeeklyAvailabilitySchema
>;
export type SearchStaffAvailabilityQuery = z.infer<
  typeof searchStaffAvailabilitySchema
>;
export type SearchAvailableStaffQuery = z.infer<
  typeof searchAvailableStaffSchema
>;
export type QuickSearchStaffQuery = z.infer<typeof quickSearchStaffSchema>;
export type FindAvailableStaffAtTimeQuery = z.infer<
  typeof findAvailableStaffAtTimeSchema
>;
export type StaffScheduleQuery = z.infer<typeof staffScheduleSchema>;
