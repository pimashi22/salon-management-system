"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchAllAppointments,
  type Appointment as ApiAppointment,
} from "@/lib/appointmentApi";

interface Appointment {
  id: string;
  customerName: string;
  customerAvatar: string;
  service: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "in_progress" | "completed";
  duration: string;
  staffMember: string;
  amount: number;
  is_paid: boolean;
}

interface AppointmentData {
  inProgress: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
}
const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
const calculateDuration = (startAt: string, endAt: string): string => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}m`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};
const categorizeAppointments = (
  appointments: Appointment[]
): AppointmentData => {
  const categorized: AppointmentData = {
    inProgress: [],
    upcoming: [],
    past: [],
  };

  appointments.forEach((appointment) => {
    switch (appointment.status) {
      case "in_progress":
        categorized.inProgress.push(appointment);
        break;
      case "upcoming":
        categorized.upcoming.push(appointment);
        break;
      case "completed":
        categorized.past.push(appointment);
        break;
      default:

        categorized.upcoming.push(appointment);
        break;
    }
  });

  return categorized;
};

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const getStatusColor = (status: "upcoming" | "in_progress" | "completed") => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "upcoming":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: "upcoming" | "in_progress" | "completed") => {
    switch (status) {
      case "in_progress":
        return <PlayCircle className="h-4 w-4" />;
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusDisplayName = (
    status: "upcoming" | "in_progress" | "completed"
  ) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={appointment.customerAvatar || "/placeholder.svg"}
                alt={appointment.customerName}
              />
              <AvatarFallback>
                {appointment.customerName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">
                {appointment.customerName}
              </h3>
              <p className="text-sm text-gray-600">{appointment.service}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(appointment.startTime)} -{" "}
                  {formatTime(appointment.endTime)}
                </div>
                {}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>${appointment.amount}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    appointment.is_paid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {appointment.is_paid ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              {getStatusDisplayName(appointment.status)}
            </Badge>
            <span className="text-xs text-gray-500">
              {appointment.duration}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StaffAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("in-progress");
  const [appointmentsData, setAppointmentsData] = useState<AppointmentData>({
    inProgress: [],
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const transformAppointment = (
    apiAppointment: ApiAppointment
  ): Appointment => {

    const customerName =
      `${apiAppointment.user.first_name} ${apiAppointment.user.last_name}`.trim();

    return {
      id: apiAppointment.id,
      customerName: customerName,
      customerAvatar: "/placeholder.svg",
      service: apiAppointment.service.name,
      startTime: apiAppointment.start_at,
      endTime: apiAppointment.end_at,
      status: apiAppointment.status,
      duration: calculateDuration(
        apiAppointment.start_at,
        apiAppointment.end_at
      ),
      staffMember: "Staff Member",
      amount: apiAppointment.amount,
      is_paid: apiAppointment.is_paid,
    };
  };


  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAllAppointments(100, 1);

      if (response.success && response.data) {

        const transformedAppointments = response.data.map(transformAppointment);


        const categorized = categorizeAppointments(transformedAppointments);
        setAppointmentsData(categorized);
      } else {
        throw new Error(response.message || "Failed to fetch appointments");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);


  const ErrorCard = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <div className="ml-2">
            <p className="text-red-600 font-medium">
              Error loading appointments
            </p>
            <p className="text-red-500 text-sm">{message}</p>
            <button
              onClick={fetchAppointments}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Appointments</h1>
        <p className="text-gray-600 mt-2">
          Manage and view all staff appointments across the salon
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="ml-2 text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            In Progress ({appointmentsData.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({appointmentsData.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Past ({appointmentsData.past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                In Progress Appointments
              </CardTitle>
              <CardDescription>
                Currently active appointments across all staff members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading...</span>
                </div>
              ) : error ? (
                <ErrorCard message={error} />
              ) : appointmentsData.inProgress.length > 0 ? (
                appointmentsData.inProgress.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No appointments in progress
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Scheduled appointments for today and upcoming days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading...</span>
                </div>
              ) : error ? (
                <ErrorCard message={error} />
              ) : appointmentsData.upcoming.length > 0 ? (
                appointmentsData.upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                Past Appointments
              </CardTitle>
              <CardDescription>Completed appointments history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading...</span>
                </div>
              ) : error ? (
                <ErrorCard message={error} />
              ) : appointmentsData.past.length > 0 ? (
                appointmentsData.past.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No past appointments
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
