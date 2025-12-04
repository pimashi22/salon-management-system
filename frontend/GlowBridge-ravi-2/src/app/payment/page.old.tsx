"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShoppingCart } from "@/components/shopping/ShoppingProvider";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder, CreateOrderItem, ApiError } from "@/lib/orderApi";
import { generateReceiptFromOrderData } from "@/lib/receiptGeneratorSimple";

interface PaymentFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  orderId?: string;
}

const paymentSteps: PaymentStep[] = [
  {
    id: 1,
    title: "Shipping Details",
    description: "Your delivery address",
    icon: MapPin,
  },
  {
    id: 2,
    title: "Payment Method",
    description: "Card details and confirmation",
    icon: CreditCard,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useShoppingCart();
  const { userData } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [stepErrors, setStepErrors] = useState<{ [key: number]: boolean }>({});

  const taxAmount = cartTotal * 0.1;
  const finalTotal = cartTotal + taxAmount;

  // Receipt download handler
  const handleDownloadReceipt = () => {
    if (!paymentResult?.orderId) return;

    const orderData = {
      id: paymentResult.orderId,
      transactionId: paymentResult.transactionId,
      orderDate: new Date().toISOString(),
      items: cartItems.map(item => ({
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      totalAmount: finalTotal,
      paymentType: formData.cardNumber ? `Credit Card ending in ${formData.cardNumber.slice(-4)}` : 'Credit Card',
    };

    const customerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: userData?.email || '',
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
    };

    generateReceiptFromOrderData(orderData, customerData, cartTotal, taxAmount);
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    let isValid = true;

    switch (step) {
      case 1: // Shipping Details
        if (!formData.firstName) {
          newErrors.firstName = "First name is required";
          isValid = false;
        }
        if (!formData.lastName) {
          newErrors.lastName = "Last name is required";
          isValid = false;
        }
        if (!formData.address) {
          newErrors.address = "Address is required";
          isValid = false;
        }
        if (!formData.city) {
          newErrors.city = "City is required";
          isValid = false;
        }
        if (!formData.postalCode) {
          newErrors.postalCode = "Postal code is required";
          isValid = false;
        }
        break;

      case 2:
        if (!formData.cardholderName) {
          newErrors.cardholderName = "Cardholder name is required";
          isValid = false;
        }
        if (!formData.cardNumber) {
          newErrors.cardNumber = "Card number is required";
          isValid = false;
        } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
          newErrors.cardNumber = "Card number must be 16 digits";
          isValid = false;
        }
        if (!formData.expiryDate) {
          newErrors.expiryDate = "Expiry date is required";
          isValid = false;
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
          newErrors.expiryDate = "Expiry date must be MM/YY format";
          isValid = false;
        }
        if (!formData.cvv) {
          newErrors.cvv = "CVV is required";
          isValid = false;
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
          newErrors.cvv = "CVV must be 3-4 digits";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    setStepErrors((prev) => ({ ...prev, [step]: !isValid }));
    return isValid;
  };

  const validateForm = (): boolean => {
    return validateStep(1) && validateStep(2);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const processPaymentAndCreateOrder = async (): Promise<PaymentResult> => {
    try {
      // Check if user is authenticated
      if (!userData?.id) {
        return {
          success: false,
          message:
            "User authentication required. Please sign in and try again.",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validate cart items have originalId (UUID)
      const invalidItems = cartItems.filter((item) => !item.originalId);

      if (invalidItems.length > 0) {
        console.error("Invalid cart items found:", invalidItems);
        return {
          success: false,
          message:
            "Some cart items are invalid. Please refresh the page and add items to cart again.",
        };
      }

      // Debug: Log cart items structure
      console.log(
        "Cart items for order creation:",
        cartItems.map((item) => ({
          id: item.id,
          originalId: item.originalId,
          name: item.name,
        }))
      );

      // Convert cart items to order items format
      const orderItems: CreateOrderItem[] = cartItems.map((item) => ({
        product_id: item.originalId, // Use the original UUID instead of numeric id
        quantity: item.quantity,
        price: item.price,
      }));

      // Create payment method string
      const paymentType = `Credit Card ending in ${formData.cardNumber.slice(
        -4
      )}`;

      const description = `Complete beauty package order containing ${cartItems.length} item(s). Order placed via web payment for ${userData.email}.`;

      // Create order using the new API
      const orderData = await createOrder({
        user_id: userData.id,
        items: orderItems,
        description: description,
        payment_type: paymentType,
      });

      return {
        success: true,
        message: "Payment processed and order created successfully!",
        orderId: orderData.id,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      };
    } catch (error) {
      console.error("Order creation failed:", error);

      if (error instanceof ApiError) {
        return {
          success: false,
          message: `Order creation failed: ${error.message}`,
        };
      }

      return {
        success: false,
        message: "Payment failed. Please check your details and try again.",
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 2) {
      nextStep();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processPaymentAndCreateOrder();
      setPaymentResult(result);

      if (result.success) {
        // Cart will be cleared when user manually navigates away from payment success page
        // This allows them to download receipt and see order details
      }
    } catch {
      setPaymentResult({
        success: false,
        message:
          "An error occurred while processing your order. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Show user's email */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  Order confirmation will be sent to:
                </p>
                <p className="text-blue-600">{userData?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Apartment 4B"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.address}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Colombo"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="00100"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  className={errors.postalCode ? "border-destructive" : ""}
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Delivery available within Sri Lanka only
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="Enter name as on card"
                value={formData.cardholderName}
                onChange={(e) =>
                  handleInputChange("cardholderName", e.target.value)
                }
                className={errors.cardholderName ? "border-destructive" : ""}
              />
              {errors.cardholderName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cardholderName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="XXXX XXXX XXXX XXXX"
                value={formData.cardNumber}
                onChange={(e) =>
                  handleInputChange(
                    "cardNumber",
                    formatCardNumber(e.target.value)
                  )
                }
                maxLength={19}
                className={errors.cardNumber ? "border-destructive" : ""}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cardNumber}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    handleInputChange(
                      "expiryDate",
                      formatExpiryDate(e.target.value)
                    )
                  }
                  maxLength={5}
                  className={errors.expiryDate ? "border-destructive" : ""}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="XXX"
                  value={formData.cvv}
                  onChange={(e) =>
                    handleInputChange("cvv", e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={4}
                  className={errors.cvv ? "border-destructive" : ""}
                />
                {errors.cvv && (
                  <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Your payment information is encrypted and secure
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Check for payment result first (before checking empty cart)
  if (paymentResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            {paymentResult.success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Payment Successful! & Order placed successfully!
                </h2>
                <p className="text-muted-foreground mb-4">
                  {paymentResult.message}
                </p>
                {paymentResult.transactionId && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Transaction ID: {paymentResult.transactionId}
                  </p>
                )}
                {paymentResult.orderId && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Order ID: {paymentResult.orderId}
                  </p>
                )}
                
                {/* Download Receipt Button */}
                <div className="space-y-3 mb-4">
                  <Button 
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="w-full"
                    disabled={!paymentResult.orderId}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      // Clear cart when user manually navigates away
                      clearCart();
                      router.push('/products');
                    }}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Payment Failed
                </h2>
                <p className="text-muted-foreground mb-4">
                  {paymentResult.message}
                </p>
                <Button onClick={() => setPaymentResult(null)}>
                  Try Again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Items to Checkout
            </h2>
            <p className="text-muted-foreground mb-4">
              Your cart is empty. Add some products before proceeding to
              payment.
            </p>
            <Button onClick={() => router.push("/")}>Back to Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {paymentSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const hasError = stepErrors[step.id];

                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : isActive
                                ? "border-primary text-primary bg-primary/10"
                                : hasError
                                ? "border-destructive text-destructive bg-destructive/10"
                                : "border-muted-foreground text-muted-foreground bg-muted"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <p
                              className={`text-sm font-medium ${
                                isActive
                                  ? "text-primary"
                                  : hasError
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {index < paymentSteps.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-4 ${
                              currentStep > step.id ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  {paymentSteps[currentStep - 1]?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="min-w-[140px]"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Processing...
                        </>
                      ) : currentStep === 2 ? (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        LKR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
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
                    <span className="text-muted-foreground">Tax (10%):</span>
                    <span className="text-foreground">
                      LKR {taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">
                        LKR {finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Security Notice */}
                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Secure Payment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your payment information is encrypted and processed
                        securely. We accept all major credit and debit cards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Step {currentStep} of 2</span>
                    <span>{Math.round((currentStep / 2) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 2) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
