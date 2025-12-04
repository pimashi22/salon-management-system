// src/controllers/ReportController.ts
import { Request, Response } from "express";
import { ReportService } from "../services/ReportService";
import { sendErrorResponse } from "../utils/errors";

export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  async getServicesReport(req: Request, res: Response): Promise<Response> {
    try {
      // Query params come from validateQuery middleware if you add it
      const { category_id, service_id, start_at_from, start_at_to } = req.query as any;

      const start = start_at_from ? new Date(start_at_from as string) : undefined;
      const end = start_at_to ? new Date(start_at_to as string) : undefined;

      const data = await this.reportService.getServiceReport({
        categoryId: category_id,
        serviceId: service_id,
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

export function createReportControllerInstance(reportService: ReportService) {
  const controller = new ReportController(reportService);
  return {
    getServicesReportHandler: controller.getServicesReport.bind(controller),
  };
}
