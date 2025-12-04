"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Smartphone, RotateCcw } from "lucide-react";

interface OTPVerificationProps {
  phoneNumber: string;
  sessionId: string;
  onVerificationSuccess: (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => void;
  onVerificationFailure: (error: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function OTPVerification({
  phoneNumber,
  sessionId,
  onVerificationSuccess,
  onBack,
  isLoading = false,
}: OTPVerificationProps) {
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOTP.every((digit) => digit !== "") && newOTP.join("").length === 6) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          otp: codeToVerify,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onVerificationSuccess(data.session);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        // Clear OTP inputs on error and focus first input
        setOTP(["", "", "", "", "", ""]);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Network error. Please try again.");
      // Clear OTP inputs on error and focus first input
      setOTP(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api_g/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset timer and state
        setTimeLeft(600);
        setCanResend(false);
        setOTP(["", "", "", "", "", ""]);
        setError("");
        // Focus on first input after resend
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1***$3");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Verify Payment</CardTitle>
          <p className="text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{maskedPhone}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-2">
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
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-200 shadow-sm"
                  disabled={isVerifying || isLoading}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          {/* Timer and Resend */}
          <div className="text-center space-y-2">
            {timeLeft > 0 ? (
              <p className="text-sm text-muted-foreground">
                Code expires in {formatTime(timeLeft)}
              </p>
            ) : (
              <p className="text-sm text-destructive">Code expired</p>
            )}

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={!canResend || isResending || isLoading}
                className="text-blue-600 hover:text-blue-700"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleVerifyOTP()}
              disabled={isVerifying || otp.some((digit) => !digit) || isLoading}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
              disabled={isVerifying || isLoading}
            >
              Back to Payment
            </Button>
          </div>

          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 text-center">
              🔒 This verification ensures your payment security. Never share
              this code with anyone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
