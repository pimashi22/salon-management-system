"use client";

import { UserRole } from "@/constraint";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { userData } = useAuth();

  const userRole = userData?.role;

  if (userRole === UserRole.ADMIN) {
    redirect("/dashboard/salons");
  } else if (userRole === UserRole.SALON_OWNER) {
    redirect("/dashboard/inventory");
  } else if (userRole === UserRole.STAFF) {
    redirect("/dashboard/staff-dashboard");
  } else {
    redirect("/");
  }
}
