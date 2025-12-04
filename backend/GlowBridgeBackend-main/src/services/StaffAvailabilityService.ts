import { BaseService } from "./BaseService";
import { StaffAvailabilityRepository } from "../repositories/StaffAvailabilityRepository";
import {
  StaffAvailability,
  CreateStaffAvailabilityInput,
  UpdateStaffAvailabilityInput,
  StaffAvailabilityFilterParams,
  StaffAvailabilityWithStaff,
  WeeklyAvailability,
} from "../types/staffAvailability";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, NotFoundError } from "../utils/errors";

export class StaffAvailabilityService extends BaseService<
  StaffAvailability,
  CreateStaffAvailabilityInput,
  UpdateStaffAvailabilityInput
> {
  private staffAvailabilityRepository: StaffAvailabilityRepository;

  constructor(staffAvailabilityRepository: StaffAvailabilityRepository) {
    super(staffAvailabilityRepository);
    this.staffAvailabilityRepository = staffAvailabilityRepository;
  }

  protected getEntityName(): string {
    return "Staff Availability";
  }

  async create(
    input: CreateStaffAvailabilityInput
  ): Promise<StaffAvailability> {
    
    this.validateInput(input, [
      "salonStaffId",
      "dayOfWeek",
      "startTime",
      "endTime",
    ]);

    if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    this.validateTimeFormat(input.startTime);
    this.validateTimeFormat(input.endTime);
    this.validateTimeOrder(input.startTime, input.endTime);

    return this.staffAvailabilityRepository.create(input);
  }

  async update(
    id: string,
    input: UpdateStaffAvailabilityInput
  ): Promise<StaffAvailability> {
    
    if (!id) {
      throw new ValidationError("Staff availability ID is required");
    }

    if (
      input.dayOfWeek !== undefined &&
      (input.dayOfWeek < 0 || input.dayOfWeek > 6)
    ) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    if (input.startTime) {
      this.validateTimeFormat(input.startTime);
    }
    if (input.endTime) {
      this.validateTimeFormat(input.endTime);
    }

    if (input.startTime && input.endTime) {
      this.validateTimeOrder(input.startTime, input.endTime);
    }

    const updatedAvailability = await this.staffAvailabilityRepository.update(
      id,
      {
        ...input,
        id,
      }
    );

    if (!updatedAvailability) {
      throw new NotFoundError("Staff Availability");
    }

    return updatedAvailability;
  }

  async getStaffAvailability(
    salonStaffId: string
  ): Promise<StaffAvailability[]> {
    if (!salonStaffId) {
      throw new ValidationError("Salon staff ID is required");
    }

    return this.staffAvailabilityRepository.findBySalonStaffId(salonStaffId);
  }

  async getWeeklyAvailability(
    salonStaffId: string
  ): Promise<WeeklyAvailability> {
    if (!salonStaffId) {
      throw new ValidationError("Salon staff ID is required");
    }

    return this.staffAvailabilityRepository.findWeeklyAvailability(
      salonStaffId
    );
  }

  async getAvailabilityByDay(dayOfWeek: number): Promise<StaffAvailability[]> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    return this.staffAvailabilityRepository.findByDayOfWeek(dayOfWeek);
  }

  async getAvailabilityWithStaffDetails(
    filters: StaffAvailabilityFilterParams = {}
  ): Promise<StaffAvailabilityWithStaff[]> {
    return this.staffAvailabilityRepository.findAvailabilityWithStaff(filters);
  }

  async createWeeklyAvailability(
    salonStaffId: string,
    availabilitySlots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>
  ): Promise<StaffAvailability[]> {
    if (!salonStaffId) {
      throw new ValidationError("Salon staff ID is required");
    }

    if (!availabilitySlots || availabilitySlots.length === 0) {
      throw new ValidationError("At least one availability slot is required");
    }

    for (const slot of availabilitySlots) {
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new ValidationError(`Invalid day of week: ${slot.dayOfWeek}`);
      }
      this.validateTimeFormat(slot.startTime);
      this.validateTimeFormat(slot.endTime);
      this.validateTimeOrder(slot.startTime, slot.endTime);
    }

    const availabilityInputs: CreateStaffAvailabilityInput[] =
      availabilitySlots.map((slot) => ({
        salonStaffId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable ?? true,
      }));

    return this.staffAvailabilityRepository.createBulk(availabilityInputs);
  }

  async updateWeeklyAvailability(
    salonStaffId: string,
    availabilitySlots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>
  ): Promise<StaffAvailability[]> {
    if (!salonStaffId) {
      throw new ValidationError("Salon staff ID is required");
    }

    await this.staffAvailabilityRepository.deleteByStaffId(salonStaffId);

    return this.createWeeklyAvailability(salonStaffId, availabilitySlots);
  }

  async clearStaffAvailability(salonStaffId: string): Promise<void> {
    if (!salonStaffId) {
      throw new ValidationError("Salon staff ID is required");
    }

    await this.staffAvailabilityRepository.deleteByStaffId(salonStaffId);
  }

  async clearDayAvailability(
    salonStaffId: string,
    dayOfWeek: number
  ): Promise<boolean> {
    if (!salonStaffId) {
      throw new ValidationError("Salon staff ID is required");
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    return this.staffAvailabilityRepository.deleteBySalonStaffAndDay(
      salonStaffId,
      dayOfWeek
    );
  }

  async getAvailableStaffForTime(
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<StaffAvailabilityWithStaff[]> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    this.validateTimeFormat(startTime);
    this.validateTimeFormat(endTime);
    this.validateTimeOrder(startTime, endTime);

    const availabilities =
      await this.staffAvailabilityRepository.findAvailabilityWithStaff({
        day_of_week: dayOfWeek,
        is_available: true,
      });

    return availabilities.filter((availability) => {
      return this.isTimeOverlap(
        availability.start_time,
        availability.end_time,
        startTime,
        endTime
      );
    });
  }

  async findAllStaffAvailability(
    filters: StaffAvailabilityFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<StaffAvailability>> {
    return this.staffAvailabilityRepository.findAllWithFilters(
      filters,
      pagination
    );
  }

  async searchStaffAvailability(
    searchParams: {
      staff_name?: string;
      salon_name?: string;
      day_of_week?: number;
      time_start?: string;
      time_end?: string;
      is_available?: boolean;
    } = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    
    if (searchParams.day_of_week !== undefined) {
      if (searchParams.day_of_week < 0 || searchParams.day_of_week > 6) {
        throw new ValidationError(
          "Day of week must be between 0 (Sunday) and 6 (Saturday)"
        );
      }
    }

    if (searchParams.time_start) {
      this.validateTimeFormat(searchParams.time_start);
    }
    if (searchParams.time_end) {
      this.validateTimeFormat(searchParams.time_end);
    }

    if (searchParams.time_start && searchParams.time_end) {
      this.validateTimeOrder(searchParams.time_start, searchParams.time_end);
    }

    return this.staffAvailabilityRepository.searchAvailability(
      searchParams,
      pagination
    );
  }

  async searchAvailableStaffForBooking(
    searchParams: {
      day_of_week: number;
      time_start: string;
      time_end: string;
      staff_name?: string;
      salon_name?: string;
    },
    pagination?: PaginationParams
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    
    if (searchParams.day_of_week === undefined) {
      throw new ValidationError("Day of week is required");
    }
    if (!searchParams.time_start || !searchParams.time_end) {
      throw new ValidationError("Start time and end time are required");
    }

    if (searchParams.day_of_week < 0 || searchParams.day_of_week > 6) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    this.validateTimeFormat(searchParams.time_start);
    this.validateTimeFormat(searchParams.time_end);
    this.validateTimeOrder(searchParams.time_start, searchParams.time_end);

    return this.staffAvailabilityRepository.searchAvailableStaff(
      searchParams,
      pagination
    );
  }

  async quickSearchStaff(
    query: string,
    pagination?: PaginationParams
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError("Search query is required");
    }

    return this.staffAvailabilityRepository.searchAvailability(
      {
        staff_name: query.trim(),
        salon_name: query.trim(),
      },
      pagination
    );
  }

  async getStaffScheduleForWeek(
    staffName: string,
    pagination?: PaginationParams
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    if (!staffName || staffName.trim().length === 0) {
      throw new ValidationError("Staff name is required");
    }

    return this.staffAvailabilityRepository.searchAvailability(
      {
        staff_name: staffName.trim(),
        is_available: true,
      },
      pagination
    );
  }

  async findAvailableStaffAtTime(
    dayOfWeek: number,
    timeSlot: string,
    duration: number = 60, 
    pagination?: PaginationParams
  ): Promise<PaginationResult<StaffAvailabilityWithStaff>> {
    
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new ValidationError(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    this.validateTimeFormat(timeSlot);

    if (duration <= 0) {
      throw new ValidationError("Duration must be positive");
    }

    const [hours, minutes] = timeSlot.split(":").map(Number);
    const startTotalMinutes = hours * 60 + minutes;
    const endTotalMinutes = startTotalMinutes + duration;

    const endHours = Math.floor(endTotalMinutes / 60);
    const endMins = endTotalMinutes % 60;

    if (endHours >= 24) {
      throw new ValidationError("End time exceeds 24 hours");
    }

    const endTime = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;

    return this.searchAvailableStaffForBooking(
      {
        day_of_week: dayOfWeek,
        time_start: timeSlot,
        time_end: endTime,
      },
      pagination
    );
  }

  async findAll(
    filters?: StaffAvailabilityFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<StaffAvailability>> {
    return this.findAllStaffAvailability(filters || {}, pagination);
  }

  private validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new ValidationError(
        `Invalid time format: ${time}. Expected HH:MM format (24-hour)`
      );
    }
  }

  private validateTimeOrder(startTime: string, endTime: string): void {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    if (startTotalMinutes >= endTotalMinutes) {
      throw new ValidationError("Start time must be before end time");
    }
  }

  private isTimeOverlap(
    availStart: string,
    availEnd: string,
    requestStart: string,
    requestEnd: string
  ): boolean {
    const parseTime = (time: string) => {
      const [hour, min] = time.split(":").map(Number);
      return hour * 60 + min;
    };

    const availStartMinutes = parseTime(availStart);
    const availEndMinutes = parseTime(availEnd);
    const requestStartMinutes = parseTime(requestStart);
    const requestEndMinutes = parseTime(requestEnd);

    return (
      requestStartMinutes >= availStartMinutes &&
      requestEndMinutes <= availEndMinutes
    );
  }
}
