// src/services/ReportService.ts
import { ServiceRepository } from "../repositories/ServiceRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class ReportService {
  private serviceRepo: ServiceRepository;
  private appointmentRepo: AppointmentRepository;

  constructor(serviceRepo: ServiceRepository, appointmentRepo: AppointmentRepository) {
    this.serviceRepo = serviceRepo;
    this.appointmentRepo = appointmentRepo;
  }

  /**
   * Generate a combined report for services and their appointments
   */
  async getServiceReport({
    categoryId,
    serviceId,
    startAt,
    endAt,
  }: {
    categoryId?: string;
    serviceId?: string;
    startAt?: Date;
    endAt?: Date;
  }) {
    // Fetch all services
    const allServicesResult = await this.serviceRepo.findAll();
    const allServices = allServicesResult.data;

    // Filter by categoryId or serviceId if provided
    let filteredServices = allServices;
    if (categoryId) {
      filteredServices = filteredServices.filter(
        (s: any) => String(s.category_id) === String(categoryId)
      );
    }
    if (serviceId) {
      filteredServices = filteredServices.filter(
        (s: any) => String(s.id) === String(serviceId)
      );
    }

    // Fetch all appointments
    const allAppointmentsResult = await this.appointmentRepo.findAll();
    const allAppointments = allAppointmentsResult.data;

    // Optional date filtering
    let filteredAppointments = allAppointments;
    if (startAt || endAt) {
      filteredAppointments = filteredAppointments.filter((a: any) => {
        const date = new Date(a.start_at);
        if (startAt && date < startAt) return false;
        if (endAt && date > endAt) return false;
        return true;
      });
    }

    // Group appointments by service_id
    const appointmentsByService: Record<string, any[]> = {};
    filteredAppointments.forEach((apt: any) => {
      const key = String(apt.service_id);
      appointmentsByService[key] = appointmentsByService[key] || [];
      appointmentsByService[key].push(apt);
    });

    // Build summary per service
    const servicesSummary = filteredServices.map((s: any) => {
      const serviceAppointments = appointmentsByService[String(s.id)] || [];
      const priceNum = Number(s.price ?? 0);
      const discountNum = Number(s.discount ?? 0);
      const finalPrice = priceNum * (1 - discountNum / 100);
      return {
        id: s.id,
        name: s.name,
        categoryId: s.category_id,
        price: priceNum,
        discount: discountNum,
        finalPrice,
        appointmentsCount: serviceAppointments.length,
      };
    });

    return {
      services: servicesSummary,
      appointments: filteredAppointments,
    };
  }
}
