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
  Search,
  MapPin,
  Users,
  Scissors,
  Heart,
  ShoppingBag,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, userData, logout } = useAuth();

  const handleStartBooking = () => {
    if (!user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/services";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      window.location.reload();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                GlowBridge
              </h1>
            </div>
            {}
            <div className="flex md:hidden items-center gap-2">
              {user && userData ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard1">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/login")}
                >
                  Sign In
                </Button>
              )}
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Services
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Salons
              </Link>
              <Link
                href="/products"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              {user && userData ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      Welcome, {userData.name}
                    </span>
                  </div>
                  <Link href="/dashboard1">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/login")}
                >
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      {}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Book Your Perfect
            <span className="text-primary block">Beauty Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Discover and book appointments at Sri Lanka&apos;s finest beauty
            salons. From haircuts to spa treatments, find your perfect match.
          </p>

          {}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2 p-2 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search services, salons, or treatments..."
                  className="border-0 bg-transparent focus-visible:ring-0 text-base"
                  onClick={() => (window.location.href = "/services")}
                />
              </div>
              <div className="flex items-center gap-2 px-3 border-l border-border">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="border-0 bg-transparent focus-visible:ring-0 text-base w-32"
                  onClick={() => (window.location.href = "/services")}
                />
              </div>
              <Button
                size="lg"
                className="px-8"
                onClick={() => (window.location.href = "/services")}
              >
                Search
              </Button>
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">
                Partner Salons
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">
                Online Booking
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.9★</div>
              <div className="text-sm text-muted-foreground">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>
      {}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Popular Services
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our wide range of beauty and wellness services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/services">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Scissors className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Hair Services</CardTitle>
                  <CardDescription>
                    Cuts, styling, coloring & treatments
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>From Rs. 2,500</span>
                    <Badge variant="secondary">Popular</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/services">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Scissors className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Facial Treatments</CardTitle>
                  <CardDescription>
                    Deep cleansing, anti-aging & glow
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>From Rs. 3,500</span>
                    <Badge variant="secondary">Trending</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/services">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Nail Care</CardTitle>
                  <CardDescription>
                    Manicure, pedicure & nail art
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>From Rs. 1,800</span>
                    <Badge variant="secondary">New</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/services">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Spa & Wellness</CardTitle>
                  <CardDescription>
                    Massage, body treatments & relaxation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>From Rs. 4,500</span>
                    <Badge variant="secondary">Premium</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to Book Your Appointment?
          </h3>
          <p className="text-muted-foreground mb-8 text-pretty">
            Join thousands of satisfied customers who trust BeautyBook for their
            beauty needs. Book now and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" onClick={handleStartBooking}>
              Start Booking
            </Button>
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="px-8 bg-transparent"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold">BeautyBook</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Sri Lanka&apos;s premier beauty booking platform. Connecting you
                with the best salons and spas.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Hair Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Facial Treatments
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Nail Care
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Spa & Wellness
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Partner Salons
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Booking Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 BeautyBook. All rights reserved. Made with ❤️ in Sri
              Lanka.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
