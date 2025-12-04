import { z } from "zod";
import { PaymentType } from "../types/order";

export const createOrderItemSchema = z.object({
  product_id: z.string().uuid("product_id must be a valid UUID"),
  quantity: z.number().int().min(1, "quantity must be at least 1"),
  price: z.number().min(0, "price must be non-negative"),
});

export const createOrderSchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID"),
  items: z.array(createOrderItemSchema).min(1, "At least one item is required"),
  description: z.string().optional(),
  payment_type: z.string().min(1, "payment_type is required"),
});

export const updateOrderSchema = z.object({
  description: z.string().optional(),
  payment_type: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  is_paid: z.boolean().optional(),
});

export const listOrdersQuerySchema = z
  .object({
    user_id: z.string().uuid("user_id must be a valid UUID").optional(),
    payment_type: z.string().min(1).optional(),
    is_paid: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional(),
    min_amount: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(0))
      .optional(),
    max_amount: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(0))
      .optional(),
    start_date: z
      .string()
      .datetime({ message: "start_date must be a valid ISO datetime" })
      .optional(),
    end_date: z
      .string()
      .datetime({ message: "end_date must be a valid ISO datetime" })
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
      
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) < new Date(data.end_date);
      }
      return true;
    },
    {
      message: "start_date must be before end_date",
      path: ["start_date"],
    }
  )
  .refine(
    (data) => {
      
      if (data.min_amount !== undefined && data.max_amount !== undefined) {
        return data.min_amount <= data.max_amount;
      }
      return true;
    },
    {
      message: "min_amount must be less than or equal to max_amount",
      path: ["min_amount"],
    }
  );

export const orderSummaryQuerySchema = z
  .object({
    user_id: z.string().uuid("user_id must be a valid UUID").optional(),
    start_date: z
      .string()
      .datetime({ message: "start_date must be a valid ISO datetime" })
      .optional(),
    end_date: z
      .string()
      .datetime({ message: "end_date must be a valid ISO datetime" })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) < new Date(data.end_date);
      }
      return true;
    },
    {
      message: "start_date must be before end_date",
      path: ["start_date"],
    }
  );

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type UpdateOrderBody = z.infer<typeof updateOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type OrderSummaryQuery = z.infer<typeof orderSummaryQuerySchema>;
