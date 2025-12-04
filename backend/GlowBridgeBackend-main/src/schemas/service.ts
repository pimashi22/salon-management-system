import { z } from "zod";

export const createServiceSchema = z.object({
  salon_id: z.string().uuid("salon_id must be a valid UUID"),
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required"),
  duration: z.string().min(1, "duration is required"),
  price: z.number().int().min(0).optional(),
  is_public: z.boolean(),
  discount: z.number().int().min(0).max(100).default(0).optional(),
  is_completed: z.boolean().default(false).optional(),
  category_ids: z
    .array(z.number().int().positive())
    .min(1, "At least one category is required"),
});

export const updateServiceSchema = z.object({
  salon_id: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  duration: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  is_public: z.boolean().optional(),
  discount: z.number().int().min(0).max(100).optional(),
  is_completed: z.boolean().optional(),
  category_ids: z.array(z.number().int().positive()).optional(),
});

export const listServicesQuerySchema = z.object({
  salon_id: z.string().uuid().optional(),
  is_completed: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  name: z.string().optional(),
  search: z.string().optional(),
  is_public: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  category_id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
});

export type CreateServiceBody = z.infer<typeof createServiceSchema>;
export type UpdateServiceBody = z.infer<typeof updateServiceSchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
