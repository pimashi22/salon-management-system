"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Service {
  id: number;
  name: string;
  discount: number;
  finalPrice: number;
}

interface Appointment {
  serviceId: number;
  customerName: string;
  date: string;
  status: string;
}

export default function ServiceReportsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = params.categoryId as string;
  const serviceId = searchParams.get("serviceId");

  const [category, setCategory] = useState<{ id: string; name: string } | null>(
    null
  );
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3005/api/reports/${categoryId}`
        );

        if (!res.ok) throw new Error("Failed to fetch report data");

        const data = await res.json();

        // Data structure from backend:
        // { category, services, appointments }
        setCategory(data.category);
        setServices(
          serviceId
            ? data.services.filter(
                (s: Service) => s.id === Number.parseInt(serviceId)
              )
            : data.services
        );
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [categoryId, serviceId]);

  const handleDownloadReport = () => {
    if (!services.length) return;

    let csvContent = "Service,Category,Discount (%),Price ($),Appointments\n";

    services.forEach((service) => {
      const serviceAppointments = appointments.filter(
        (apt) => apt.serviceId === service.id
      );
      csvContent += `"${service.name}","${category?.name}",${service.discount},${service.finalPrice},${serviceAppointments.length}\n`;
    });

    csvContent += "\n\nAppointment Details\n";
    csvContent += "Service,Customer Name,Date,Status\n";

    services.forEach((service) => {
      const serviceAppointments = appointments.filter(
        (apt) => apt.serviceId === service.id
      );
      serviceAppointments.forEach((apt) => {
        csvContent += `"${service.name}","${apt.customerName}","${apt.date}","${apt.status}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `services_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <p className="text-center text-muted-foreground mt-10">
        Loading report data...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/categories/${categoryId}/services`)
              }
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Services
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Services Report - {category?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Detailed report of services, pricing, and appointments
          </p>
        </div>

        <Button
          onClick={handleDownloadReport}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Services Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Services Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Discount (%)</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Appointments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const serviceAppointments = appointments.filter(
                  (apt) => apt.serviceId === service.id
                );
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell>{service.discount}%</TableCell>
                    <TableCell>${service.finalPrice.toFixed(2)}</TableCell>
                    <TableCell>{serviceAppointments.length}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
