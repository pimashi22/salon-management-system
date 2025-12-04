// src/controllers/PackageReportController.ts
import { Request, Response } from "express";
import { PackageReportService } from "../services/PackageReportService";
import { sendErrorResponse } from "../utils/errors";

export class PackageReportController {
  private reportService: PackageReportService;

  constructor(reportService: PackageReportService) {
    this.reportService = reportService;
  }

  async getPackagesReport(req: Request, res: Response): Promise<Response> {
    try {
      // Query params from the request (all strings)
      const { package_id, service_id, start_at_from, start_at_to } = req.query as any;

      const start = start_at_from ? new Date(start_at_from as string) : undefined;
      const end = start_at_to ? new Date(start_at_to as string) : undefined;

      // pass options object to service
      const data = await this.reportService.getPackageReport({
        packageId: package_id as string | undefined,
        serviceId: service_id as string | undefined,
        startAt: start,
        endAt: end,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  }
}

export function createPackageReportControllerInstance(reportService: PackageReportService) {
  const controller = new PackageReportController(reportService);
  return {
    getPackagesReportHandler: controller.getPackagesReport.bind(controller),
  };
}
