"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Calendar,
  Users,
  BarChart3,
  Scissors,
  Star,
  Clock,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

export default function SalonLandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-heading text-foreground">
              Glow<span className="text-primary">Bridge</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Reviews
            </a>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-muted/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Trusted by 10,000+ Salons Worldwide
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-foreground mb-6 leading-tight">
              Transform Your Salon Into a
              <span className="text-primary"> Luxury Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline appointments, delight clients, and grow your business
              with our premium salon management platform designed for modern
              beauty professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </section>

      {}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-card-foreground mb-4">
              Everything You Need to Run Your Salon
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From appointment booking to client management, we&quot;ve got
              every aspect of your salon covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description:
                  "AI-powered appointment booking that prevents double-bookings and optimizes your calendar.",
              },
              {
                icon: Users,
                title: "Client Management",
                description:
                  "Comprehensive client profiles with service history, preferences, and automated follow-ups.",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description:
                  "Real-time insights into revenue, popular services, and staff performance metrics.",
              },
              {
                icon: CreditCard,
                title: "Payment Processing",
                description:
                  "Secure payment handling with support for cards, digital wallets, and installment plans.",
              },
              {
                icon: Star,
                title: "Review Management",
                description:
                  "Automated review requests and reputation monitoring across all major platforms.",
              },
              {
                icon: Clock,
                title: "Staff Scheduling",
                description:
                  "Effortless staff management with shift planning, availability tracking, and payroll integration.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="font-heading text-card-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {}
      <section id="pricing" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include our core
              features with premium support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {}
            <Card className="border-border hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="font-heading text-2xl text-card-foreground">
                  Free
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Perfect for getting started
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold font-heading text-card-foreground">
                    $0
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Up to 50 appointments/month",
                    "Basic client management",
                    "Email support",
                    "Mobile app access",
                    "Basic reporting",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {}
            <Card className="border-primary shadow-xl scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="font-heading text-2xl text-card-foreground">
                  Pro
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  For growing salons
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold font-heading text-card-foreground">
                    $49
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Unlimited appointments",
                    "Advanced client profiles",
                    "Priority support",
                    "Staff management",
                    "Advanced analytics",
                    "Payment processing",
                    "Review management",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {}
            <Card className="border-border hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="font-heading text-2xl text-card-foreground">
                  Diamond
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  For salon chains & enterprises
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold font-heading text-card-foreground">
                    $149
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Everything in Pro",
                    "Multi-location management",
                    "White-label options",
                    "Dedicated account manager",
                    "Custom integrations",
                    "Advanced security",
                    "24/7 phone support",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {}
      <section id="testimonials" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-card-foreground mb-4">
              Loved by Salon Owners Everywhere
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how GlowBridge has transformed businesses just like yours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Owner, Luxe Beauty Salon",
                content:
                  "GlowBridge transformed how we operate. Our booking efficiency increased by 40% and client satisfaction is at an all-time high.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Manager, Urban Cuts",
                content:
                  "The analytics dashboard gives us insights we never had before. We've optimized our services and increased revenue by 25%.",
                rating: 5,
              },
              {
                name: "Emma Rodriguez",
                role: "Owner, Bella Vista Spa",
                content:
                  "Customer support is exceptional. The team helped us migrate seamlessly and we were up and running in just one day.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-accent fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-card-foreground mb-4 leading-relaxed">
                    &quot;&quot;{testimonial.content}&quot;&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-primary-foreground mb-6">
            Ready to Transform Your Salon?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of salon owners who have already elevated their
            business with GlowBridge.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-heading text-card-foreground">
                  Glow<span className="text-primary">Bridge</span>
                </span>
              </div>
              <p className="text-muted-foreground">
                Premium salon management software designed for modern beauty
                professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">
                Product
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Training
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">
                Company
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 GlowBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
