import { Request, Response } from "express";
import { StaffAvailabilityService } from "../services/StaffAvailabilityService";
import { sendErrorResponse } from "../utils/errors";
import {
  CreateStaffAvailabilityInput,
  UpdateStaffAvailabilityInput,
  CreateStaffAvailabilityBody,
  UpdateStaffAvailabilityBody,
  ListStaffAvailabilityQuery,
} from "../types/staffAvailability";
import {
  CreateWeeklyAvailabilityBody,
  SearchStaffAvailabilityQuery,
  SearchAvailableStaffQuery,
  QuickSearchStaffQuery,
  FindAvailableStaffAtTimeQuery,
  StaffScheduleQuery,
} from "../schemas/staffAvailability";

export class StaffAvailabilityController {
  private staffAvailabilityService: StaffAvailabilityService;

  constructor(staffAvailabilityService: StaffAvailabilityService) {
    this.staffAvailabilityService = staffAvailabilityService;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateStaffAvailabilityBody;

      const input: CreateStaffAvailabilityInput = {
        salonStaffId: body.salon_staff_id,
        dayOfWeek: body.day_of_week,
        startTime: body.start_time,
        endTime: body.end_time,
        isAvailable: body.is_available,
      };

      const staffAvailability = await this.staffAvailabilityService.create(
        input
      );

      return res.status(201).json({ staffAvailability });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const staffAvailability = await this.staffAvailabilityService.findById(
        id
      );

      return res.status(200).json({ staffAvailability });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const body = res.locals.validated as UpdateStaffAvailabilityBody;

      const input: UpdateStaffAvailabilityInput = {};
      if (body.salon_staff_id !== undefined)
        input.salonStaffId = body.salon_staff_id;
      if (body.day_of_week !== undefined) input.dayOfWeek = body.day_of_week;
      if (body.start_time !== undefined) input.startTime = body.start_time;
      if (body.end_time !== undefined) input.endTime = body.end_time;
      if (body.is_available !== undefined)
        input.isAvailable = body.is_available;

      const staffAvailability = await this.staffAvailabilityService.update(
        id,
        input
      );

      return res.status(200).json({ staffAvailability });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.staffAvailabilityService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Staff availability deleted successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals
        .validatedQuery as ListStaffAvailabilityQuery;
      const { page, limit, salon_staff_id, day_of_week, is_available } =
        queryParams;

      const pagination = { page, limit };
      const filters = {
        ...(salon_staff_id && { salon_staff_id }),
        ...(day_of_week !== undefined && { day_of_week }),
        ...(is_available !== undefined && { is_available }),
      };

      const result =
        await this.staffAvailabilityService.findAllStaffAvailability(
          filters,
          pagination
        );

      return res.status(200).json(result);
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getStaffAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonStaffId } = req.params;

      if (!salonStaffId) {
        return res.status(400).json({
          error: "Salon Staff ID is required",
          message: "Please provide a valid salon staff ID",
        });
      }

      const availability =
        await this.staffAvailabilityService.getStaffAvailability(salonStaffId);

      return res.status(200).json({
        data: availability,
        message: "Staff availability retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getWeeklyAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonStaffId } = req.params;

      if (!salonStaffId) {
        return res.status(400).json({
          error: "Salon Staff ID is required",
          message: "Please provide a valid salon staff ID",
        });
      }

      const weeklyAvailability =
        await this.staffAvailabilityService.getWeeklyAvailability(salonStaffId);

      return res.status(200).json({
        data: weeklyAvailability,
        message: "Weekly availability retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getAvailabilityByDay = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { dayOfWeek } = req.params;

      if (dayOfWeek === undefined) {
        return res.status(400).json({
          error: "Day of week is required",
          message: "Please provide a valid day of week (0-6)",
        });
      }

      const day = parseInt(dayOfWeek);
      if (isNaN(day) || day < 0 || day > 6) {
        return res.status(400).json({
          error: "Invalid day of week",
          message: "Day of week must be between 0 (Sunday) and 6 (Saturday)",
        });
      }

      const availability =
        await this.staffAvailabilityService.getAvailabilityByDay(day);

      return res.status(200).json({
        data: availability,
        message: "Day availability retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getAvailabilityWithStaffDetails = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salon_staff_id, day_of_week, is_available } = req.query;

      const filters = {
        ...(salon_staff_id && { salon_staff_id: salon_staff_id as string }),
        ...(day_of_week !== undefined && {
          day_of_week: parseInt(day_of_week as string),
        }),
        ...(is_available !== undefined && {
          is_available: is_available === "true",
        }),
      };

      const availability =
        await this.staffAvailabilityService.getAvailabilityWithStaffDetails(
          filters
        );

      return res.status(200).json({
        data: availability,
        message: "Availability with staff details retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  createWeeklyAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const body = res.locals.validated as CreateWeeklyAvailabilityBody;

      const transformedAvailability = body.availability.map((slot) => ({
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available,
      }));

      const availability =
        await this.staffAvailabilityService.createWeeklyAvailability(
          body.salon_staff_id,
          transformedAvailability
        );

      return res.status(201).json({
        data: availability,
        message: "Weekly availability created successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  updateWeeklyAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonStaffId } = req.params;
      const body = res.locals.validated as CreateWeeklyAvailabilityBody;

      if (!salonStaffId) {
        return res.status(400).json({
          error: "Salon Staff ID is required",
          message: "Please provide a valid salon staff ID",
        });
      }

      const transformedAvailability = body.availability.map((slot) => ({
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available,
      }));

      const availability =
        await this.staffAvailabilityService.updateWeeklyAvailability(
          salonStaffId,
          transformedAvailability
        );

      return res.status(200).json({
        data: availability,
        message: "Weekly availability updated successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  clearStaffAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonStaffId } = req.params;

      if (!salonStaffId) {
        return res.status(400).json({
          error: "Salon Staff ID is required",
          message: "Please provide a valid salon staff ID",
        });
      }

      await this.staffAvailabilityService.clearStaffAvailability(salonStaffId);

      return res.status(200).json({
        message: "Staff availability cleared successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  clearDayAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { salonStaffId, dayOfWeek } = req.params;

      if (!salonStaffId || dayOfWeek === undefined) {
        return res.status(400).json({
          error: "Missing required parameters",
          message: "Salon Staff ID and Day of Week are required",
        });
      }

      const day = parseInt(dayOfWeek);
      if (isNaN(day) || day < 0 || day > 6) {
        return res.status(400).json({
          error: "Invalid day of week",
          message: "Day of week must be between 0 (Sunday) and 6 (Saturday)",
        });
      }

      const cleared = await this.staffAvailabilityService.clearDayAvailability(
        salonStaffId,
        day
      );

      if (!cleared) {
        return res.status(404).json({
          error: "No availability found",
          message: "No availability found for the specified staff and day",
        });
      }

      return res.status(200).json({
        message: "Day availability cleared successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getAvailableStaffForTime = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { dayOfWeek } = req.params;
      const { start_time, end_time } = req.query;

      if (dayOfWeek === undefined || !start_time || !end_time) {
        return res.status(400).json({
          error: "Missing required parameters",
          message: "Day of week, start_time, and end_time are required",
        });
      }

      const day = parseInt(dayOfWeek);
      if (isNaN(day) || day < 0 || day > 6) {
        return res.status(400).json({
          error: "Invalid day of week",
          message: "Day of week must be between 0 (Sunday) and 6 (Saturday)",
        });
      }

      const availableStaff =
        await this.staffAvailabilityService.getAvailableStaffForTime(
          day,
          start_time as string,
          end_time as string
        );

      return res.status(200).json({
        data: availableStaff,
        message: "Available staff retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  searchStaffAvailability = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = res.locals
        .validatedQuery as SearchStaffAvailabilityQuery;
      const { page, limit, ...searchParams } = queryParams;

      const pagination = { page, limit };

      const result =
        await this.staffAvailabilityService.searchStaffAvailability(
          searchParams,
          pagination
        );

      return res.status(200).json({
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        message: "Staff availability search completed successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  searchAvailableStaffForBooking = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = res.locals
        .validatedQuery as SearchAvailableStaffQuery;
      const { page, limit, ...searchParams } = queryParams;

      const pagination = { page, limit };

      const result =
        await this.staffAvailabilityService.searchAvailableStaffForBooking(
          searchParams,
          pagination
        );

      return res.status(200).json({
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        message: "Available staff search completed successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  quickSearchStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as QuickSearchStaffQuery;
      const { page, limit, q } = queryParams;

      const pagination = { page, limit };

      const result = await this.staffAvailabilityService.quickSearchStaff(
        q,
        pagination
      );

      return res.status(200).json({
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        message: "Quick staff search completed successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  findAvailableStaffAtTime = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = res.locals
        .validatedQuery as FindAvailableStaffAtTimeQuery;
      const { page, limit, day_of_week, time_slot, duration } = queryParams;

      const pagination = { page, limit };

      const result =
        await this.staffAvailabilityService.findAvailableStaffAtTime(
          day_of_week,
          time_slot,
          duration || 60,
          pagination
        );

      return res.status(200).json({
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        message: "Available staff at specific time retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };

  getStaffScheduleForWeek = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const queryParams = res.locals.validatedQuery as StaffScheduleQuery;
      const { page, limit, staff_name } = queryParams;

      const pagination = { page, limit };

      const result =
        await this.staffAvailabilityService.getStaffScheduleForWeek(
          staff_name,
          pagination
        );

      return res.status(200).json({
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        message: "Staff schedule retrieved successfully",
      });
    } catch (error) {
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createStaffAvailabilityControllerInstance(
  staffAvailabilityService: StaffAvailabilityService
) {
  const controller = new StaffAvailabilityController(staffAvailabilityService);

  return {
    createStaffAvailabilityHandler: controller.create,
    updateStaffAvailabilityHandler: controller.update,
    deleteStaffAvailabilityHandler: controller.delete,
    getStaffAvailabilityByIdHandler: controller.findById,
    listStaffAvailabilityHandler: controller.findAll,
    getStaffAvailabilityHandler: controller.getStaffAvailability,
    getWeeklyAvailabilityHandler: controller.getWeeklyAvailability,
    getAvailabilityByDayHandler: controller.getAvailabilityByDay,
    getAvailabilityWithStaffDetailsHandler:
      controller.getAvailabilityWithStaffDetails,
    createWeeklyAvailabilityHandler: controller.createWeeklyAvailability,
    updateWeeklyAvailabilityHandler: controller.updateWeeklyAvailability,
    clearStaffAvailabilityHandler: controller.clearStaffAvailability,
    clearDayAvailabilityHandler: controller.clearDayAvailability,
    getAvailableStaffForTimeHandler: controller.getAvailableStaffForTime,
    searchStaffAvailabilityHandler: controller.searchStaffAvailability,
    searchAvailableStaffForBookingHandler:
      controller.searchAvailableStaffForBooking,
    quickSearchStaffHandler: controller.quickSearchStaff,
    findAvailableStaffAtTimeHandler: controller.findAvailableStaffAtTime,
    getStaffScheduleForWeekHandler: controller.getStaffScheduleForWeek,
  };
}
