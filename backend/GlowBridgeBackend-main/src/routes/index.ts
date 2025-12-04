import { Router } from "express";
import salonRoutes from "./salon.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import serviceRoutes from "./service.routes";
import packageRoutes from "./package.routes";
import staffAvailabilityRoutes from "./staffAvailability.routes";
import orderRoutes from "./order.routes";
import appointmentRoutes from "./appointment.routes";

import reportRoutes from "./report.routes";
import packageReportRoutes from "./packageReport.routes";

import otpRoutes from "./otp.routes";


const router = Router();

router.use(salonRoutes);
router.use(userRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(serviceRoutes);
router.use(packageRoutes);
router.use(staffAvailabilityRoutes);
router.use(orderRoutes);
router.use(appointmentRoutes);
router.use(reportRoutes);
router.use(otpRoutes);

export default router;
router.use(packageReportRoutes);
