import { Router } from 'express';
import { createOTPControllerInstance } from '../controllers/OTPController';

const router = Router();

const {
  sendOTPHandler,
  verifyOTPHandler,
  resendOTPHandler,
  getSessionStatusHandler,
  validateSessionHandler,
} = createOTPControllerInstance();

// Send OTP to phone number
router.post('/otp/send', sendOTPHandler);

// Verify OTP code
router.post('/otp/verify', verifyOTPHandler);

// Resend OTP
router.post('/otp/resend', resendOTPHandler);

// Get session status
router.get('/otp/session/:sessionId', getSessionStatusHandler);

// Validate session (for payment verification)
router.post('/otp/validate-session', validateSessionHandler);

export default router;