import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Star, ArrowLeft, Users, Award, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function SalonSelectionPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const salons = [
    {
      id: 1,
      name: "Elegance Beauty Studio",
      location: "Colombo 03",
      distance: "2.5 km",
      rating: 4.9,
      reviews: 234,
      price: "Rs. 3,500",
      image: "/elegant-beauty-salon.png",
      specialties: ["Hair", "Facial", "Bridal"],
      nextAvailable: "Today 2:00 PM",
      verified: true,
      staff: 8,
    },
    {
      id: 2,
      name: "Serenity Spa & Salon",
      location: "Colombo 05",
      distance: "4.1 km",
      rating: 4.8,
      reviews: 189,
      price: "Rs. 3,200",
      image: "/modern-spa-salon-interior.jpg",
      specialties: ["Spa", "Massage", "Hair"],
      nextAvailable: "Tomorrow 10:00 AM",
      verified: true,
      staff: 12,
    },
    {
      id: 3,
      name: "Glamour Zone",
      location: "Colombo 07",
      distance: "6.8 km",
      rating: 4.7,
      reviews: 156,
      price: "Rs. 4,000",
      image: "/luxury-beauty-salon.png",
      specialties: ["Nails", "Makeup", "Hair"],
      nextAvailable: "Today 4:30 PM",
      verified: false,
      staff: 6,
    },
  ];

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
                Select Salon
              </h1>
              <p className="text-sm text-muted-foreground">
                Classic Haircut & Style
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter your location..."
                  className="pl-10"
                  defaultValue="Colombo, Sri Lanka"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="20">Within 20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {salons.map((salon) => (
            <Card
              key={salon.id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {}
                  <div className="w-full md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={salon.image || "/placeholder.svg"}
                      alt={salon.name}
                      width={192}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {salon.name}
                          </h3>
                          {salon.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {salon.location} • {salon.distance}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {salon.staff} staff
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {salon.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({salon.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {salon.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per service
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {salon.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Next available: {salon.nextAvailable}
                        </span>
                      </div>
                      <Link href={`/book/${serviceId}/salon/${salon.id}`}>
                        <Button>Book Now</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            <MapPin className="w-4 h-4 mr-2" />
            View on Map
          </Button>
        </div>
      </div>
    </div>
  );
}
