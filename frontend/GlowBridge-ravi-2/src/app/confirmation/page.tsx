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
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage() {
  const booking = {
    id: "BK-2024-001234",
    service: "Classic Haircut & Style",
    salon: "Elegance Beauty Studio",
    staff: "Priya Perera",
    date: "Today, March 15, 2024",
    time: "2:00 PM - 3:00 PM",
    duration: "60 min",
    price: "Rs. 3,500",
    address: "123 Galle Road, Colombo 03",
    phone: "+94 11 234 5678",
    customerName: "John Doe",
    customerPhone: "+94 77 123 4567",
    customerEmail: "john@example.com",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your appointment has been successfully booked. We&apos;ve sent a
              confirmation to your email.
            </p>
          </div>
          {}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{booking.service}</CardTitle>
                  <CardDescription className="mt-1">
                    Booking ID: {booking.id}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Confirmed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/professional-female-hairstylist.png" />
                  <AvatarFallback>PP</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {booking.staff}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.salon}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {booking.address}
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.date}
                    </p>
                    <p className="text-sm text-muted-foreground">Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {booking.duration}
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-foreground">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {booking.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Payment will be collected at the salon
                </p>
              </div>
            </CardContent>
          </Card>
          {}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Your Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>{booking.customerName}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {booking.customerPhone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      {booking.customerEmail}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Salon Contact
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>{booking.salon}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {booking.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {booking.address}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/">
            <Button variant="ghost" className="w-full" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          {}

          {}
        </div>
      </div>
    </div>
  );
}
