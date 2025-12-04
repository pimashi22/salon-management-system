import { notifyLKService } from './services/SMSService';
import { logger } from './utils/logger';

async function testNotifyLK() {
  logger.info('Testing Notify.lk API...');
  
  // Test account status first
  const status = await notifyLKService.checkAccountStatus();
  logger.info('Account status:', status);
  
  if (status) {
    // Test sending SMS
    const result = await notifyLKService.sendSMS('0702136100', 'Test message from GlowBridge');
    logger.info('SMS test result:', result);
  }
}

testNotifyLK().catch(console.error);