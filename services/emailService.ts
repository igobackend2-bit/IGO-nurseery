/**
 * Email Service for sending order confirmations
 * In production, this would integrate with services like SendGrid, Mailgun, or AWS SES
 */

export interface EmailData {
  to: string;
  subject: string;
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  estimatedDelivery: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export const sendOrderConfirmationEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // In production, you would call your backend API here
    // For now, we'll simulate the email send
    const emailContent = `
      Order Confirmation Email
      =======================
      
      Dear ${emailData.customerName},
      
      Thank you for your order! Your order has been confirmed.
      
      Order Details:
      - Order Number: ${emailData.orderNumber}
      - Tracking Number: ${emailData.trackingNumber}
      - Estimated Delivery: ${emailData.estimatedDelivery}
      
      Items Ordered:
      ${emailData.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`).join('\n')}
      
      Total Amount: ₹${emailData.total}
      
      You can track your order at: http://localhost:3002/order-history
      
      Best regards,
      IGO Nursery Team
    `;

    // Log the email (in production, this would send actual email)
    console.log('📧 Email would be sent to:', emailData.to);
    console.log('📄 Email Content:\n', emailContent);

    // Store email in localStorage for demo purposes
    const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    sentEmails.push({
      ...emailData,
      sentAt: new Date().toISOString(),
    });
    localStorage.setItem('sentEmails', JSON.stringify(sentEmails));

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const getSentEmails = () => {
  try {
    return JSON.parse(localStorage.getItem('sentEmails') || '[]');
  } catch {
    return [];
  }
};
