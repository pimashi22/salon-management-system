import { z } from "zod";

import { UserRole } from "../constraint";

export const createUserSchema = z.object({
  first_name: z.string().min(1, "first_name is required"),
  last_name: z.string().min(1, "last_name is required"),
  email: z.string().email("email must be a valid email address"),
  contact_number: z.string().min(1, "contact_number is required"),
  role: z.enum(UserRole).default(UserRole.CUSTOMER),
  password: z
    .string()
    .min(6, "password must be at least 6 characters")
    .optional(),
  salon_id: z.string().uuid("salon_id must be a valid UUID").optional(),
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contact_number: z.string().min(1).optional(),
  role: z.enum(UserRole).optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(UserRole).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const salonIdParamSchema = z.object({
  salonId: z.string().uuid("salonId must be a valid UUID"),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type SalonIdParam = z.infer<typeof salonIdParamSchema>;
