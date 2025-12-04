
"use client";

import React, { Suspense } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { ShoppingCartProvider } from "@/components/shopping/ShoppingProvider";
import CartSidebar from "@/components/shopping/CartSidebar";
import { Toaster } from "react-hot-toast";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <ShoppingCartProvider>
          <div className="min-h-screen">
            {children}
            <CartSidebar />
          </div>
        </ShoppingCartProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: { background: "#363636", color: "#fff" },
            success: { style: { background: "#10b981" } },
            error: { style: { background: "#ef4444" } },
          }}
        />
      </AuthProvider>
    </Suspense>
  );
}
