"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Scissors,
  ArrowLeft,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const upcomingAppointments = [
    {
      id: "1",
      service: "Classic Haircut & Style",
      salon: "Elegance Beauty Studio",
      staff: "Priya Perera",
      date: "March 20, 2024",
      time: "2:00 PM",
      duration: "60 min",
      price: "Rs. 3,500",
      status: "confirmed",
      location: "Colombo 03",
    },
    {
      id: "2",
      service: "Deep Cleansing Facial",
      salon: "Serenity Spa & Salon",
      staff: "Nisha Fernando",
      date: "March 25, 2024",
      time: "10:30 AM",
      duration: "90 min",
      price: "Rs. 4,500",
      status: "confirmed",
      location: "Kandy",
    },
  ];

  const pastAppointments = [
    {
      id: "3",
      service: "Manicure & Pedicure",
      salon: "Glamour Zone",
      staff: "Sasha Silva",
      date: "March 10, 2024",
      time: "3:00 PM",
      duration: "75 min",
      price: "Rs. 2,800",
      status: "completed",
      location: "Galle",
    },
    {
      id: "4",
      service: "Hair Color & Highlights",
      salon: "Elegance Beauty Studio",
      staff: "Priya Perera",
      date: "February 28, 2024",
      time: "11:00 AM",
      duration: "120 min",
      price: "Rs. 8,500",
      status: "completed",
      location: "Colombo 03",
    },
  ];

  const sampleUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
  };

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  My Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{sampleUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{sampleUser.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => {}}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {}
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {sampleUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{sampleUser.name}</CardTitle>
                <CardDescription>BeautyBook Member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{sampleUser.email}</span>
                </div>
                {sampleUser.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{sampleUser.phone}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/">
                  <Button className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Book New Appointment
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="lg:col-span-3 space-y-8">
            {}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Upcoming Appointments
                </h2>
                <Badge variant="secondary">
                  {upcomingAppointments.length} scheduled
                </Badge>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border-l-4 border-l-primary"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                {appointment.service}
                              </h3>
                              <p className="text-muted-foreground">
                                {appointment.salon}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {appointment.time} ({appointment.duration})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="/professional-female-hairstylist.png" />
                                <AvatarFallback>
                                  {appointment.staff
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {appointment.staff}
                              </span>
                            </div>
                          </div>

                          <div className="text-right space-y-2">
                            <div className="text-lg font-semibold text-primary">
                              {appointment.price}
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {appointment.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent"
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No upcoming appointments
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Book your next beauty appointment today!
                    </p>
                    <Link href="/">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Past Appointments
                </h2>
                <Badge variant="outline">
                  {pastAppointments.length} completed
                </Badge>
              </div>

              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {appointment.service}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {appointment.salon}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {appointment.staff
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{appointment.staff}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-sm font-medium">
                            {appointment.price}
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-600"
                          >
                            {appointment.status}
                          </Badge>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                            >
                              Book Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
