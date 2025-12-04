"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  Lock,
  Star,
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import AuthModal from "./AuthModal";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, userData, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  if (user && userData) {
    return <>{children}</>;
  }


  return (
    <>
      <div className="min-h-screen bg-background">
        {}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {}
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold font-heading text-foreground">
                    Glow<span className="text-primary">Bridge</span>
                  </span>
                </div>
                {}
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Main Site</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Sign In Required
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join GlowBridge to discover premium beauty products and enjoy a
              personalized shopping experience
            </p>
          </div>

          {}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => openAuthModal("signup")}
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Create Account
            </Button>
            <Button
              onClick={() => openAuthModal("login")}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>

          {}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Premium Products
                </h3>
                <p className="text-muted-foreground">
                  Access curated beauty products from top-rated salons and spas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Personal Account
                </h3>
                <p className="text-muted-foreground">
                  Track orders, save favorites, and get personalized
                  recommendations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Secure Shopping
                </h3>
                <p className="text-muted-foreground">
                  Safe and secure checkout with order protection and support
                </p>
              </CardContent>
            </Card>
          </div>

          {}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                Why Create an Account?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">
                    Order tracking and history
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Saved payment methods</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">
                    Wishlist and favorites
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">
                    Exclusive deals and offers
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">
                    Personalized recommendations
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">
                    Early access to new products
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {

        }}
      />
    </>
  );
}
