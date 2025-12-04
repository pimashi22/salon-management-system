// src/schemas/report.ts
import { z } from "zod";

export const serviceReportQuerySchema = z.object({
  category_id: z.string().optional(),      // or z.number().optional() depending on client
  service_id: z.string().uuid().optional(),
  start_at_from: z.string().datetime().optional(),
  start_at_to: z.string().datetime().optional(),
  page: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().min(1).max(100)).optional(),
});

export type ServiceReportQuery = z.infer<typeof serviceReportQuerySchema>;
