"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Smartphone, AlertTriangle } from "lucide-react";

interface OTPModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onClose: () => void;
  onOTPVerified: (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => void;
}

export default function OTPModal({
  isOpen,
  phoneNumber,
  onClose,
  onOTPVerified,
}: OTPModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [enteredPhone, setEnteredPhone] = useState(phoneNumber || "");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Update enteredPhone when phoneNumber prop changes
  useEffect(() => {
    if (phoneNumber && phoneNumber !== enteredPhone) {
      setEnteredPhone(phoneNumber);
    }
  }, [phoneNumber, enteredPhone]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Sri Lankan phone number validation
    const phoneRegex = /^(?:\+94|94|0)?([1-9]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("94")) {
      return "+" + cleaned;
    } else if (cleaned.startsWith("0")) {
      return "+94" + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      return "+94" + cleaned;
    }

    return phone;
  };

  const handleSendOTP = useCallback(async () => {
    if (!validatePhoneNumber(enteredPhone)) {
      setPhoneError("Please enter a valid Sri Lankan phone number");
      return;
    }

    setIsLoading(true);
    setPhoneError("");

    try {
      const formattedPhone = formatPhoneNumber(enteredPhone);

      const response = await fetch("/api_g/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setStep("otp");
      } else {
        setPhoneError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setPhoneError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [enteredPhone]);

  const handlePhoneNumberChange = (value: string) => {
    setEnteredPhone(value);
    setPhoneError("");
  };

  // Auto-send OTP if modal opens with valid phone number from shipping details
  useEffect(() => {
    if (
      isOpen &&
      phoneNumber &&
      validatePhoneNumber(phoneNumber) &&
      step === "phone" &&
      !isLoading
    ) {
      // Auto-send OTP if we have a valid phone number from shipping details
      handleSendOTP();
    }
  }, [isOpen, phoneNumber, step, isLoading, handleSendOTP]);

  const handleVerificationSuccess = (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => {
    onOTPVerified(sessionData);
    onClose();
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {step === "phone"
              ? "Verify Phone Number"
              : "Enter Verification Code"}
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "We'll send you a verification code to confirm your payment"
              : `We've sent a 6-digit code to ${enteredPhone}`}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+94 77 123 4567"
                value={enteredPhone}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                disabled={isLoading}
                className={`border-2 bg-white transition-all duration-200 ${
                  phoneError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              />
              {phoneError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {phoneError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Format: +94771234567, 0771234567, or 771234567
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendOTP}
                className="flex-1"
                disabled={isLoading || !enteredPhone}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Inline OTP verification - simplified version */}
            <OTPVerificationInline
              sessionId={sessionId}
              onVerificationSuccess={handleVerificationSuccess}
              onBack={handleBack}
              isLoading={isLoading}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Simplified inline OTP component for modal
interface OTPVerificationInlineProps {
  sessionId: string;
  onVerificationSuccess: (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

function OTPVerificationInline({
  sessionId,
  onVerificationSuccess,
  onBack,
  isLoading = false,
}: OTPVerificationInlineProps) {
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (newOTP.every((digit) => digit !== "")) {
      handleVerifyOTP(newOTP.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is empty and backspace is pressed, go to previous box
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // If current box has value, clear it
        const newOTP = [...otp];
        newOTP[index] = "";
        setOTP(newOTP);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join("");

    if (codeToVerify.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api_g/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, otp: codeToVerify }),
      });

      const data = await response.json();

      if (data.success) {
        onVerificationSuccess(data.session);
      } else {
        setError(data.message || "Invalid OTP");
        setOTP(["", "", "", "", "", ""]);
        // Focus first input after error
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch {
      setError("Network error. Please try again.");
      setOTP(["", "", "", "", "", ""]);
      // Focus first input after error
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-10 text-center border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-200 shadow-sm font-semibold text-lg"
            disabled={isVerifying || isLoading}
          />
        ))}
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <p className="text-sm text-center text-muted-foreground">
        Code expires in {formatTime(timeLeft)}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isVerifying}
        >
          Back
        </Button>
        <Button
          onClick={() => handleVerifyOTP()}
          disabled={isVerifying || otp.some((digit) => !digit)}
          className="flex-1"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </div>
    </div>
  );
}
