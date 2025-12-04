import { z } from "zod";

export const createCartSchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID"),
  product_id: z.string().uuid("product_id must be a valid UUID"),
  quantity: z.number().int().min(1, "quantity must be at least 1"),
});

export const updateCartSchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID").optional(),
  product_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).optional(),
});

export const listCartQuerySchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID").optional(),
  product_id: z.string().uuid().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export type CreateCartBody = z.infer<typeof createCartSchema>;
export type UpdateCartBody = z.infer<typeof updateCartSchema>;
export type ListCartQuery = z.infer<typeof listCartQuerySchema>;
