"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OTPModal from "@/components/OTPModal";
import { usePaymentWithOTP } from "@/hooks/usePaymentWithOTP";

export default function OTPDemo() {
  const [showModal, setShowModal] = useState(false);
  const [demoPhone, setDemoPhone] = useState("+94771234567");
  const [logs, setLogs] = useState<string[]>([]);

  const {
    isOTPRequired,
    otpSession,
    isProcessingPayment,
    paymentError,
    paymentSuccess,
    requireOTPVerification,
    handleOTPVerified,
    processPayment,
    resetPayment,
  } = usePaymentWithOTP();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleTestOTP = () => {
    addLog("Starting OTP verification test");
    requireOTPVerification();
    setShowModal(true);
  };

  const handleOTPSuccess = (sessionData: {
    sessionId: string;
    verified: boolean;
    phoneNumber: string;
    expiresAt: string;
  }) => {
    addLog(`OTP verified successfully! Session: ${sessionData.sessionId}`);
    handleOTPVerified(sessionData);
    setShowModal(false);
  };

  const handleTestPayment = async () => {
    addLog("Testing payment with OTP verification");

    const mockPaymentData = {
      orderId: `TEST_${Date.now()}`,
      amount: 1500.0,
      currency: "LKR",
      description: "Test Order - Beauty Package",
      customerInfo: {
        name: "Test Customer",
        email: "test@example.com",
        phone: demoPhone,
      },
      items: [
        {
          id: "test-1",
          name: "Test Product",
          quantity: 1,
          price: 1500.0,
        },
      ],
    };

    try {
      await processPayment(mockPaymentData);
      addLog("Payment processing initiated");
    } catch (error: unknown) {
      addLog(
        `Payment error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleReset = () => {
    resetPayment();
    setLogs([]);
    addLog("Demo reset");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 OTP Payment System Demo</CardTitle>
            <p className="text-gray-600">
              Test the SMS OTP verification system with real phone numbers
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Test Controls</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Test Phone Number
                  </label>
                  <input
                    type="tel"
                    value={demoPhone}
                    onChange={(e) => setDemoPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+94771234567"
                  />
                </div>

                <div className="space-y-2">
                  <Button onClick={handleTestOTP} className="w-full">
                    🔐 Test OTP Modal
                  </Button>

                  <Button
                    onClick={handleTestPayment}
                    variant="outline"
                    className="w-full"
                    disabled={!otpSession?.verified}
                  >
                    💳 Test Payment Flow
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="w-full"
                  >
                    🔄 Reset Demo
                  </Button>
                </div>
              </div>

              {/* Status Display */}
              <div className="space-y-4">
                <h3 className="font-semibold">Current Status</h3>

                <div className="space-y-2 text-sm">
                  <div
                    className={`p-2 rounded ${
                      isOTPRequired
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100"
                    }`}
                  >
                    OTP Required: {isOTPRequired ? "Yes" : "No"}
                  </div>

                  <div
                    className={`p-2 rounded ${
                      otpSession?.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100"
                    }`}
                  >
                    Phone Verified: {otpSession?.verified ? "Yes" : "No"}
                  </div>

                  <div
                    className={`p-2 rounded ${
                      isProcessingPayment
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100"
                    }`}
                  >
                    Processing Payment: {isProcessingPayment ? "Yes" : "No"}
                  </div>

                  <div
                    className={`p-2 rounded ${
                      paymentSuccess
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100"
                    }`}
                  >
                    Payment Success: {paymentSuccess ? "Yes" : "No"}
                  </div>

                  {paymentError && (
                    <div className="p-2 rounded bg-red-100 text-red-800">
                      Error: {paymentError}
                    </div>
                  )}
                </div>

                {otpSession && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium text-sm mb-2">OTP Session</h4>
                    <div className="text-xs space-y-1">
                      <div>ID: {otpSession.sessionId}</div>
                      <div>Phone: {otpSession.phoneNumber}</div>
                      <div>
                        Expires:{" "}
                        {new Date(otpSession.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h3 className="font-semibold mb-3">Activity Log</h3>
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No activity yet...</div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Enter a valid Sri Lankan phone number (+94XXXXXXXXX)</li>
                <li>
                  Click &quot;Test OTP Modal&quot; to open the verification
                  dialog
                </li>
                <li>Enter your phone number and request the OTP</li>
                <li>Check your phone for the SMS and enter the 6-digit code</li>
                <li>Once verified, test the payment flow</li>
                <li>Check the activity log for detailed information</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showModal}
        phoneNumber={demoPhone}
        onClose={() => setShowModal(false)}
        onOTPVerified={handleOTPSuccess}
      />
    </div>
  );
}
