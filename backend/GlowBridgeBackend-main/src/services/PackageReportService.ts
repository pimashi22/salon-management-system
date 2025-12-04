// src/services/PackageReportService.ts
import { PackageRepository } from "../repositories/PackageRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class PackageReportService {
  private packageRepository: PackageRepository;
  private appointmentRepository: AppointmentRepository;

  constructor(packageRepository: PackageRepository, appointmentRepository: AppointmentRepository) {
    this.packageRepository = packageRepository;
    this.appointmentRepository = appointmentRepository;
  }

  /**
   * options:
   *  - packageId?: string
   *  - serviceId?: string (optional filter to only include appointments for this service)
   *  - startAt?: Date
   *  - endAt?: Date
   */
  async getPackageReport(options?: {
    packageId?: string;
    serviceId?: string;
    startAt?: Date;
    endAt?: Date;
  }) {
    const { packageId, serviceId, startAt, endAt } = options || {};

    // 1) Load packages (single or all)
    let packagesList: any[] = [];

    if (packageId) {
      const single = await this.packageRepository.findByIdWithServices(packageId);
      if (single) packagesList = [single];
    } else {
      // fetch a reasonably large page so we return all packages for reporting
      const paginated = await this.packageRepository.findAllWithServices({}, { page: 1, limit: 1000 });
      packagesList = paginated.data || [];
    }

    // 2) Build report for each package
    const report: any[] = [];

    for (const pkg of packagesList) {
      if (!pkg) continue;

      // First try to fetch appointments by package_id (recommended)
      let appointments: any[] = [];
      try {
        // AppointmentRepository should expose findByPackageId (see repository addition below)
        // This will be used when appointment rows store package_id.
        // If this fails (e.g. DB column doesn't exist), we fallback to getting appointments by service IDs.
        appointments = await (this.appointmentRepository as any).findByPackageId(
          pkg.id,
          startAt,
          endAt
        );
      } catch (err) {
        // fallback: fetch appointments for services included in the package (if any)
        const serviceIds: string[] = (pkg.services || []).map((s: any) => String(s.id));
        if (serviceIds.length > 0 && (this.appointmentRepository as any).findByServiceIdsWithRelations) {
          appointments = await (this.appointmentRepository as any).findByServiceIdsWithRelations(
            serviceIds,
            startAt,
            endAt
          );
        } else {
          // no package_id column and no services listed -> empty
          appointments = [];
        }
      }

      // If user asked to filter by a specific service id, apply it
      let filteredAppointments = appointments;
      if (serviceId) {
        filteredAppointments = appointments.filter(
          (a: any) => String(a.service_id) === String(serviceId) || (a.service && String(a.service.id) === String(serviceId))
        );
      }

      // shape the appointment details (explicit types to avoid implicit any)
      const appointmentDetails = filteredAppointments.map((apt: any) => ({
        id: apt.id,
        serviceId: apt.service_id,
        serviceName: apt.service ? apt.service.name : undefined,
        customerName: apt.user ? `${apt.user.first_name || ""} ${apt.user.last_name || ""}`.trim() : "",
        startAt: apt.start_at,
        endAt: apt.end_at,
        status: apt.status,
        amount: apt.amount,
        isPaid: apt.is_paid,
      }));

      report.push({
        package: pkg,
        appointmentCount: appointmentDetails.length,
        appointments: appointmentDetails,
      });
    }

    return report;
  }
}
