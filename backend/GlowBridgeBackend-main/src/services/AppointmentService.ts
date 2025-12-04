import { BaseService } from "./BaseService";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { UserRepository } from "../repositories/UserRepository";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { emailService } from "./EmailService";
import { User } from "../types/user";
import { Service } from "../types/service";
import {
  Appointment,
  AppointmentWithRelations,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilterParams,
} from "../types/appointment";
import { PaginationParams, PaginationResult } from "../types/common";
import { ValidationError, ConflictError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class AppointmentService extends BaseService<
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput
> {
  private appointmentRepository: AppointmentRepository;
  private userRepository: UserRepository;
  private serviceRepository: ServiceRepository;

  constructor(
    appointmentRepository: AppointmentRepository,
    userRepository: UserRepository,
    serviceRepository: ServiceRepository
  ) {
    super(appointmentRepository);
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
    this.serviceRepository = serviceRepository;
  }

  protected getEntityName(): string {
    return "Appointment";
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    // Validate input
    this.validateInput(input, [
      "userId",
      "note",
      "serviceId",
      "startAt",
      "endAt",
      "paymentType",
      "amount",
    ]);

    if (input.endAt <= input.startAt) {
      throw new ValidationError("End time must be after start time");
    }

    if (input.startAt <= new Date()) {
      throw new ValidationError("Appointment start time must be in the future");
    }

    if (input.amount < 0) {
      throw new ValidationError("Amount must be greater than or equal to 0");
    }

    try {
      logger.info(`Creating appointment for user: ${input.userId}`);
      
      // Create the appointment
      const createdAppointment = await this.appointmentRepository.create(input);

      // Fetch user and service details for email
      const [user, service] = await Promise.all([
        this.userRepository.findById(input.userId),
        this.serviceRepository.findById(input.serviceId)
      ]);

      if (!user) {
        logger.warn(`User not found for ID: ${input.userId}, skipping email`);
      } else if (!service) {
        logger.warn(`Service not found for ID: ${input.serviceId}, skipping email`);
      } else {
        // Send confirmation email
        await this.sendAppointmentConfirmationEmail(createdAppointment, user, service);
      }

      logger.info(
        `Appointment created successfully with ID: ${createdAppointment.id}`
      );
      return createdAppointment;
    } catch (error) {
      logger.error("Failed to create appointment:", error);

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new Error(
        `Failed to create appointment: ${(error as Error).message}`
      );
    }
  }

  private async sendAppointmentConfirmationEmail(
    appointment: Appointment, 
    user: User, 
    service: Service
  ): Promise<void> {
    try {
      const customerName = `${user.first_name} ${user.last_name}`.trim();
      const startTime = new Date(appointment.start_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const endTime = new Date(appointment.end_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Calculate duration
      const durationMs = appointment.end_at.getTime() - appointment.start_at.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      const duration = `${durationMinutes} minutes`;

      const appointmentData = {
        customerName,
        customerEmail: user.email,
        appointmentId: appointment.id,
        serviceName: service.name,
        serviceDescription: service.description || 'No description available',
        appointmentDate: appointment.start_at.toISOString(),
        startTime,
        endTime,
        duration,
        amount: appointment.amount,
        paymentType: appointment.payment_type,
        notes: appointment.note,
        salonName: 'GlowBridge Salon', // Default salon name - can be enhanced later
        salonAddress: '123 Beauty Street, Colombo 03', // Default address
        salonPhone: '+94 11 234 5678' // Default phone
      };

      const emailSent = await emailService.sendAppointmentConfirmation(appointmentData);
      
      if (emailSent) {
        logger.info(`Appointment confirmation email sent to ${user.email}`);
      } else {
        logger.warn(`Failed to send appointment confirmation email to ${user.email}`);
      }
    } catch (error) {
      logger.error('Error sending appointment confirmation email:', error);
      // Don't throw error - email failure shouldn't fail appointment creation
    }
  }

  async update(
    id: string,
    input: UpdateAppointmentInput
  ): Promise<Appointment> {
    
    if (!id) {
      throw new ValidationError("Appointment ID is required");
    }

    if (input.startAt && input.endAt && input.endAt <= input.startAt) {
      throw new ValidationError("End time must be after start time");
    }

    if (input.amount !== undefined && input.amount < 0) {
      throw new ValidationError("Amount must be greater than or equal to 0");
    }

    if (input.startAt && input.startAt <= new Date()) {
      throw new ValidationError("Appointment start time must be in the future");
    }

    const updatedAppointment = await this.appointmentRepository.update(id, {
      ...input,
      id,
    });

    if (!updatedAppointment) {
      throw new NotFoundError("Appointment");
    }

    return updatedAppointment;
  }

  async findAllAppointments(
    filters: AppointmentFilterParams = {},
    pagination?: PaginationParams
  ): Promise<PaginationResult<AppointmentWithRelations>> {
    return this.appointmentRepository.findAllWithFilters(filters, pagination);
  }

  async findByUserId(userId: string): Promise<Appointment[]> {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    return this.appointmentRepository.findByUserId(userId);
  }

  async findByServiceId(serviceId: string): Promise<Appointment[]> {
    if (!serviceId) {
      throw new ValidationError("Service ID is required");
    }

    return this.appointmentRepository.findByServiceId(serviceId);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    if (!startDate || !endDate) {
      throw new ValidationError("Start date and end date are required");
    }

    if (endDate <= startDate) {
      throw new ValidationError("End date must be after start date");
    }

    return this.appointmentRepository.findByDateRange(startDate, endDate);
  }

  async deleteById(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError("Appointment ID is required");
    }

    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Appointment");
    }

    if (appointment.start_at <= new Date()) {
      throw new ValidationError("Cannot delete past appointments");
    }

    try {
      
      await this.appointmentRepository.deleteById(id);
      logger.info(`Appointment deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete appointment ${id}:`, error);
      throw new Error(
        `Failed to delete appointment: ${(error as Error).message}`
      );
    }
  }

  async findAll(
    filters?: AppointmentFilterParams,
    pagination?: PaginationParams,
    orderBy?: string
  ): Promise<PaginationResult<AppointmentWithRelations>> {
    return this.findAllAppointments(filters || {}, pagination);
  }
}
