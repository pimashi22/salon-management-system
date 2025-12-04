import jsPDF from 'jspdf';

export interface ReceiptData {
  orderId: string;
  transactionId?: string;
  orderDate: string;
  customerInfo: {
    name: string;
    email: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export const generateReceipt = (receiptData: ReceiptData): void => {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Receipt - Order ${receiptData.orderId}`,
    subject: 'Purchase Receipt',
    creator: 'GlowBridge Marketplace',
  });

  // Header - Company Information
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('GlowBridge Marketplace', 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Beauty & Wellness Products', 20, 32);
  doc.text('www.glowbridge.com | support@glowbridge.com', 20, 37);
  
  // Receipt Title
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('PURCHASE RECEIPT', 20, 50);
  
  // Order Information
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  const orderInfoY = 60;
  doc.text(`Order ID: ${receiptData.orderId}`, 20, orderInfoY);
  doc.text(`Date: ${receiptData.orderDate}`, 20, orderInfoY + 6);
  if (receiptData.transactionId) {
    doc.text(`Transaction ID: ${receiptData.transactionId}`, 20, orderInfoY + 12);
  }
  doc.text(`Payment Method: ${receiptData.paymentMethod}`, 20, orderInfoY + (receiptData.transactionId ? 18 : 12));
  
  // Customer Information
  const customerInfoY = orderInfoY + 30;
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('CUSTOMER INFORMATION', 20, customerInfoY);
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Name: ${receiptData.customerInfo.name}`, 20, customerInfoY + 8);
  doc.text(`Email: ${receiptData.customerInfo.email}`, 20, customerInfoY + 14);
  
  if (receiptData.customerInfo.address) {
    doc.text(`Address: ${receiptData.customerInfo.address}`, 20, customerInfoY + 20);
    if (receiptData.customerInfo.city && receiptData.customerInfo.postalCode) {
      doc.text(`${receiptData.customerInfo.city}, ${receiptData.customerInfo.postalCode}`, 20, customerInfoY + 26);
    }
  }

  // Items Table
  const itemsTableY = customerInfoY + (receiptData.customerInfo.address ? 40 : 30);
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('ORDER DETAILS', 20, itemsTableY);

  // Manual table creation
  let currentY = itemsTableY + 10;
  
  // Table header
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(20, currentY, 150, 8, 'F'); // Header background
  
  doc.text('Item', 22, currentY + 5);
  doc.text('Qty', 98, currentY + 5, { align: 'center' });
  doc.text('Unit Price', 125, currentY + 5, { align: 'center' });
  doc.text('Total', 165, currentY + 5, { align: 'right' });
  
  currentY += 8;
  
  // Table rows
  doc.setTextColor(60, 60, 60);
  receiptData.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    
    // Alternate row colors
    if (isEven) {
      doc.setFillColor(248, 249, 250);
      doc.rect(20, currentY, 150, 8, 'F');
    }
    
    // Add text with proper alignment
    doc.text(item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name, 22, currentY + 5);
    doc.text(item.quantity.toString(), 98, currentY + 5, { align: 'center' });
    doc.text(`LKR ${item.unitPrice.toFixed(2)}`, 125, currentY + 5, { align: 'center' });
    doc.text(`LKR ${item.totalPrice.toFixed(2)}`, 165, currentY + 5, { align: 'right' });
    
    currentY += 8;
  });
  
  // Table border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(20, itemsTableY + 10, 150, currentY - (itemsTableY + 10));

  // Summary Section
  const summaryY = currentY + 10;
  const summaryX = 120;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(`LKR ${receiptData.subtotal.toFixed(2)}`, 165, summaryY, { align: 'right' });
  
  doc.text('Tax (10%):', summaryX, summaryY + 6);
  doc.text(`LKR ${receiptData.tax.toFixed(2)}`, 165, summaryY + 6, { align: 'right' });
  
  doc.text('Shipping:', summaryX, summaryY + 12);
  doc.text('FREE', 165, summaryY + 12, { align: 'right' });
  
  // Total (Bold)
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', summaryX, summaryY + 20);
  doc.text(`LKR ${receiptData.total.toFixed(2)}`, 165, summaryY + 20, { align: 'right' });

  // Footer
  const footerY = summaryY + 40;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with GlowBridge!', 20, footerY);
  doc.text('For support, contact us at support@glowbridge.com', 20, footerY + 5);
  doc.text('This is a computer-generated receipt and does not require a signature.', 20, footerY + 10);
  
  // Add a border around the receipt
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, 180, footerY + 5);

  // Save the PDF
  const fileName = `GlowBridge_Receipt_${receiptData.orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateReceiptFromOrderData = (
  orderData: {
    id: string;
    transactionId?: string;
    orderDate: string;
    items: Array<{
      productName?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount: number;
    paymentType: string;
  },
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    postalCode?: string;
  },
  cartTotal: number,
  taxAmount: number
): void => {
  const receiptData: ReceiptData = {
    orderId: orderData.id,
    transactionId: orderData.transactionId,
    orderDate: new Date(orderData.orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    customerInfo: {
      name: `${customerData.firstName} ${customerData.lastName}`,
      email: customerData.email,
      address: customerData.address,
      city: customerData.city,
      postalCode: customerData.postalCode,
    },
    items: orderData.items.map(item => ({
      name: item.productName || 'Product',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    subtotal: cartTotal,
    tax: taxAmount,
    total: orderData.totalAmount,
    paymentMethod: orderData.paymentType,
  };

  generateReceipt(receiptData);
};