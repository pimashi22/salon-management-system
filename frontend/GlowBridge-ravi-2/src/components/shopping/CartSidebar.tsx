"use client";

import React, { useState } from "react";
import { X, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShoppingCart } from "./ShoppingProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

export default function CartSidebar() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearInvalidItems,
  } = useShoppingCart();

  const { userData } = useAuth();
  const router = useRouter();


  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleProceedToPayment = () => {
    if (userData) {

      setIsCartOpen(false);
      router.push("/payment");
    } else {

      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {

    setAuthModalOpen(false);
    setIsCartOpen(false);
    router.push("/payment");
  };

  if (!isCartOpen) return null;

  return (
    <>
      {}
      <div
        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
        onClick={() => setIsCartOpen(false)}
      />

      {}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 shadow-lg">
        <div className="flex flex-col h-full">
          {}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Shopping Cart
              </h2>
              {cartCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cartCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {}
          {cartItems.some((item) => !item.originalId) && (
            <div className="p-4 bg-destructive/10 border-b border-destructive/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">
                    Some cart items are outdated
                  </p>
                  <p className="text-xs text-destructive/80">
                    These items cannot be ordered. Clear them to proceed.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearInvalidItems}
                  className="ml-2"
                >
                  Clear Invalid
                </Button>
              </div>
            </div>
          )}

          {}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Your cart is empty
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add some products to get started
                </p>
                <Button onClick={() => setIsCartOpen(false)} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              IMG
                            </span>
                          </div>
                        </div>

                        {}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-primary font-semibold mt-1">
                            LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>

                          {}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Item Total:
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            LKR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {}
          {cartItems.length > 0 && (
            <div className="border-t border-border p-6 space-y-4">
              {}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground">
                    LKR {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-foreground">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="text-foreground">
                    LKR {(cartTotal * 0.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">
                      LKR {(cartTotal * 1.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
