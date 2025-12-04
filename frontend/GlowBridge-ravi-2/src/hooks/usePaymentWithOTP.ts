"use client";

import { useState, useCallback } from "react";

interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  description?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface OTPSession {
  sessionId: string;
  phoneNumber: string;
  verified: boolean;
  expiresAt: string;
}

interface PaymentHookReturn {
  // OTP State
  isOTPRequired: boolean;
  isOTPModalOpen: boolean;
  otpSession: OTPSession | null;

  // Payment State
  isProcessingPayment: boolean;
  paymentError: string | null;
  paymentSuccess: boolean;

  // OTP Actions
  requireOTPVerification: () => void;
  handleOTPVerified: (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => void;
  closeOTPModal: () => void;

  // Payment Actions
  processPayment: (paymentData: PaymentData) => Promise<void>;
  resetPayment: () => void;
}

export function usePaymentWithOTP(): PaymentHookReturn {
  // OTP State
  const [isOTPRequired, setIsOTPRequired] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpSession, setOTPSession] = useState<OTPSession | null>(null);

  // Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // OTP Actions
  const requireOTPVerification = useCallback(() => {
    setIsOTPRequired(true);
    setIsOTPModalOpen(true);
    setPaymentError(null);
  }, []);

  const handleOTPVerified = useCallback(
    (sessionData: {
      sessionId: string;
      verified: boolean;
      phoneNumber: string;
      expiresAt: string;
    }) => {
      setOTPSession({
        sessionId: sessionData.sessionId,
        phoneNumber: sessionData.phoneNumber,
        verified: true,
        expiresAt: sessionData.expiresAt,
      });
      setIsOTPModalOpen(false);
      setIsOTPRequired(false);
    },
    []
  );

  const closeOTPModal = useCallback(() => {
    setIsOTPModalOpen(false);
    // Don't reset OTP requirement - user still needs to verify
  }, []);

  // Payment Actions
  const processPayment = useCallback(
    async (paymentData: PaymentData) => {
      try {
        setIsProcessingPayment(true);
        setPaymentError(null);

        // Check if OTP verification is required and completed
        if (!otpSession || !otpSession.verified) {
          setIsProcessingPayment(false);
          requireOTPVerification();
          return;
        }

        // Check if OTP session is still valid
        const now = new Date().toISOString();
        if (otpSession.expiresAt < now) {
          setOTPSession(null);
          setIsProcessingPayment(false);
          setPaymentError("OTP session expired. Please verify again.");
          requireOTPVerification();
          return;
        }

        // Process the actual payment
        console.log("Processing payment with OTP verification...", {
          paymentData,
          otpSessionId: otpSession.sessionId,
        });

        // Simulate payment processing (replace with your actual payment gateway)
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

        // For now, we'll simulate a successful payment
        // In a real implementation, you would:
        // 1. Call your payment gateway (Stripe, PayPal, etc.)
        // 2. Create the order in your database
        // 3. Send confirmation emails

        setPaymentSuccess(true);
        setOTPSession(null); // Clear OTP session after successful payment

        console.log("Payment successful!", paymentData);
      } catch (error: unknown) {
        console.error("Payment error:", error);
        setPaymentError(
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again."
        );
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [otpSession, requireOTPVerification]
  );

  const resetPayment = useCallback(() => {
    setIsProcessingPayment(false);
    setPaymentError(null);
    setPaymentSuccess(false);
    setOTPSession(null);
    setIsOTPRequired(false);
    setIsOTPModalOpen(false);
  }, []);

  return {
    // OTP State
    isOTPRequired,
    isOTPModalOpen,
    otpSession,

    // Payment State
    isProcessingPayment,
    paymentError,
    paymentSuccess,

    // OTP Actions
    requireOTPVerification,
    handleOTPVerified,
    closeOTPModal,

    // Payment Actions
    processPayment,
    resetPayment,
  };
}

export default usePaymentWithOTP;
