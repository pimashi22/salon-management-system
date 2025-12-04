"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, ArrowLeft, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPublicServices, Service } from "@/lib/categoryApi";

export default function ServiceCategoryPage() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = allServices;

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceRange && priceRange !== "all") {
      filtered = filtered.filter((service) => {
        const price =
          service.discount > 0
            ? service.price * (1 - service.discount / 100)
            : service.price;

        switch (priceRange) {
          case "low":
            return price < 5000;
          case "mid":
            return price >= 5000 && price <= 15000;
          case "high":
            return price > 15000;
          default:
            return true;
        }
      });
    }

    if (duration && duration !== "all") {
      filtered = filtered.filter((service) => {
        const durationMinutes = parseInt(service.duration);

        switch (duration) {
          case "short":
            return durationMinutes < 60;
          case "medium":
            return durationMinutes >= 60 && durationMinutes <= 120;
          case "long":
            return durationMinutes > 120;
          default:
            return true;
        }
      });
    }

    setFilteredServices(filtered);
  }, [allServices, searchTerm, priceRange, duration]);

  const fetchServicesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPublicServices(1, 100, undefined, undefined);

      setAllServices(result.services);
    } catch {
      setError("Failed to fetch services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((searchValue: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);
  }, []);

  useEffect(() => {
    fetchServicesData();
  }, [fetchServicesData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const formatDuration = (minutes: string) => {
    const num = parseInt(minutes);
    if (num >= 60) {
      const hours = Math.floor(num / 60);
      const mins = num % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${num}m`;
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                Services
              </h1>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-10"
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under Rs. 5,000</SelectItem>
                  <SelectItem value="mid">Rs. 5,000 - 15,000</SelectItem>
                  <SelectItem value="high">Above Rs. 15,000</SelectItem>
                </SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Under 1 hour</SelectItem>
                  <SelectItem value="medium">1-2 hours</SelectItem>
                  <SelectItem value="long">2+ hours</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading services...</span>
          </div>
        )}

        {}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchServicesData} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `No services found for "${searchTerm}"`
                    : allServices.length === 0
                    ? "No services available"
                    : "No services match your current filters"}
                </p>
                {(searchTerm || priceRange || duration) && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange("");
                      setDuration("");
                    }}
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {service.description}
                        </CardDescription>
                      </div>
                      {service.categories && service.categories.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {service.categories[0].name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(service.duration)}
                      </div>
                      {service.discount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {service.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        {service.discount > 0 ? (
                          <>
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(service.price)}
                            </div>
                            <div className="text-lg font-semibold text-primary">
                              {formatPrice(
                                service.price * (1 - service.discount / 100)
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-lg font-semibold text-primary">
                            {formatPrice(service.price)}
                          </div>
                        )}
                      </div>
                      <Link href={`/services/${service.id}`}>
                        <Button size="sm">Book Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {}
      </div>
    </div>
  );
}
