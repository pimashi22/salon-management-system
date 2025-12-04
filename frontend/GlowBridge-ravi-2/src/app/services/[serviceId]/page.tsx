"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CreditCard,
  ArrowLeft,
  User,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  createAppointment,
  CreateAppointmentPayload,
} from "@/lib/appointmentApi";
import { fetchServiceById, Service } from "@/lib/categoryApi";

interface AppointmentFormData {
  note: string;
  date: string;
  startTime: string;
  endTime: string;
  paymentType: "cash" | "card" | "online";
  amount: string;
}

export default function AppointmentBookingPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const router = useRouter();
  const { userData } = useAuth();
  const [serviceId, setServiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    note: "",
    date: "",
    startTime: "",
    endTime: "",
    paymentType: "cash",
    amount: "0",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then(async ({ serviceId }) => {
      setServiceId(serviceId);


      try {
        setServiceLoading(true);
        setServiceError(null);
        const serviceData = await fetchServiceById(serviceId);
        setService(serviceData);
        setFormData((prev) => ({
          ...prev,
          amount: serviceData.price.toString(),
        }));
      } catch (error) {
        setServiceError(
          error instanceof Error
            ? error.message
            : "Failed to load service details"
        );
        toast.error("Failed to load service details");
      } finally {
        setServiceLoading(false);
      }
    });
  }, [params]);


  useEffect(() => {
    if (formData.startTime && service?.duration) {
      const [hours, minutes] = formData.startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const durationMinutes = parseInt(service.duration, 10);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
      const endTime = endDate.toTimeString().substring(0, 5);

      setFormData((prev) => ({ ...prev, endTime }));
    }
  }, [formData.startTime, service?.duration]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = "Please select a start time";
    }

    if (!formData.paymentType) {
      newErrors.paymentType = "Please select a payment method";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (formData.note.length > 500) {
      newErrors.note = "Note must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));


    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatDateTime = (date: string, time: string): string => {
    const dateTime = new Date(`${date}T${time}:00`);
    return dateTime.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) {
      toast.error("Please log in to book an appointment");
      router.push("/login");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors and try again");
      return;
    }

    setIsLoading(true);

    try {
      const appointmentPayload: CreateAppointmentPayload = {
        user_id: userData.id,
        note: formData.note || `Appointment for ${service?.name || "service"}`,
        service_id: serviceId,
        start_at: formatDateTime(formData.date, formData.startTime),
        end_at: formatDateTime(formData.date, formData.endTime),
        payment_type: formData.paymentType,
        amount: parseFloat(formData.amount),
      };

      await createAppointment(appointmentPayload);

      setIsSubmitted(true);
      toast.success("Appointment booked successfully!");


      setTimeout(() => {
        router.push("/confirmation");
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to book appointment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/services">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Loading Service...
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading service details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (serviceError || !service) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/services">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Service Not Found
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">!</span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Service Not Available
                </h2>
                <p className="text-muted-foreground mb-6">
                  {serviceError || "The requested service could not be found."}
                </p>
                <Button
                  onClick={() => router.push("/services")}
                  className="w-full"
                >
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Appointment Booked!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your appointment has been successfully scheduled. You will receive
              a confirmation shortly.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/services">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Book Appointment
              </h1>
              <p className="text-sm text-muted-foreground">{service.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Rs. {service.price}</span>
                  </div>
                  {service.categories && service.categories.length > 0 && (
                    <Badge variant="outline">
                      {service.categories[0].name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {userData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {userData.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {userData.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {userData.phone}
                  </div>
                  <div>
                    <span className="font-medium">Customer ID:</span>{" "}
                    {userData.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {}
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        handleInputChange("startTime", e.target.value)
                      }
                      className={errors.startTime ? "border-red-500" : ""}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-500">{errors.startTime}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time (Auto-calculated)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Method *</Label>
                  <Select
                    value={formData.paymentType}
                    onValueChange={(value: "cash" | "card" | "online") =>
                      handleInputChange("paymentType", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.paymentType ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          Cash Payment
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Card Payment
                        </div>
                      </SelectItem>
                      <SelectItem value="online">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Online Payment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentType && (
                    <p className="text-sm text-red-500">{errors.paymentType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Rs.) *</Label>
                  <Input
                    disabled
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                {}
                <div className="space-y-2">
                  <Label htmlFor="note">Additional Notes</Label>
                  <Textarea
                    id="note"
                    placeholder="Any special requests or notes for your appointment..."
                    value={formData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    maxLength={500}
                    className={errors.note ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{formData.note.length}/500 characters</span>
                    {errors.note && (
                      <span className="text-red-500">{errors.note}</span>
                    )}
                  </div>
                </div>

                {}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Booking Appointment..." : "Book Appointment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {service.duration} minutes
                  </span>
                </div>
                {formData.date && formData.startTime && (
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString()} at{" "}
                      {formData.startTime}
                      {formData.endTime && ` - ${formData.endTime}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">
                    {formData.paymentType}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>Rs. {formData.amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
