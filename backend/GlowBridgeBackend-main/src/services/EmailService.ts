import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export interface AppointmentConfirmationData {
  customerName: string;
  customerEmail: string;
  appointmentId: string;
  serviceName: string;
  serviceDescription: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  amount: number;
  paymentType: string;
  notes?: string;
  salonName?: string;
  salonAddress?: string;
  salonPhone?: string;
}

export interface LowStockAlertData {
  productName: string;
  productId: string;
  currentStock: number;
  lowStockThreshold: number;
  salonName?: string;
}

export class EmailService {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      
      if (!apiKey) {
        logger.warn('SendGrid API key not found. Email service will be disabled.');
        return;
      }

      sgMail.setApiKey(apiKey);
      this.initialized = true;
      logger.info('SendGrid email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SendGrid email service:', error);
    }
  }

  async sendEmail(emailData: EmailTemplate): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('Email service not initialized. Skipping email send.');
      return false;
    }

    try {
      const msg = {
        to: emailData.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@glowbridge.com',
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html),
      };

      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${emailData.to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendOrderConfirmation(orderData: OrderConfirmationData): Promise<boolean> {
    try {
      const emailContent = this.generateOrderConfirmationHTML(orderData);
      
      const emailTemplate: EmailTemplate = {
        to: orderData.customerEmail,
        subject: `Order Confirmation - ${orderData.orderId}`,
        html: emailContent,
      };

      return await this.sendEmail(emailTemplate);
    } catch (error) {
      logger.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  async sendAppointmentConfirmation(appointmentData: AppointmentConfirmationData): Promise<boolean> {
    try {
      const emailContent = this.generateAppointmentConfirmationHTML(appointmentData);
      
      const emailTemplate: EmailTemplate = {
        to: appointmentData.customerEmail,
        subject: `Appointment Confirmation - ${appointmentData.serviceName}`,
        html: emailContent,
      };

      return await this.sendEmail(emailTemplate);
    } catch (error) {
      logger.error('Failed to send appointment confirmation email:', error);
      return false;
    }
  }

  async sendLowStockAlert(alertData: LowStockAlertData): Promise<boolean> {
    try {
      const emailContent = this.generateLowStockAlertHTML(alertData);
      
      const emailTemplate: EmailTemplate = {
        to: 'mdinindurangana03@gmail.com',
        subject: `🚨 Low Stock Alert - ${alertData.productName}`,
        html: emailContent,
      };

      return await this.sendEmail(emailTemplate);
    } catch (error) {
      logger.error('Failed to send low stock alert email:', error);
      return false;
    }
  }

  private generateOrderConfirmationHTML(orderData: OrderConfirmationData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
        }
        .order-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
            background-color: #f3f4f6;
            font-weight: 600;
        }
        .total-section {
            text-align: right;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
        }
        .shipping-info {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GlowBridge</div>
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase!</p>
        </div>

        <p>Dear ${orderData.customerName},</p>
        <p>We're excited to confirm that your order has been successfully placed and payment has been processed.</p>

        <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
        </div>

        <h3>Items Ordered</h3>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderData.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>Rs. ${item.price.toFixed(2)}</td>
                        <td>Rs. ${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>Rs. ${orderData.subtotal.toFixed(2)}</span>
            </div>
            ${orderData.tax ? `
            <div class="total-row">
                <span>Tax:</span>
                <span>Rs. ${orderData.tax.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row total-final">
                <span>Total:</span>
                <span>Rs. ${orderData.total.toFixed(2)}</span>
            </div>
        </div>

        <div class="shipping-info">
            <h3>Shipping Address</h3>
            <p>
                ${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}<br>
                ${orderData.shippingAddress.address}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}
            </p>
        </div>

        <div class="footer">
            <p>If you have any questions about your order, please contact us at support@glowbridge.com</p>
            <p>Thank you for choosing GlowBridge!</p>
            <p>&copy; 2024 GlowBridge. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateAppointmentConfirmationHTML(appointmentData: AppointmentConfirmationData): string {
    const appointmentDate = new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
        }
        .appointment-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .service-details {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .amount-highlight {
            background: #ecfdf5;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            border: 2px solid #10b981;
        }
        .amount-text {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
        }
        .notes-section {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        .salon-info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        .important-note {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✨ GlowBridge</div>
            <h1>Appointment Confirmed!</h1>
            <p>We're excited to see you soon</p>
        </div>

        <p>Dear ${appointmentData.customerName},</p>
        <p>Great news! Your appointment has been successfully booked. We look forward to providing you with an exceptional beauty experience.</p>

        <div class="appointment-info">
            <h3>📅 Appointment Details</h3>
            <div class="info-row">
                <span class="info-label">Appointment ID:</span>
                <span class="info-value">${appointmentData.appointmentId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${appointmentDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${appointmentData.startTime} - ${appointmentData.endTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Duration:</span>
                <span class="info-value">${appointmentData.duration}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${appointmentData.paymentType.charAt(0).toUpperCase() + appointmentData.paymentType.slice(1)}</span>
            </div>
        </div>

        <div class="service-details">
            <h3>💅 Service Information</h3>
            <h4>${appointmentData.serviceName}</h4>
            <p>${appointmentData.serviceDescription}</p>
        </div>

        <div class="amount-highlight">
            <div class="amount-text">Total Amount: Rs. ${appointmentData.amount.toFixed(2)}</div>
        </div>

        ${appointmentData.notes ? `
        <div class="notes-section">
            <h4>📝 Special Notes</h4>
            <p>${appointmentData.notes}</p>
        </div>
        ` : ''}

        ${appointmentData.salonName ? `
        <div class="salon-info">
            <h3>🏢 Salon Information</h3>
            <p><strong>${appointmentData.salonName}</strong></p>
            ${appointmentData.salonAddress ? `<p>📍 ${appointmentData.salonAddress}</p>` : ''}
            ${appointmentData.salonPhone ? `<p>📞 ${appointmentData.salonPhone}</p>` : ''}
        </div>
        ` : ''}

        <div class="important-note">
            <h4>⚠️ Important Reminders</h4>
            <ul>
                <li>Please arrive 10-15 minutes before your scheduled time</li>
                <li>Bring a valid ID for verification</li>
                <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance</li>
                <li>Late arrivals may result in reduced service time or rescheduling</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <p>Need to make changes to your appointment?</p>
            <a href="mailto:support@glowbridge.com" class="button">Contact Support</a>
        </div>

        <div class="footer">
            <p>Thank you for choosing GlowBridge for your beauty needs!</p>
            <p>If you have any questions, please contact us at <a href="mailto:support@glowbridge.com">support@glowbridge.com</a></p>
            <p>&copy; 2024 GlowBridge. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateLowStockAlertHTML(alertData: LowStockAlertData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .alert-icon {
            font-size: 48px;
            color: #dc2626;
            margin-bottom: 15px;
        }
        .alert-info {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        .product-details {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .stock-critical {
            color: #dc2626;
            font-weight: bold;
            font-size: 18px;
        }
        .action-section {
            background: #fffbeb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .urgent {
            background: #dc2626;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">🚨</div>
            <div class="logo">GlowBridge</div>
            <h1>Low Stock Alert</h1>
            <div class="urgent">URGENT ACTION REQUIRED</div>
        </div>

        <p>Dear Store Manager,</p>
        <p>This is an automated alert to notify you that one of your products has reached a critically low stock level and requires immediate attention.</p>

        <div class="alert-info">
            <h3>⚠️ Stock Alert Details</h3>
            <p><strong>Product:</strong> ${alertData.productName}</p>
            <p><strong>Current Stock:</strong> <span class="stock-critical">${alertData.currentStock} units</span></p>
            <p><strong>Alert Threshold:</strong> ${alertData.lowStockThreshold} units</p>
            <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">CRITICALLY LOW</span></p>
        </div>

        <div class="product-details">
            <h3>📦 Product Information</h3>
            <div class="info-row">
                <span class="info-label">Product ID:</span>
                <span class="info-value">${alertData.productId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Product Name:</span>
                <span class="info-value">${alertData.productName}</span>
            </div>
            ${alertData.salonName ? `
            <div class="info-row">
                <span class="info-label">Salon:</span>
                <span class="info-value">${alertData.salonName}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Current Stock Level:</span>
                <span class="info-value stock-critical">${alertData.currentStock} units</span>
            </div>
            <div class="info-row">
                <span class="info-label">Alert Date:</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
            </div>
        </div>

        <div class="action-section">
            <h3>💡 Recommended Actions</h3>
            <ul>
                <li><strong>Immediate:</strong> Check if there are pending orders for this product</li>
                <li><strong>Short-term:</strong> Contact suppliers to arrange urgent restocking</li>
                <li><strong>Long-term:</strong> Review inventory management policies for this product</li>
                <li><strong>Consider:</strong> Temporarily removing the product from public listings if stock reaches zero</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <p><strong>Need assistance with inventory management?</strong></p>
            <p>Contact our support team at <a href="mailto:support@glowbridge.com" style="color: #dc2626;">support@glowbridge.com</a></p>
        </div>

        <div class="footer">
            <p>This is an automated alert from GlowBridge Inventory Management System</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>&copy; 2024 GlowBridge. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService();