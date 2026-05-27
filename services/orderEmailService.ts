/**
 * Email Service for sending order/lead emails via the /api/send-email serverless function.
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

const INR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const origin = () => (typeof window !== 'undefined' ? window.location.origin : 'https://igonursery.com');

// ─── Shared layout helpers ────────────────────────────────────────────────────

const emailWrap = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#f4f7f4;font-family:'Inter',Arial,sans-serif;">
${content}
</body>
</html>`;

const emailHeader = (emoji: string, title: string, subtitle: string) => `
<div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#2d7a2d 0%,#4caf50 100%);padding:36px 40px;text-align:center;">
    <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">🌿 IGO NURSERY</div>
    <div style="font-size:13px;color:#c8e6c9;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Grow with Nature</div>
  </div>
  <div style="background:#1b5e20;padding:20px 40px;text-align:center;">
    <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0;">${emoji} ${title}</h1>
    <p style="font-size:13px;color:#a5d6a7;margin-top:6px;margin-bottom:0;">${subtitle}</p>
  </div>`;

const emailFooter = () => `
  <div style="background:#f9fdf9;padding:28px 40px;text-align:center;border-top:1px solid #e8f5e9;">
    <div style="margin-bottom:14px;">
      <a href="https://www.instagram.com/igoagritechfarms/" style="display:inline-block;margin:0 6px;font-size:12px;color:#4caf50;text-decoration:none;border:1px solid #c8e6c9;border-radius:20px;padding:4px 14px;">Instagram</a>
      <a href="https://www.facebook.com/IGOAgriTechfarms/" style="display:inline-block;margin:0 6px;font-size:12px;color:#4caf50;text-decoration:none;border:1px solid #c8e6c9;border-radius:20px;padding:4px 14px;">Facebook</a>
      <a href="https://wa.me/919444444444" style="display:inline-block;margin:0 6px;font-size:12px;color:#4caf50;text-decoration:none;border:1px solid #c8e6c9;border-radius:20px;padding:4px 14px;">WhatsApp</a>
    </div>
    <p style="font-size:12px;color:#aaa;line-height:1.8;margin:0;">
      © ${new Date().getFullYear()} IGO Nursery. All rights reserved.<br/>
      ECR Road, Muttukadu, Chennai 603112<br/>
      <a href="mailto:igonursery@gmail.com" style="color:#4caf50;text-decoration:none;">igonursery@gmail.com</a>
      &nbsp;·&nbsp;
      <a href="${origin()}" style="color:#4caf50;text-decoration:none;">www.igonursery.com</a>
    </p>
  </div>
</div>`;

const infoBox = (rows: Array<[string, string]>) => `
<div style="background:#f0faf0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
  ${rows.map(([label, value], i) => `
  <div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0;${i < rows.length - 1 ? 'border-bottom:1px solid #e0f2e0;' : ''}">
    <span style="color:#777;">${label}</span>
    <span style="color:#1a1a1a;font-weight:600;">${value}</span>
  </div>`).join('')}
</div>`;

const orderTracker = (activeStep: number) => {
  const steps = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;">`;
  steps.forEach((step, i) => {
    const done = i <= activeStep;
    html += `
    <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
      <div style="width:18px;height:18px;border-radius:50%;background:${done ? '#4caf50' : '#ddd'};border:3px solid ${done ? '#4caf50' : '#ddd'};"></div>
      <div style="font-size:11px;color:${done ? '#4caf50' : '#bbb'};font-weight:600;margin-top:8px;text-align:center;">${step}</div>
    </div>`;
    if (i < steps.length - 1) {
      html += `<div style="flex:1;height:3px;background:${i < activeStep ? '#4caf50' : '#e0e0e0'};margin-top:-18px;"></div>`;
    }
  });
  html += `</div>`;
  return html;
};

const productList = (items: Array<{ name: string; quantity: number; price: number }>) =>
  items.map(item => `
  <div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid #f0f0f0;">
    <div style="width:70px;height:70px;border-radius:10px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0;">🌿</div>
    <div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">${item.name}</div>
      <div style="font-size:12px;color:#888;margin-bottom:6px;">Qty: ${item.quantity}</div>
      <div style="font-size:14px;font-weight:700;color:#2d7a2d;">${INR(item.price * item.quantity)}</div>
    </div>
  </div>`).join('');

const priceSummary = (subtotal: number, tax: number, delivery: number, total: number) => `
<div style="background:#fafafa;border-radius:12px;padding:20px 24px;margin-top:24px;">
  <div style="display:flex;justify-content:space-between;font-size:14px;padding:7px 0;color:#555;">
    <span>Subtotal</span><span>${INR(subtotal)}</span>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:14px;padding:7px 0;color:#555;">
    <span>Tax (5%)</span><span>${INR(tax)}</span>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:14px;padding:7px 0;color:#555;">
    <span>Delivery</span><span>${delivery === 0 ? 'FREE' : INR(delivery)}</span>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#1a1a1a;border-top:2px solid #e8f5e9;margin-top:8px;padding-top:14px;">
    <span>Grand Total</span><span>${INR(total)}</span>
  </div>
</div>`;

const ctaButton = (label: string, url: string) => `
<div style="text-align:center;margin:36px 0 20px;">
  <a href="${url}" style="display:inline-block;background:#2d7a2d;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 40px;border-radius:50px;letter-spacing:0.5px;">${label}</a>
</div>`;

// ─── Email builders ───────────────────────────────────────────────────────────

const buildOrderConfirmationHtml = (data: EmailData): string => {
  const estDate = new Date(data.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const trackUrl = `${origin()}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}`;
  const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = data.total - subtotal - tax;

  return emailWrap(`
${emailHeader('🎉', 'Order Confirmed!', 'Thank you for shopping with IGO Nursery')}
<div style="padding:36px 40px;">
  <p style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Hi ${data.customerName},</p>
  <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">
    Your order has been successfully placed. We're preparing it with care and will keep you updated at every step. 🌱
  </p>
  ${orderTracker(0)}
  <p style="font-size:13px;font-weight:700;color:#2d7a2d;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Order Details</p>
  ${infoBox([
    ['Order ID', `#${data.orderNumber}`],
    ['Expected Delivery', estDate],
    ['Tracking Number', data.trackingNumber],
  ])}
  <p style="font-size:13px;font-weight:700;color:#2d7a2d;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">Your Order</p>
  ${productList(data.items)}
  ${priceSummary(subtotal, tax, delivery, data.total)}
  ${ctaButton('TRACK YOUR ORDER →', trackUrl)}
  <p style="font-size:13px;color:#999;text-align:center;">
    Questions? <a href="mailto:igonursery@gmail.com" style="color:#4caf50;text-decoration:none;">igonursery@gmail.com</a>
  </p>
</div>
${emailFooter()}`);
};

const buildOrderShippedHtml = (data: EmailData): string => {
  const estDate = new Date(data.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const trackUrl = `${origin()}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}`;

  return emailWrap(`
${emailHeader('🚚', 'Your Order is On Its Way!', 'Your plants are heading to your doorstep')}
<div style="padding:36px 40px;">
  <p style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Hi ${data.customerName},</p>
  <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">
    Great news! Your order has been <strong style="color:#2d7a2d;">shipped</strong> and is on its way. Get ready to welcome your green companions! 🌿
  </p>
  ${orderTracker(2)}
  <p style="font-size:13px;font-weight:700;color:#2d7a2d;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Shipment Details</p>
  ${infoBox([
    ['Order ID', `#${data.orderNumber}`],
    ['Tracking Number', data.trackingNumber],
    ['Estimated Delivery', estDate],
  ])}
  ${ctaButton('TRACK MY ORDER →', trackUrl)}
  <p style="font-size:13px;color:#999;text-align:center;">
    Questions? <a href="mailto:igonursery@gmail.com" style="color:#4caf50;text-decoration:none;">igonursery@gmail.com</a>
  </p>
</div>
${emailFooter()}`);
};

const buildOrderStatusUpdateHtml = (customerName: string, orderNumber: string, status: string): string => {
  const trackUrl = `${origin()}/customer-profile/orders`;
  const statusColor = status === 'cancelled' ? '#e53935' : status === 'delivered' ? '#2d7a2d' : '#1565c0';

  let emoji = '📢';
  let title = 'Order Status Update';
  let message = 'There has been an update to your order.';

  if (status === 'confirmed') {
    emoji = '✅';
    title = 'Order Confirmed';
    message = 'Your order has been confirmed and we are getting it ready for you!';
  } else if (status === 'picked') {
    emoji = '🪴';
    title = 'Plants Picked';
    message = 'Our garden experts have carefully hand-picked the best plants for your order!';
  } else if (status === 'packed') {
    emoji = '📦';
    title = 'Order Packed';
    message = 'Your order is packed securely and is waiting to be shipped!';
  } else if (status === 'shipped') {
    emoji = '🚚';
    title = 'Order Shipped';
    message = 'Your order is on the way!';
  } else if (status === 'delivered') {
    emoji = '🎉';
    title = 'Order Delivered';
    message = 'Your order has been delivered. Happy gardening!';
  } else if (status === 'cancelled') {
    emoji = '❌';
    title = 'Order Cancelled';
    message = 'Your order has been cancelled.';
  }

  return emailWrap(`
${emailHeader(emoji, title, `Order #${orderNumber}`)}
<div style="padding:36px 40px;">
  <p style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Hi ${customerName},</p>
  <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">
    ${message}
  </p>
  ${infoBox([
    ['Order ID', `#${orderNumber}`],
    ['New Status', `<span style="color:${statusColor};font-weight:800;">${status.toUpperCase()}</span>`],
  ])}
  ${ctaButton('VIEW MY ORDER →', trackUrl)}
  <p style="font-size:13px;color:#999;text-align:center;">
    Questions? <a href="mailto:igonursery@gmail.com" style="color:#4caf50;text-decoration:none;">igonursery@gmail.com</a>
  </p>
</div>
${emailFooter()}`);
};

const buildAdminNewOrderHtml = (data: EmailData): string =>
  emailWrap(`
${emailHeader('🚀', 'New Order Received!', 'Action required — process this order')}
<div style="padding:36px 40px;">
  <p style="font-size:14px;color:#555;line-height:1.7;margin-bottom:20px;">
    A new order has been placed by <strong>${data.customerName}</strong> (${data.to}).
  </p>
  ${infoBox([
    ['Order ID', `#${data.orderNumber}`],
    ['Grand Total', INR(data.total)],
  ])}
  <p style="font-size:13px;font-weight:700;color:#2d7a2d;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">Order Items</p>
  ${productList(data.items)}
  ${ctaButton('OPEN ADMIN PANEL →', `${origin()}/admin-orders`)}
</div>
${emailFooter()}`);

const buildLeadUpdateHtml = (lead: Lead, status: string, note?: string): string => {
  const dashboardUrl = `${origin()}/customer-profile`;
  const statusColor = status === 'rejected' ? '#b71c1c' : status === 'approved' || status === 'resolved' ? '#2d7a2d' : '#1565c0';
  const badgeBg = status === 'rejected' ? '#fce4ec' : status === 'approved' || status === 'resolved' ? '#e8f5e9' : '#e3f2fd';
  const requestRef = lead.id.substring(lead.id.length - 8).toUpperCase();

  return emailWrap(`
${emailHeader('📋', 'Important Update for You', 'A message from the IGO Nursery team')}
<div style="padding:36px 40px;">
  <p style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Hi ${lead.customerName},</p>
  <span style="display:inline-block;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;background:${badgeBg};color:${statusColor};">
    ${lead.type.toUpperCase()} REQUEST
  </span>
  <div style="background:#f9f9f9;border-left:4px solid ${statusColor};border-radius:8px;padding:20px 24px;margin-bottom:28px;font-size:14px;color:#444;line-height:1.8;">
    <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">New Status</div>
    <div style="font-size:20px;font-weight:800;color:${statusColor};">${status.toUpperCase()}</div>
    ${note ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #eee;color:#555;">${note}</div>` : ''}
  </div>
  ${infoBox([
    ['Request Reference', `#${requestRef}`],
    ['Request Type', lead.type.toUpperCase()],
    ['Updated Status', `<span style="color:${statusColor};font-weight:800;">${status.toUpperCase()}</span>`],
  ])}
  <div style="background:#4a1020;border-radius:12px;padding:20px 24px;margin-bottom:24px;color:#ffffff;">
    <h3 style="font-size:15px;font-weight:700;color:#ffcc02;margin-bottom:10px;">⚠️ Scam Alert: Beware of Fraudulent Activities!</h3>
    <p style="font-size:13px;line-height:1.7;color:#f8d7da;margin-bottom:10px;">We will never ask for OTPs, payments through links, or offer free gifts over phone/chat.</p>
    <p style="font-size:13px;color:#f8d7da;">Stay safe — Team IGO Nursery</p>
  </div>
  ${ctaButton('VIEW IN DASHBOARD →', dashboardUrl)}
  <p style="font-size:13px;color:#999;text-align:center;">
    Questions? <a href="mailto:igonursery@gmail.com" style="color:#4caf50;text-decoration:none;">igonursery@gmail.com</a>
  </p>
</div>
${emailFooter()}`);
};

// ─── Private send helper ──────────────────────────────────────────────────────

const persistEmailLog = (to: string, subject: string, html: string) => {
  try {
    const logs = JSON.parse(localStorage.getItem('igo_simulated_emails') || '[]');
    logs.unshift({ id: Date.now(), to, subject, body: html, timestamp: new Date().toISOString(), status: 'delivered', isRead: false });
    localStorage.setItem('igo_simulated_emails', JSON.stringify(logs));
    window.dispatchEvent(new StorageEvent('storage', { key: 'igo_simulated_emails' }));
  } catch { /* non-critical */ }
};

const sendEmail = async (to: string, subject: string, html: string): Promise<EmailSendResult> => {
  try {
    // Check if the customer has opted out of emails (don't check admin email)
    if (to !== 'igonursery@gmail.com') {
      try {
        const { supabase } = await import('./supabaseClient');
        const { data: customerRow } = await supabase
          .from('customers')
          .select('email_notifications')
          .eq('email', to)
          .maybeSingle();
        
        if (customerRow && customerRow.email_notifications === false) {
          console.log(`🚫 Email skipped for ${to} (User opted out)`);
          return { success: true, mode: 'logged', message: 'User opted out of emails.' };
        }
      } catch (dbError) {
        // Ignore DB errors (e.g. column doesn't exist) and proceed with sending
        console.warn('Could not check email preferences:', dbError);
      }
    }

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    persistEmailLog(to, subject, html);
    return { success: true, mode: 'api', message: 'Email sent via Resend.' };
  } catch (err) {
    console.error('[sendEmail] failed:', err);
    persistEmailLog(to, subject, html);
    return { success: false, mode: 'logged', message: 'Email API unavailable — logged locally.' };
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const sendOrderConfirmationEmail = (data: EmailData): Promise<EmailSendResult> =>
  sendEmail(data.to, `Order Confirmed #${data.orderNumber} – IGO Nursery`, buildOrderConfirmationHtml(data));

export const sendOrderShippedEmail = (data: EmailData): Promise<EmailSendResult> =>
  sendEmail(data.to, `Your Order #${data.orderNumber} Has Shipped – IGO Nursery`, buildOrderShippedHtml(data));

export const sendAdminOrderNotification = (data: EmailData): Promise<EmailSendResult> =>
  sendEmail('igonursery@gmail.com', `New Order Alert: #${data.orderNumber}`, buildAdminNewOrderHtml(data));

export const sendOrderStatusUpdateEmail = (
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
): Promise<EmailSendResult> =>
  sendEmail(
    customerEmail,
    `Your IGO Nursery Order #${orderNumber} — Status: ${status}`,
    buildOrderStatusUpdateHtml(customerName, orderNumber, status),
  );

export const sendLeadUpdateEmail = async (
  lead: Lead,
  status: string,
  note?: string,
): Promise<EmailSendResult> =>
  sendEmail(
    lead.customerEmail,
    `Update on your ${lead.type} request – IGO Nursery`,
    buildLeadUpdateHtml(lead, status, note),
  );

export const getSentEmails = () => {
  try { return JSON.parse(localStorage.getItem('sentEmails') || '[]'); } catch { return []; }
};
