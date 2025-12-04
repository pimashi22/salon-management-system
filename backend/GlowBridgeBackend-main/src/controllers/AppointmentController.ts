import { Request, Response } from "express";
import { AppointmentService } from "../services/AppointmentService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  CreateAppointmentBody,
  UpdateAppointmentBody,
  ListAppointmentsQuery,
  UpdateAppointmentStatusBody,
} from "../types/appointment";

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateAppointmentBody;

      const input: CreateAppointmentInput = {
        userId: body.user_id,
        note: body.note,
        serviceId: body.service_id,
        startAt: new Date(body.start_at),
        endAt: new Date(body.end_at),
        paymentType: body.payment_type,
        amount: body.amount,
        isPaid: body.is_paid,
        status: body.status,
      };

      const appointment = await this.appointmentService.create(input);

      return res.status(201).json({ appointment });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.findById(id);

      return res.status(200).json({ appointment });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateAppointmentBody;

      const input: UpdateAppointmentInput = {};
      if (body.user_id !== undefined) input.userId = body.user_id;
      if (body.note !== undefined) input.note = body.note;
      if (body.service_id !== undefined) input.serviceId = body.service_id;
      if (body.start_at !== undefined) input.startAt = new Date(body.start_at);
      if (body.end_at !== undefined) input.endAt = new Date(body.end_at);
      if (body.payment_type !== undefined)
        input.paymentType = body.payment_type;
      if (body.amount !== undefined) input.amount = body.amount;
      if (body.is_paid !== undefined) input.isPaid = body.is_paid;
      if (body.status !== undefined) input.status = body.status;

      const appointment = await this.appointmentService.update(id, input);

      return res.status(200).json({ appointment });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.appointmentService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateAppointmentStatusBody;

      const input: UpdateAppointmentInput = {
        status: body.status,
      };

      const appointment = await this.appointmentService.update(id, input);

      return res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        data: appointment,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as ListAppointmentsQuery;
      const {
        page,
        limit,
        user_id,
        service_id,
        payment_type,
        is_paid,
        status,
        start_at_from,
        start_at_to,
      } = queryParams;

      const pagination = { page, limit };
      const filters: any = {};

      if (user_id) filters.user_id = user_id;
      if (service_id) filters.service_id = service_id;
      if (payment_type) filters.payment_type = payment_type;
      if (is_paid !== undefined) filters.is_paid = is_paid === "true";
      if (status) filters.status = status;
      if (start_at_from) filters.start_at_from = new Date(start_at_from);
      if (start_at_to) filters.start_at_to = new Date(start_at_to);

      const result = await this.appointmentService.findAllAppointments(
        filters,
        pagination
      );

      return res.status(200).json({
        success: true,
        message: "Appointments retrieved successfully",
        ...result,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params;

      const appointments = await this.appointmentService.findByUserId(userId);

      return res.status(200).json({
        success: true,
        message: "User appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findByServiceId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { serviceId } = req.params;

      const appointments = await this.appointmentService.findByServiceId(
        serviceId
      );

      return res.status(200).json({
        success: true,
        message: "Service appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findByDateRange = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
          data: null,
        });
      }

      const appointments = await this.appointmentService.findByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      return res.status(200).json({
        success: true,
        message: "Appointments in date range retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createAppointmentControllerInstance(
  appointmentService: AppointmentService
) {
  const controller = new AppointmentController(appointmentService);

  return {
    createAppointmentHandler: controller.create,
    updateAppointmentHandler: controller.update,
    updateAppointmentStatusHandler: controller.updateStatus,
    deleteAppointmentHandler: controller.delete,
    getAppointmentByIdHandler: controller.findById,
    listAppointmentsHandler: controller.findAll,
    getAppointmentsByUserIdHandler: controller.findByUserId,
    getAppointmentsByServiceIdHandler: controller.findByServiceId,
    getAppointmentsByDateRangeHandler: controller.findByDateRange,
  };
}
