import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const listCategoriesQuerySchema = z.object({
  name: z.string().optional(),
  search: z.string().optional(),
  is_active: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  salon_id: z.string().uuid("Invalid salon_id format").optional(),
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

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
