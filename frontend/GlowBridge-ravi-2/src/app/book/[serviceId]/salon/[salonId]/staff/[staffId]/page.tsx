import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowLeft, Award, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default async function StaffSelectionPage({
  params,
}: {
  params: Promise<{ serviceId: string; salonId: string; staffId: string }>;
}) {
  const { serviceId, salonId } = await params;
  const salon = {
    name: "Elegance Beauty Studio",
    location: "Colombo 03",
    rating: 4.9,
    reviews: 234,
  };

  const staff = [
    {
      id: 1,
      name: "Priya Perera",
      title: "Senior Hair Stylist",
      experience: "8 years",
      rating: 4.9,
      reviews: 156,
      specialties: ["Hair Cutting", "Color", "Styling"],
      nextAvailable: "Today 2:00 PM",
      price: "Rs. 3,500",
      image: "/professional-female-hairstylist.png",
      isTopRated: true,
    },
    {
      id: 2,
      name: "Saman Silva",
      title: "Hair Stylist",
      experience: "5 years",
      rating: 4.7,
      reviews: 89,
      specialties: ["Hair Cutting", "Treatments"],
      nextAvailable: "Today 3:30 PM",
      price: "Rs. 3,200",
      image: "/professional-male-hair-stylist.jpg",
      isTopRated: false,
    },
    {
      id: 3,
      name: "Nisha Fernando",
      title: "Junior Stylist",
      experience: "2 years",
      rating: 4.5,
      reviews: 45,
      specialties: ["Hair Cutting", "Basic Styling"],
      nextAvailable: "Tomorrow 10:00 AM",
      price: "Rs. 2,800",
      image: "/placeholder-rrriq.png",
      isTopRated: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/book/${serviceId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Select Staff
              </h1>
              <p className="text-sm text-muted-foreground">
                {salon.name} • Classic Haircut & Style
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {salon.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{salon.location}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {salon.rating} ({salon.reviews} reviews)
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                <Award className="w-3 h-3 mr-1" />
                Verified Partner
              </Badge>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground">
              Choose Your Stylist
            </h3>
            <p className="text-sm text-muted-foreground">
              {staff.length} stylists available
            </p>
          </div>

          {staff.map((member) => (
            <Card
              key={member.id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {}
                  <div className="flex-shrink-0">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-foreground">
                            {member.name}
                          </h4>
                          {member.isTopRated && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-100 text-yellow-800"
                            >
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Top Rated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {member.title}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {member.experience} experience
                        </p>

                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {member.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({member.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {member.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          service fee
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Available: {member.nextAvailable}
                        </span>
                      </div>
                      <Link
                        href={`/book/${serviceId}/salon/${salonId}/staff/${member.id}`}
                      >
                        <Button>
                          <Clock className="w-4 h-4 mr-2" />
                          Book with {member.name.split(" ")[0]}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {}
        <Card className="mt-8 border-dashed border-2 border-border">
          <CardContent className="p-6 text-center">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              No Preference?
            </h4>
            <p className="text-muted-foreground mb-4">
              Let us assign the next available stylist for your preferred time
              slot
            </p>
            <Link href={`/book/${serviceId}/salon/${salonId}/staff/any`}>
              <Button variant="outline" size="lg">
                Book with Any Available Stylist
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
