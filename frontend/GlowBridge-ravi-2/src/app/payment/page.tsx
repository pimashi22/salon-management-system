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
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useShoppingCart,
  CartItem,
} from "@/components/shopping/ShoppingProvider";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder, CreateOrderItem } from "@/lib/orderApi";
import { generateReceiptFromOrderData } from "@/lib/receiptGeneratorSimple";
import OTPModal from "@/components/OTPModal";
import { usePaymentWithOTP } from "@/hooks/usePaymentWithOTP";

interface PaymentFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string; // Added phone field
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
    description: "Your delivery address and contact",
    icon: MapPin,
  },
  {
    id: 2,
    title: "Payment Method",
    description: "Card details and verification",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Security Verification",
    description: "OTP verification for secure payment",
    icon: Shield,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useShoppingCart();
  const { userData } = useAuth();

  // Use the payment hook with OTP (only for OTP management)
  const {
    isOTPModalOpen,
    otpSession,
    requireOTPVerification,
    handleOTPVerified,
    closeOTPModal,
  } = usePaymentWithOTP();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [savedCartItems, setSavedCartItems] = useState<CartItem[]>([]);
  const [savedCartTotal, setSavedCartTotal] = useState<number>(0);

  const taxAmount = cartTotal * 0.1;
  const finalTotal = cartTotal + taxAmount;

  // Input styling utility
  const getInputClassName = (hasError: boolean) => {
    return `border-2 bg-white transition-all duration-200 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    }`;
  };

  // Receipt download handler
  const handleDownloadReceipt = () => {
    if (!paymentResult?.orderId) return;

    // Use saved cart items instead of current cart (which is cleared after payment)
    const itemsToUse = savedCartItems.length > 0 ? savedCartItems : cartItems;
    const totalToUse = savedCartTotal > 0 ? savedCartTotal : cartTotal;

    const orderData = {
      id: paymentResult.orderId,
      transactionId: paymentResult.transactionId,
      orderDate: new Date().toISOString(),
      items: itemsToUse.map((item) => ({
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      totalAmount: totalToUse + totalToUse * 0.1, // Include tax in final total
      paymentType: formData.cardNumber
        ? `Credit Card ending in ${formData.cardNumber.slice(-4)}`
        : "Credit Card",
    };

    const customerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: userData?.email || "",
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
    };

    generateReceiptFromOrderData(
      orderData,
      customerData,
      totalToUse,
      totalToUse * 0.1
    );
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(?:\+94|94|0)?([1-9]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    let isValid = true;

    switch (step) {
      case 1: // Shipping Details
        if (!formData.firstName.trim()) {
          newErrors.firstName = "First name is required";
          isValid = false;
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = "Last name is required";
          isValid = false;
        }
        if (!formData.address.trim()) {
          newErrors.address = "Address is required";
          isValid = false;
        }
        if (!formData.city.trim()) {
          newErrors.city = "City is required";
          isValid = false;
        }
        if (!formData.postalCode.trim()) {
          newErrors.postalCode = "Postal code is required";
          isValid = false;
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
          isValid = false;
        } else if (!validatePhoneNumber(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
          isValid = false;
        }
        break;

      case 2: // Payment Method
        if (!formData.cardNumber.replace(/\s/g, "")) {
          newErrors.cardNumber = "Card number is required";
          isValid = false;
        } else if (formData.cardNumber.replace(/\s/g, "").length < 13) {
          newErrors.cardNumber = "Please enter a valid card number";
          isValid = false;
        }
        if (!formData.expiryDate) {
          newErrors.expiryDate = "Expiry date is required";
          isValid = false;
        } else if (!isExpiryDateValid(formData.expiryDate)) {
          newErrors.expiryDate =
            "Please enter a valid expiry date (MM/YY) that is not in the past";
          isValid = false;
        }
        if (!formData.cvv) {
          newErrors.cvv = "CVV is required";
          isValid = false;
        } else if (formData.cvv.length < 3) {
          newErrors.cvv = "CVV must be 3 digits";
          isValid = false;
        }
        if (!formData.cardholderName.trim()) {
          newErrors.cardholderName = "Cardholder name is required";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // After payment details are validated, require OTP verification
        setCurrentStep(3);
        requireOTPVerification();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, 3));
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const processOrderWithOTP = async () => {
    try {
      // Check if user is authenticated
      if (!userData?.id) {
        throw new Error(
          "User authentication required. Please sign in and try again."
        );
      }

      // Validate cart items have originalId (UUID)
      const invalidItems = cartItems.filter((item) => !item.originalId);
      if (invalidItems.length > 0) {
        throw new Error(
          "Some cart items are invalid. Please refresh the page and add items to cart again."
        );
      }

      // Convert cart items to order items format
      const orderItems: CreateOrderItem[] = cartItems.map((item) => ({
        product_id: item.originalId,
        quantity: item.quantity,
        price: item.price,
      }));

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
        transactionId: `TXN${Date.now()}${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`,
      };
    } catch (error: unknown) {
      console.error("Order creation failed:", error);
      throw error;
    }
  };

  const [isProcessingFinalPayment, setIsProcessingFinalPayment] =
    useState(false);

  const handleFinalPayment = async () => {
    if (!otpSession?.verified) {
      requireOTPVerification();
      return;
    }

    setIsProcessingFinalPayment(true);
    try {
      // Process the actual order creation (from original payment page logic)
      const result = await processOrderWithOTP();
      setPaymentResult(result);

      if (result.success) {
        // Save cart items and total before clearing for receipt generation
        setSavedCartItems([...cartItems]);
        setSavedCartTotal(cartTotal);
        clearCart();
      }
    } catch (error: unknown) {
      console.error("Payment processing error:", error);
      setPaymentResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again.",
      });
    } finally {
      setIsProcessingFinalPayment(false);
    }
  };

  const handleOTPSuccess = (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => {
    handleOTPVerified(sessionData);
    console.log("OTP verified successfully!", sessionData);
    // Don't automatically proceed - let user click the final payment button
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

  const isExpiryDateValid = (expiryDate: string) => {
    if (!expiryDate || expiryDate.length !== 5) return false;

    const [month, year] = expiryDate.split("/");
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(`20${year}`, 10);

    // Check if month is valid (01-12)
    if (monthNum < 1 || monthNum > 12) return false;

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

    // Check if the expiry date is in the future
    if (yearNum > currentYear) return true;
    if (yearNum === currentYear && monthNum >= currentMonth) return true;

    return false;
  };

  // Show success/error result
  if (paymentResult) {
    const result = paymentResult;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              {result.success ? (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h1 className="text-2xl font-bold text-green-700">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600">{result.message}</p>
                  {result.transactionId && (
                    <p className="text-sm text-gray-500">
                      Transaction ID:{" "}
                      <span className="font-mono">{result.transactionId}</span>
                    </p>
                  )}
                  <div className="flex gap-4 justify-center mt-6">
                    <Button onClick={handleDownloadReceipt} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                    <Button onClick={() => router.push("/")}>
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h1 className="text-2xl font-bold text-red-700">
                    Payment Failed
                  </h1>
                  <p className="text-gray-600">{result.message}</p>
                  <div className="flex gap-4 justify-center mt-6">
                    <Button
                      onClick={() => {
                        setPaymentResult(null);
                        setCurrentStep(1);
                      }}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => router.push("/")}
                      variant="secondary"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/90">
        <div className="container mx-auto px-4 max-w-4xl py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Secure Checkout</h1>
              <p className="text-sm text-muted-foreground">Complete your order with confidence</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {paymentSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    {index < paymentSteps.length - 1 && (
                      <div
                        className={`h-1 w-16 mx-2 ${
                          currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold">
                  {paymentSteps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600">
                  {paymentSteps[currentStep - 1].description}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-6"
                >
                  {/* Step 1: Shipping Details */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="Enter the First Name"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className={getInputClassName(!!errors.firstName)}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-red-600">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Enter the Last Name"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className={getInputClassName(!!errors.lastName)}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-red-600">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="Enter the Address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className={getInputClassName(!!errors.address)}
                        />
                        {errors.address && (
                          <p className="text-sm text-red-600">
                            {errors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="Enter the City"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className={getInputClassName(!!errors.city)}
                          />
                          {errors.city && (
                            <p className="text-sm text-red-600">
                              {errors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            placeholder="Enter the Posatal Code"
                            value={formData.postalCode}
                            onChange={(e) =>
                              handleInputChange("postalCode", e.target.value)
                            }
                            className={getInputClassName(!!errors.postalCode)}
                          />
                          {errors.postalCode && (
                            <p className="text-sm text-red-600">
                              {errors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter the Phone Nmuber"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className={getInputClassName(!!errors.phone)}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-600">{errors.phone}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Required for payment verification SMS
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "cardNumber",
                              formatCardNumber(e.target.value)
                            )
                          }
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={19}
                          className={getInputClassName(!!errors.cardNumber)}
                        />
                        {errors.cardNumber && (
                          <p className="text-sm text-red-600">
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              handleInputChange(
                                "expiryDate",
                                formatExpiryDate(e.target.value)
                              )
                            }
                            placeholder="MM/YY"
                            maxLength={5}
                            className={getInputClassName(!!errors.expiryDate)}
                          />
                          {errors.expiryDate && (
                            <p className="text-sm text-red-600">
                              {errors.expiryDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) =>
                              handleInputChange(
                                "cvv",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                            placeholder="XXX"
                            maxLength={3}
                            className={getInputClassName(!!errors.cvv)}
                          />
                          {errors.cvv && (
                            <p className="text-sm text-red-600">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          value={formData.cardholderName}
                          onChange={(e) =>
                            handleInputChange("cardholderName", e.target.value)
                          }
                          placeholder="Enter the Cardholder's Name"
                          className={getInputClassName(!!errors.cardholderName)}
                        />
                        {errors.cardholderName && (
                          <p className="text-sm text-red-600">
                            {errors.cardholderName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: OTP Verification */}
                  {currentStep === 3 && (
                    <div className="space-y-6 text-center">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Security Verification Required
                        </h3>
                        <p className="text-gray-600 mb-4">
                          For your security, we&apos;ll send a verification code
                          to your phone number:
                        </p>
                        <p className="font-medium text-blue-800">
                          {formData.phone}
                        </p>

                        {otpSession?.verified ? (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-green-800 font-medium">
                              Phone verified successfully!
                            </p>
                            <p className="text-sm text-green-600">
                              You can now complete your payment
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <Button
                              onClick={() => requireOTPVerification()}
                              className="w-full"
                              disabled={isProcessingFinalPayment}
                            >
                              <Smartphone className="w-4 h-4 mr-2" />
                              Send Verification Code
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={isProcessingFinalPayment}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}

                    <div className="ml-auto">
                      {currentStep < 3 ? (
                        <Button onClick={nextStep}>
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleFinalPayment}
                          disabled={
                            !otpSession?.verified || isProcessingFinalPayment
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessingFinalPayment ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Complete Secure Payment
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      LKR {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>LKR {cartTotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax (10%)</p>
                    <p>LKR {taxAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <p>Total</p>
                    <p>LKR {finalTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Secure Payment
                      </p>
                      <p className="text-xs text-green-600">
                        Protected by SMS verification
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        phoneNumber={formData.phone}
        onClose={closeOTPModal}
        onOTPVerified={handleOTPSuccess}
      />
    </div>
  );
}