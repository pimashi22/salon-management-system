"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Menu,
  X,
  FolderOpen,
  Gift,
  Clock,
  LogOut,
  User,
  Warehouse,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/constraint";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    href: "/dashboard/salons",
    name: "Salon Management",
    icon: Building2,
    description: "Manage all salons",
    permission: [UserRole.ADMIN],
  },
  {
    href: "/dashboard/inventory",
    name: "Inventory Management",
    icon: Warehouse,
    description: "Manage all inventory",
    permission: [UserRole.SALON_OWNER],
  },
  {
    href: "/dashboard/users",
    name: "User Management",
    icon: User,
    description: "Manage salon users",
    permission: [UserRole.ADMIN, UserRole.SALON_OWNER],
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: FolderOpen,
    gradient: "from-green-500 to-teal-600",
    permission: [UserRole.SALON_OWNER],
    description: "Service types",
  },

  {
    name: "Packages",
    href: "/dashboard/packages",
    icon: Gift,
    gradient: "from-orange-500 to-red-600",
    permission: [UserRole.SALON_OWNER],
    description: "Service bundles",
  },
  {
    name: "Working Hours",
    href: "/dashboard/working-hours",
    icon: Clock,
    permission: [UserRole.SALON_OWNER],
    description: "Staff working hours",
  },
  {
    name: "My Appointments",
    href: "/dashboard/staff-dashboard",
    permission: [UserRole.STAFF],
    icon: LayoutDashboard,
    description: "Staff overview",
  },
  {
    name: "All Appointments",
    href: "/dashboard/staff-appointments",
    permission: [UserRole.SALON_OWNER],
    icon: Users,
    description: "All appointments",
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
  };

  const filteredNavigation = navigation.filter((item) => {
    if (item.permission.length === 0) return true;
    if (!userData?.role) return false;

    const userRoleEnum = Object.values(UserRole).find(
      (role) => role === userData.role
    ) as UserRole;

    return userRoleEnum && item.permission.includes(userRoleEnum);
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-blue-100 shadow-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            {}
            <div className="flex items-center justify-between p-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    GlowBridge
                  </h1>
                  <p className="text-sm text-gray-600">Management Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {}
            <nav className="flex-1 p-4 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-4 text-left rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg transform scale-[1.02]"
                          : "hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.01]"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 mr-3 flex-shrink-0",
                          isActive ? "text-primary-foreground" : "text-blue-600"
                        )}
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div
                          className={cn(
                            "text-xs",
                            isActive
                              ? "text-primary-foreground/70"
                              : "text-gray-500"
                          )}
                        >
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {}
        <div className="lg:pl-64">
          {}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-4 w-full justify-between">
                <div className="text-sm font-medium text-foreground">
                  {navigation.find((item) => item.href === pathname)?.name}
                </div>

                {}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {userData?.name || user?.email} (
                      {userData?.role.toUpperCase()})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
