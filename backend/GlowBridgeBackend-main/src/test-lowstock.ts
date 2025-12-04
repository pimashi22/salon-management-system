import { emailService } from './services/EmailService';
import { logger } from './utils/logger';

async function testLowStockAlert() {
  try {
    console.log('Testing low stock alert email...');
    
    const testAlertData = {
      productName: 'Test Product - Hair Serum',
      productId: 'test-product-123',
      currentStock: 3,
      lowStockThreshold: 5,
      salonName: 'GlowBridge Main Salon'
    };

    const emailSent = await emailService.sendLowStockAlert(testAlertData);
    
    if (emailSent) {
      console.log('✅ Low stock alert email sent successfully to mdinindurangana03@gmail.com');
    } else {
      console.log('❌ Failed to send low stock alert email');
    }
  } catch (error) {
    console.error('Error testing low stock alert:', error);
  }
}

// Run the test
testLowStockAlert().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});