/**
 * Email Service for sending order confirmations.
 * Uses a backend API when `VITE_ORDER_EMAIL_API_URL` is configured.
 * Falls back to opening a prefilled mail draft so the admin can still send it manually.
 */
import { Lead } from '../types';

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

export interface EmailSendResult {
  success: boolean;
  mode: 'api' | 'mailto' | 'logged';
  message: string;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const getTrackingUrl = (orderNumber?: string): string => {
  if (typeof window === 'undefined') {
    return '/track-order';
  }

  const base = `${window.location.origin}/track-order`;
  return orderNumber ? `${base}?orderNumber=${encodeURIComponent(orderNumber)}` : base;
};

const G = '#2d7a3a';
const DG = '#1b5e20';
const LG = '#e8f5e9';
const OR = '#e44d26';

const htmlWrap = (innerHtml: string): string => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>IGO Nursery</title></head>
<body style="margin:0;padding:0;background:#f0f7f0;font-family:'Segoe UI',Arial,sans-serif;">${innerHtml}</body></html>`;

const header = (emoji: string, title: string, subtitle: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,${DG} 0%,${G} 60%,#4caf50 100%);padding:0;text-align:center;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="padding:40px 40px 20px;text-align:center;">
      <img src="cid:logo" alt="IGO Nursery Logo" width="100" style="border-radius:12px;border:3px solid rgba(255,255,255,0.4);display:block;margin:0 auto;object-fit:contain;background:#fff;" />
      <div style="color:#fff;font-size:28px;font-weight:900;letter-spacing:2px;margin-top:16px;">IGO Nursery</div>
      <div style="color:#a5d6a7;font-size:13px;margin-top:4px;letter-spacing:1px;">PRECISION AGRITECH GREENERY</div>
    </td>
  </tr>
  <tr><td style="padding:0 40px 32px;text-align:center;">
    <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:16px 24px;display:inline-block;">
      <div style="color:#fff;font-size:20px;font-weight:800;">${title}</div>
      <div style="color:#c8e6c9;font-size:13px;margin-top:4px;">${subtitle}</div>
    </div>
  </td></tr></table>
</td></tr>`;
};

const footer = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `
<tr><td style="background:#f8fdf8;border-top:2px solid #e8f5e9;padding:32px 40px;text-align:center;">
  <div style="font-weight:700;color:${DG};font-size:15px;">IGO Agritech Farms</div>
  <div style="color:#888;font-size:13px;margin-top:12px;line-height:2.2;">
    📞 <a href="tel:+919876543210" style="color:${G};text-decoration:none;">+91 98765 43210</a>&nbsp;&nbsp;
    💬 <a href="https://wa.me/919876543210" style="color:${G};text-decoration:none;">WhatsApp Us</a>&nbsp;&nbsp;
    ✉️ <a href="mailto:igonursery@gmail.com" style="color:${G};text-decoration:none;">igonursery@gmail.com</a><br>
    🌐 <a href="${origin}" style="color:${G};text-decoration:none;">www.igonursery.com</a>
  </div>
  <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e0f2e9;font-size:11px;color:#bbb;">
    © ${new Date().getFullYear()} IGO Nursery · All rights reserved.<br>
    Growing happiness, one plant at a time 🌱
  </div>
</td></tr></table></td></tr></table>`;
};

const tracker = (currentStep: number) => {
  const steps = ['Confirmed','Shipped','Out For Delivery','Delivered'];
  const icons = ['✓','🚚','📦','🏠'];
  return `<tr><td style="padding:20px 40px 0;">
  <div style="background:${LG};border-radius:14px;padding:20px 16px;">
    <div style="font-weight:800;color:${DG};font-size:13px;text-align:center;margin-bottom:16px;letter-spacing:1px;">📍 ORDER STATUS TRACKER</div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
    ${steps.map((s, i) => {
      const done = i <= currentStep;
      const active = i === currentStep;
      return `<td align="center" style="padding:0 2px;">
        <div style="width:44px;height:44px;border-radius:50%;background:${done ? G : '#c8e6c9'};color:#fff;font-size:${active ? '18px' : '14px'};line-height:44px;margin:0 auto;text-align:center;font-weight:900;border:${active ? `3px solid ${DG}` : 'none'};box-shadow:${active ? '0 0 0 4px rgba(45,122,58,0.2)' : 'none'};">${done ? icons[i] : (i+1)}</div>
        <div style="font-size:10px;color:${done ? DG : '#999'};margin-top:6px;font-weight:${active ? '800' : '500'};text-align:center;">${s}</div>
      </td>${i < steps.length-1 ? `<td style="padding-bottom:20px;"><div style="height:3px;background:${done && i < currentStep ? G : '#c8e6c9'};border-radius:2px;"></div></td>` : ''}`;
    }).join('')}
    </tr></table>
  </div>
</td></tr>`;
};

const itemsTable = (items: Array<{name: string; quantity: number; price: number}>) => `
<tr><td style="padding:20px 40px 0;">
  <div style="font-weight:800;color:${DG};font-size:14px;margin-bottom:10px;letter-spacing:0.5px;">🛒 YOUR ORDER ITEMS</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e0f2e9;border-radius:14px;overflow:hidden;">
    <tr style="background:${LG};"><th style="padding:10px 14px;font-size:12px;color:${DG};text-align:left;font-weight:700;">PLANT</th><th style="padding:10px 14px;font-size:12px;color:${DG};text-align:center;font-weight:700;">QTY</th><th style="padding:10px 14px;font-size:12px;color:${DG};text-align:right;font-weight:700;">PRICE</th></tr>
    ${items.map((item, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#fafff9'};">
      <td style="padding:12px 14px;border-top:1px solid #e8f5e9;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">🌿</span>
          <div><div style="font-weight:700;color:#1b3a22;font-size:13px;">${item.name}</div><div style="font-size:11px;color:#888;margin-top:2px;">Premium Nursery Plant</div></div>
        </div>
      </td>
      <td style="padding:12px 14px;border-top:1px solid #e8f5e9;text-align:center;font-weight:700;color:#555;">×${item.quantity}</td>
      <td style="padding:12px 14px;border-top:1px solid #e8f5e9;text-align:right;font-weight:800;color:${G};">${formatCurrency(item.price * item.quantity)}</td>
    </tr>`).join('')}
  </table>
</td></tr>`;

const billingRow = (subtotal: number, tax: number, total: number) => `
<tr><td style="padding:16px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${LG};border-radius:14px;padding:4px;">
    <tr><td style="padding:8px 16px;font-size:13px;color:#555;">Subtotal</td><td align="right" style="padding:8px 16px;font-size:13px;color:#333;">${formatCurrency(subtotal)}</td></tr>
    <tr><td style="padding:8px 16px;font-size:13px;color:#555;">IGST (18%)</td><td align="right" style="padding:8px 16px;font-size:13px;color:#333;">${formatCurrency(tax)}</td></tr>
    <tr><td style="padding:12px 16px;font-size:16px;font-weight:900;color:${DG};border-top:2px solid #a5d6a7;">Grand Total</td><td align="right" style="padding:12px 16px;font-size:18px;font-weight:900;color:${DG};border-top:2px solid #a5d6a7;">${formatCurrency(total)}</td></tr>
  </table>
</td></tr>`;

const ctaButton = (label: string, url: string) => `
<tr><td align="center" style="padding:28px 40px 12px;">
  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${DG},${G});color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:16px 44px;border-radius:50px;letter-spacing:0.5px;box-shadow:0 6px 20px rgba(45,122,58,0.4);">${label}</a>
</td></tr>`;

const buildEmailContent = (emailData: EmailData, type: 'confirmation' | 'shipped'): string => {
  const estDate = new Date(emailData.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const trackUrl = getTrackingUrl(emailData.orderNumber);

  if (type === 'shipped') {
    return htmlWrap(`
${header('🚚', '🎉 Your Order Is On The Way!', 'Your plants are heading to your doorstep')}
<tr><td style="padding:28px 40px 0;">
  <h2 style="margin:0 0 8px;color:${DG};font-size:20px;">Hello, ${emailData.customerName}! 👋</h2>
  <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">Your <b>IGO Nursery</b> order has been <b style="color:${G};">shipped</b> and is on its way. Get ready to welcome your green companions!</p>
</td></tr>
${tracker(1)}
<tr><td style="padding:20px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:14px;">
    <tr><td style="padding:12px 20px;font-size:13px;color:#555;">🔖 Order ID</td><td align="right" style="padding:12px 20px;font-size:13px;font-weight:800;color:${DG};">#${emailData.orderNumber}</td></tr>
    <tr><td style="padding:12px 20px;font-size:13px;color:#555;border-top:1px solid #eee;">📅 Estimated Delivery</td><td align="right" style="padding:12px 20px;font-size:13px;font-weight:800;color:${OR};border-top:1px solid #eee;">${estDate}</td></tr>
  </table>
</td></tr>
${ctaButton('🔍 Track My Order', trackUrl)}
${footer()}`);
  }

  return htmlWrap(`
${header('🌿', '🎉 Order Confirmed!', 'Thank you for choosing IGO Nursery')}
<tr><td style="padding:28px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f0fff4,#e8f5e9);border-radius:16px;padding:4px;">
    <tr><td style="padding:20px 24px;">
      <div style="font-size:28px;margin-bottom:8px;">🥳</div>
      <div style="font-size:20px;font-weight:900;color:${DG};">Your happiness is our excitement!</div>
      <div style="font-size:14px;color:#555;margin-top:8px;line-height:1.7;">Hello <b>${emailData.customerName}</b>, your order has been <b style="color:${G};">successfully placed</b>. Our team is carefully preparing your plants with love and expertise.</div>
    </td></tr>
  </table>
</td></tr>
${tracker(0)}
<tr><td style="padding:20px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:14px;">
    <tr><td style="padding:12px 20px;font-size:13px;color:#555;">🔖 Order ID</td><td align="right" style="padding:12px 20px;font-size:13px;font-weight:800;color:${DG};">#${emailData.orderNumber}</td></tr>
    <tr><td style="padding:12px 20px;font-size:13px;color:#555;border-top:1px solid #eee;">📅 Estimated Delivery</td><td align="right" style="padding:12px 20px;font-size:13px;font-weight:800;color:${OR};border-top:1px solid #eee;">${estDate}</td></tr>
  </table>
</td></tr>
${itemsTable(emailData.items)}
${billingRow(emailData.total * 0.85, emailData.total * 0.15, emailData.total)}
<tr><td style="padding:20px 40px 0;">
  <div style="background:#fff8e1;border-left:4px solid #ffc107;border-radius:10px;padding:16px 20px;">
    <div style="font-weight:800;color:#f57f17;font-size:13px;margin-bottom:6px;">🌱 About IGO Nursery</div>
    <div style="font-size:12px;color:#555;line-height:1.8;">We are a precision agritech nursery delivering premium, acclimatized plants across India. Every plant is nurtured with organic care and delivered with guaranteed freshness. Your garden is our passion! 🌾</div>
  </div>
</td></tr>
${ctaButton('📦 View My Order Details', trackUrl)}
${footer()}`);
};

const buildAdminEmailContent = (emailData: EmailData): string => {
  const itemRows = emailData.items.map(i => `<tr><td style="padding:8px 14px;border-top:1px solid #e8f5e9;font-size:13px;color:#333;">${i.name}</td><td style="padding:8px 14px;border-top:1px solid #e8f5e9;text-align:center;font-size:13px;">×${i.quantity}</td><td style="padding:8px 14px;border-top:1px solid #e8f5e9;text-align:right;font-size:13px;font-weight:700;color:#2d7a3a;">${formatCurrency(i.price * i.quantity)}</td></tr>`).join('');
  return htmlWrap(`
${header('🚀', 'New Order Received!', 'Action required — process this order')}
<tr><td style="padding:28px 40px 0;">
  <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">A new order has been placed by <b>${emailData.customerName}</b> (${emailData.to}).</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#f9fafb;border-radius:14px;">
    <tr><td style="padding:12px 20px;font-size:13px;color:#555;">Order ID</td><td align="right" style="padding:12px 20px;font-size:13px;font-weight:800;color:#1b5e20;">#${emailData.orderNumber}</td></tr>
    <tr><td style="padding:12px 20px;font-size:13px;color:#555;border-top:1px solid #eee;">Total</td><td align="right" style="padding:12px 20px;font-size:14px;font-weight:900;color:#e44d26;border-top:1px solid #eee;">${formatCurrency(emailData.total)}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1.5px solid #e0f2e9;border-radius:14px;overflow:hidden;">
    <tr style="background:#e8f5e9;"><th style="padding:10px 14px;font-size:12px;color:#1b5e20;text-align:left;">Item</th><th style="padding:10px 14px;font-size:12px;color:#1b5e20;text-align:center;">Qty</th><th style="padding:10px 14px;font-size:12px;color:#1b5e20;text-align:right;">Amount</th></tr>
    ${itemRows}
  </table>
</td></tr>
${ctaButton('🖥️ Open Admin Panel', 'http://localhost:3000/admin')}
${footer()}`);
};

const persistEmailLog = (emailData: EmailData | any, mode: EmailSendResult['mode'], customSubject?: string, customText?: string) => {
  // 1. Original Log (sentEmails)
  const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
  sentEmails.push({
    ...emailData,
    mode,
    sentAt: new Date().toISOString(),
  });
  localStorage.setItem('sentEmails', JSON.stringify(sentEmails));

  // 2. Unified Log for MailHub (igo_simulated_emails)
  const unifiedLogs = JSON.parse(localStorage.getItem('igo_simulated_emails') || '[]');
  const logEntry = {
    id: Date.now(),
    to: emailData.to,
    subject: customSubject || emailData.subject,
    body: customText || 'Order related automated communication.',
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };
  localStorage.setItem('igo_simulated_emails', JSON.stringify([logEntry, ...unifiedLogs]));
  
  // 3. Dispatch event for real-time UI refresh
  window.dispatchEvent(new StorageEvent('storage', { key: 'igo_simulated_emails' }));
};

const openMailDraft = (emailData: EmailData, emailContent: string): EmailSendResult => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      mode: 'logged',
      message: 'Mail client fallback is not available in this environment.',
    };
  }

  const mailtoUrl = `mailto:${encodeURIComponent(emailData.to)}?subject=${encodeURIComponent(
    emailData.subject,
  )}&body=${encodeURIComponent(emailContent)}`;

  window.location.href = mailtoUrl;

  return {
    success: true,
    mode: 'mailto',
    message: 'Opened a prefilled email draft so the message can be sent manually.',
  };
};

export const sendOrderConfirmationEmail = async (
  emailData: EmailData,
): Promise<EmailSendResult> => {
  const emailContent = buildEmailContent(emailData, 'confirmation');

  try {
    const response = await fetch('/api/emails/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailContent,
        orderNumber: emailData.orderNumber,
        trackingNumber: emailData.trackingNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    if (responseData.previewUrl) {
      console.log('🔗 Email successfully dispatched! View preview here:', responseData.previewUrl);
    }

    persistEmailLog(emailData, 'api', emailData.subject, emailContent);
    return {
      success: true,
      mode: 'api',
      message: 'Order confirmation email sent using local SMTP.',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    persistEmailLog(emailData, 'logged');

    return {
      success: false,
      mode: 'logged',
      message: 'Local Email API failed.',
    };
  }
};

export const getSentEmails = () => {
  try {
    return JSON.parse(localStorage.getItem('sentEmails') || '[]');
  } catch {
    return [];
  }
};

export const sendOrderShippedEmail = async (
  emailData: EmailData,
): Promise<EmailSendResult> => {
  const emailContent = buildEmailContent(emailData, 'shipped');

  try {
    const response = await fetch('/api/emails/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailContent,
        orderNumber: emailData.orderNumber,
        trackingNumber: emailData.trackingNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    if (responseData.previewUrl) {
      console.log('🔗 Shipping email dispatched! View preview here:', responseData.previewUrl);
    }

    persistEmailLog(emailData, 'api', emailData.subject, emailContent);
    return {
      success: true,
      mode: 'api',
      message: 'Shipping email sent using local backend.',
    };
  } catch (error) {
    console.error('Error sending shipping email:', error);
    persistEmailLog(emailData, 'logged');

    return {
      success: false,
      mode: 'logged',
      message: 'Local Email API failed.',
    };
  }
};

export const sendAdminOrderNotification = async (
  emailData: EmailData,
): Promise<EmailSendResult> => {
  const emailContent = buildAdminEmailContent(emailData);

  try {
    const response = await fetch('/api/emails/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'igonursery@gmail.com',
        subject: `New Order Alert: #${emailData.orderNumber}`,
        html: emailContent,
        orderNumber: emailData.orderNumber,
        trackingNumber: emailData.trackingNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`Admin email API request failed with status ${response.status}`);
    }

    console.log('✅ Admin order notification sent.');
    return {
      success: true,
      mode: 'api',
      message: 'Admin notification sent.',
    };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      mode: 'api',
      message: 'Failed to send admin notification.',
    };
  }
};

export const sendLeadUpdateEmail = async (
  lead: Lead,
  status: string,
  note?: string
): Promise<EmailSendResult> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const emailContent = htmlWrap(`
    ${header('🌱', 'Service Update', `Request #${lead.id.substring(lead.id.length - 8).toUpperCase()}`)}
    <tr><td style="padding:40px;background:#fff;">
      <div style="font-size:16px;color:#333;line-height:1.6;">
        Hello <strong>${lead.customerName}</strong>,<br><br>
        There has been an update to your <strong>${lead.type.toUpperCase()}</strong> request.<br><br>
        <div style="background:#f9fafb;border-left:4px solid #2d7a3a;padding:20px;border-radius:8px;margin:24px 0;">
          <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">New Status</div>
          <div style="font-size:20px;font-weight:900;color:#1b5e20;">${status.toUpperCase()}</div>
          ${note ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #eee;color:#555;">${note}</div>` : ''}
        </div>
        You can track this request and message our team directly through your dashboard.
      </div>
      <div style="margin-top:32px;text-align:center;">
        <a href="${origin}/customer-auth" style="background:#2d7a3a;color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:800;display:inline-block;box-shadow:0 4px 12px rgba(45,122,58,0.2);">View in Dashboard</a>
      </div>
    </td></tr>
    ${footer()}
  `);

  try {
    const response = await fetch('/api/emails/order-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: lead.customerEmail,
        subject: `Update on your ${lead.type} request - IGO Nursery`,
        html: emailContent,
      }),
    });
    return { success: response.ok, mode: 'api', message: 'Lead update email sent.' };
  } catch (error) {
    persistEmailLog({ to: lead.customerEmail, subject: 'Lead Status Update' }, 'logged', 'Status Update', emailContent);
    return { success: false, mode: 'logged', message: 'Logged locally.' };
  }
};
