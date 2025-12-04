import crypto from 'crypto';
import { logger } from '../utils/logger';
import { notifyLKService } from './SMSService';

export interface OTPSession {
  id: string;
  phoneNumber: string;
  otpCode: string;
  userId?: string;
  orderData?: any;
  expiresAt: Date;
  isVerified: boolean;
  attempts: number;
  createdAt: Date;
}

export class OTPService {
  private otpSessions: Map<string, OTPSession> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  constructor() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string, userId?: string, orderData?: any): Promise<{ sessionId: string; success: boolean; message: string }> {
    try {
      // Check for recent OTP requests (rate limiting)
      const recentSession = this.findRecentSession(phoneNumber);
      if (recentSession) {
        const timeSinceLastRequest = Date.now() - recentSession.createdAt.getTime();
        if (timeSinceLastRequest < this.RESEND_COOLDOWN_SECONDS * 1000) {
          const waitTime = Math.ceil((this.RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastRequest) / 1000);
          return {
            sessionId: '',
            success: false,
            message: `Please wait ${waitTime} seconds before requesting another OTP`,
          };
        }
      }

      const otp = this.generateOTP();
      const sessionId = crypto.randomUUID();
      
      const session: OTPSession = {
        id: sessionId,
        phoneNumber,
        otpCode: this.hashOTP(otp),
        userId,
        orderData,
        expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
        isVerified: false,
        attempts: 0,
        createdAt: new Date(),
      };

      // Send SMS
      const smsSuccess = await notifyLKService.sendOTP(phoneNumber, otp);
      
      if (!smsSuccess) {
        return {
          sessionId: '',
          success: false,
          message: 'Failed to send OTP. Please try again.',
        };
      }

      // Store session
      this.otpSessions.set(sessionId, session);

      logger.info(`OTP sent to ${phoneNumber}, session: ${sessionId}`);

      return {
        sessionId,
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      logger.error('Error sending OTP:', error);
      return {
        sessionId: '',
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  async verifyOTP(sessionId: string, otp: string): Promise<{ success: boolean; message: string; session?: OTPSession }> {
    const session = this.otpSessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        message: 'Invalid or expired OTP session',
      };
    }

    // Check if expired
    if (Date.now() > session.expiresAt.getTime()) {
      this.otpSessions.delete(sessionId);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check attempts
    if (session.attempts >= this.MAX_ATTEMPTS) {
      this.otpSessions.delete(sessionId);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      };
    }

    // Increment attempts
    session.attempts++;

    // Verify OTP
    const hashedInputOTP = this.hashOTP(otp);
    if (hashedInputOTP !== session.otpCode) {
      this.otpSessions.set(sessionId, session);
      return {
        success: false,
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - session.attempts} attempts remaining.`,
      };
    }

    // Success
    session.isVerified = true;
    this.otpSessions.set(sessionId, session);

    logger.info(`OTP verified successfully for session: ${sessionId}`);

    return {
      success: true,
      message: 'OTP verified successfully',
      session,
    };
  }

  getSession(sessionId: string): OTPSession | undefined {
    return this.otpSessions.get(sessionId);
  }

  deleteSession(sessionId: string): void {
    this.otpSessions.delete(sessionId);
  }

  private hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp + process.env.OTP_SALT || 'glowbridge_salt').digest('hex');
  }

  private findRecentSession(phoneNumber: string): OTPSession | undefined {
    for (const session of this.otpSessions.values()) {
      if (session.phoneNumber === phoneNumber) {
        return session;
      }
    }
    return undefined;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.otpSessions.entries()) {
      if (now > session.expiresAt.getTime()) {
        this.otpSessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired OTP sessions`);
    }
  }

  // Get session stats (for debugging/monitoring)
  getStats(): { totalSessions: number; expiredSessions: number } {
    const now = Date.now();
    let expiredCount = 0;

    for (const session of this.otpSessions.values()) {
      if (now > session.expiresAt.getTime()) {
        expiredCount++;
      }
    }

    return {
      totalSessions: this.otpSessions.size,
      expiredSessions: expiredCount,
    };
  }
}

export const otpService = new OTPService();