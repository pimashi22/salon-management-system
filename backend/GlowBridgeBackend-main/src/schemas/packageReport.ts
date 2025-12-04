// src/schemas/packageReport.ts
import { z } from "zod";

export const packageReportQuerySchema = z.object({
  package_id: z.string().optional(),
  service_id: z.string().optional(),
  // optional date filters (ISO strings)
  start_at_from: z.string().datetime().optional(),
  start_at_to: z.string().datetime().optional(),
});

export type PackageReportQuery = z.infer<typeof packageReportQuerySchema>;
