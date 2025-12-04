import { z } from "zod";
import { SalonType } from "../constraint";

export const createSalonSchema = z.object({
  name: z.string().min(1, "name is required"),
  type: z.enum(SalonType),
  bio: z.string().default(""),
  location: z.string().min(1, "location must be a non-empty string"),
  contact_number: z.string().min(1, "contact_number is required"),
});

export const updateSalonSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(SalonType).optional(),
  bio: z.string().optional(),
  location: z.string().min(1).optional(),
  contact_number: z.string().min(1).optional(),
  status: z.string().optional(),
});

export const listSalonsQuerySchema = z.object({
  type: z.enum(SalonType).optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export type CreateSalonBody = z.infer<typeof createSalonSchema>;
export type UpdateSalonBody = z.infer<typeof updateSalonSchema>;
export type ListSalonsQuery = z.infer<typeof listSalonsQuerySchema>;
