import { Request, Response } from 'express';
import { otpService } from '../services/OTPService';
import { sendErrorResponse } from '../utils/errors';
import { logger } from '../utils/logger';

export class OTPController {
  sendOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { phoneNumber, userId, orderData } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required',
        });
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format',
        });
      }

      const result = await otpService.sendOTP(phoneNumber, userId, orderData);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          sessionId: result.sessionId,
          expiresInMinutes: 10,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in sendOTP controller:', error);
      return sendErrorResponse(res, error as Error);
    }
  };

  verifyOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sessionId, otp } = req.body;

      if (!sessionId || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and OTP are required',
        });
      }

      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          success: false,
          message: 'OTP must be 6 digits',
        });
      }

      const result = await otpService.verifyOTP(sessionId, otp);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          verified: true,
          session: result.session ? {
            id: result.session.id,
            phoneNumber: result.session.phoneNumber,
            userId: result.session.userId,
            orderData: result.session.orderData,
          } : undefined,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          verified: false,
        });
      }
    } catch (error) {
      logger.error('Error in verifyOTP controller:', error);
      return sendErrorResponse(res, error as Error);
    }
  };

  resendOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = otpService.getSession(sessionId);
      if (!session) {
        return res.status(400).json({
          success: false,
          message: 'Invalid session',
        });
      }

      // Delete old session and create new one
      otpService.deleteSession(sessionId);

      const result = await otpService.sendOTP(
        session.phoneNumber,
        session.userId,
        session.orderData
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'New OTP sent successfully',
          sessionId: result.sessionId,
          expiresInMinutes: 10,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in resendOTP controller:', error);
      return sendErrorResponse(res, error as Error);
    }
  };

  getSessionStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = otpService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      const now = Date.now();
      const isExpired = now > session.expiresAt.getTime();
      const timeRemaining = Math.max(0, session.expiresAt.getTime() - now);

      return res.status(200).json({
        success: true,
        session: {
          id: session.id,
          phoneNumber: session.phoneNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1***$3$4'), // Mask phone number
          isVerified: session.isVerified,
          isExpired,
          timeRemainingMs: timeRemaining,
          attempts: session.attempts,
          maxAttempts: 3,
        },
      });
    } catch (error) {
      logger.error('Error in getSessionStatus controller:', error);
      return sendErrorResponse(res, error as Error);
    }
  };

  validateSession = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = otpService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found or expired',
        });
      }

      if (!session.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Session is not verified',
        });
      }

      // Check if session is still valid (not expired)
      const now = Date.now();
      if (now > session.expiresAt.getTime()) {
        return res.status(400).json({
          success: false,
          message: 'Session has expired',
        });
      }

      return res.json({
        success: true,
        message: 'Session is valid',
        session: {
          sessionId: session.id,
          phoneNumber: session.phoneNumber,
          verified: session.isVerified,
          expiresAt: session.expiresAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error validating session:', error);
      return sendErrorResponse(res, error as Error);
    }
  };
}

export function createOTPControllerInstance() {
  const controller = new OTPController();

  return {
    sendOTPHandler: controller.sendOTP,
    verifyOTPHandler: controller.verifyOTP,
    resendOTPHandler: controller.resendOTP,
    getSessionStatusHandler: controller.getSessionStatus,
    validateSessionHandler: controller.validateSession,
  };
}