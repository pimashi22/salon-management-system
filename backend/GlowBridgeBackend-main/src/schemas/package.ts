import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
  is_public: z.boolean(),
  discount: z.number().min(0).max(100).multipleOf(0.01).default(0).optional(),
  service_ids: z
    .array(z.string().uuid("Service ID must be a valid UUID"))
    .optional(),
});

export const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
  discount: z.number().min(0).max(100).multipleOf(0.01).optional(),
  service_ids: z
    .array(z.string().uuid("Service ID must be a valid UUID"))
    .optional(),
});

export const listPackagesQuerySchema = z.object({
  name: z.string().optional(),
  search: z.string().optional(),
  is_public: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  service_id: z.string().uuid().optional(),
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

export type CreatePackageBody = z.infer<typeof createPackageSchema>;
export type UpdatePackageBody = z.infer<typeof updatePackageSchema>;
export type ListPackagesQuery = z.infer<typeof listPackagesQuerySchema>;
