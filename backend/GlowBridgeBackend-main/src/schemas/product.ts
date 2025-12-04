import { z } from "zod";

export const createProductSchema = z.object({
  salon_id: z.string().uuid("salon_id must be a valid UUID"),
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
  price: z.number().int().min(0, "price must be a non-negative integer"),
  available_quantity: z
    .number()
    .int()
    .min(0, "available_quantity must be a non-negative integer"),
  is_public: z.boolean().default(true),
  discount: z.number().int().min(0).max(100).default(0),
  image_url: z.string().url("image_url must be a valid URL").optional(),
});

export const updateProductSchema = z.object({
  salon_id: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().min(0).optional(),
  available_quantity: z.number().int().min(0).optional(),
  is_public: z.boolean().optional(),
  discount: z.number().int().min(0).max(100).optional(),
  image_url: z.string().url("image_url must be a valid URL").optional(),
});

export const listProductsQuerySchema = z.object({
  salon_id: z.string().uuid().optional(),
  is_public: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  min_price: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0))
    .optional(),
  max_price: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0))
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

export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
