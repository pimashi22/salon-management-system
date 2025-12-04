import { logger } from '../utils/logger';

export interface SMSConfig {
  userId: string;
  apiKey: string;
  senderId: string;
}

export interface SMSResponse {
  status: string;
  data: string;
}

export class NotifyLKService {
  private config: SMSConfig;
  private baseURL = 'https://app.notify.lk/api/v1';

  constructor() {
    this.config = {
      userId: process.env.NOTIFY_LK_USER_ID || '',
      apiKey: process.env.NOTIFY_LK_API_KEY || '',
      senderId: process.env.NOTIFY_LK_SENDER_ID || 'GlowBridge',
    };

    if (!this.config.userId || !this.config.apiKey) {
      logger.warn('Notify.lk credentials not found. SMS service will be disabled.');
    } else {
      logger.info('Notify.lk SMS service initialized successfully');
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config.userId || !this.config.apiKey) {
      logger.error('Notify.lk credentials not configured');
      return false;
    }

    try {
      // Format phone number (ensure it starts with 94 for Sri Lanka)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const url = new URL(`${this.baseURL}/send`);
      url.searchParams.append('user_id', this.config.userId);
      url.searchParams.append('api_key', this.config.apiKey);
      url.searchParams.append('sender_id', this.config.senderId);
      url.searchParams.append('to', formattedPhone);
      url.searchParams.append('message', message);

      logger.info(`Sending SMS to ${formattedPhone}`);
      logger.info(`API URL: ${url.toString()}`);
      logger.info(`User ID: ${this.config.userId}`);
      logger.info(`API Key: ${this.config.apiKey}`);
      logger.info(`Sender ID: ${this.config.senderId}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: SMSResponse = await response.json();

      if (data.status === 'success') {
        logger.info(`SMS sent successfully to ${formattedPhone}`);
        return true;
      } else {
        logger.error(`Failed to send SMS: ${JSON.stringify(data)}`);
        return false;
      }
    } catch (error) {
      logger.error('Error sending SMS via Notify.lk:', error);
      return false;
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your GlowBridge verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    return this.sendSMS(phoneNumber, message);
  }

  async checkAccountStatus(): Promise<{ active: boolean; balance: number } | null> {
    if (!this.config.userId || !this.config.apiKey) {
      return null;
    }

    try {
      const url = new URL(`${this.baseURL}/status`);
      url.searchParams.append('user_id', this.config.userId);
      url.searchParams.append('api_key', this.config.apiKey);

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          active: data.data.active || false,
          balance: parseFloat(data.data.acc_balance) || 0,
        };
      }

      return null;
    } catch (error) {
      logger.error('Error checking Notify.lk account status:', error);
      return null;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, replace with 94
    if (cleaned.startsWith('0')) {
      cleaned = '94' + cleaned.slice(1);
    }
    
    // If doesn't start with 94, add it
    if (!cleaned.startsWith('94')) {
      cleaned = '94' + cleaned;
    }
    
    return cleaned;
  }
}

export const notifyLKService = new NotifyLKService();