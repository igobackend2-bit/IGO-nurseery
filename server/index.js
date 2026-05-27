/**
 * IGO Nursery — Backend Email Server
 * Powered by Resend (https://resend.com)
 * Handles all transactional emails: OTP, Order Confirmation, Shipped, Delivered, Admin alerts
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env.local manually (no dotenv dependency needed) ─────────────────
const envPath = resolve(__dirname, '../.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
}

const PORT            = process.env.API_PORT || 4000;
const RESEND_KEY      = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL || 'igonursery@gmail.com';
const FROM_EMAIL      = process.env.FROM_EMAIL || 'IGO Nursery <noreply@igonursery.com>';
const SUPABASE_URL    = process.env.SUPABASE_URL || '';
const SUPABASE_SRK    = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ─── Supabase Admin client (lazy-loaded) ─────────────────────────────────────
let _supabaseAdmin = null;
async function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;
  const { createClient } = await import('@supabase/supabase-js');
  _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SRK, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return _supabaseAdmin;
}

// ─── Resend helper ───────────────────────────────────────────────────────────
async function sendViaResend({ to, subject, html, text }) {
  if (!RESEND_KEY || RESEND_KEY === 're_PASTE_YOUR_KEY_HERE') {
    console.warn('⚠️  RESEND_API_KEY not set — email not sent (logged only)');
    return { id: 'mock-' + Date.now(), mocked: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || undefined,
      text: text || undefined,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Resend API error');
  return data;
}

// ─── Email HTML builders ─────────────────────────────────────────────────────
const G  = '#2d7a2d';
const DG = '#1b5e20';

function wrap(body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;}</style>
  </head><body>${body}</body></html>`;
}

function emailHeader(title, subtitle) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
  <tr><td style="background:linear-gradient(135deg,${DG},${G},#4caf50);padding:36px 40px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:2px;">🌿 IGO NURSERY</div>
    <div style="font-size:11px;color:#a5d6a7;letter-spacing:3px;margin-top:4px;">GROW WITH NATURE</div>
    <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:14px 24px;margin-top:20px;display:inline-block;">
      <div style="font-size:20px;font-weight:800;color:#fff;">${title}</div>
      <div style="font-size:12px;color:#c8e6c9;margin-top:4px;">${subtitle}</div>
    </div>
  </td></tr>`;
}

function emailFooter() {
  return `
  <tr><td style="background:#f5fbf5;border-top:2px solid #e0f0e0;padding:28px 40px;text-align:center;">
    <div style="margin-bottom:14px;">
      <a href="https://www.instagram.com/igoagritechfarms/" style="display:inline-block;margin:0 6px;background:#e1306c;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:7px 16px;border-radius:20px;">Instagram</a>
      <a href="https://www.facebook.com/IGOAgriTechfarms/" style="display:inline-block;margin:0 6px;background:#1877F2;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:7px 16px;border-radius:20px;">Facebook</a>
      <a href="https://wa.me/919444444444" style="display:inline-block;margin:0 6px;background:#25D366;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:7px 16px;border-radius:20px;">WhatsApp</a>
    </div>
    <div style="font-size:11px;color:#bbb;line-height:1.9;">
      © ${new Date().getFullYear()} IGO Nursery. All rights reserved.<br/>
      📧 <a href="mailto:${ADMIN_EMAIL}" style="color:${G};text-decoration:none;">${ADMIN_EMAIL}</a> &nbsp;|&nbsp;
      🌐 <a href="https://igonursery.com" style="color:${G};text-decoration:none;">igonursery.com</a><br/>
      <a href="#" style="color:${G};">Unsubscribe</a> &middot; <a href="#" style="color:${G};">Privacy Policy</a>
    </div>
  </td></tr>
  </table></td></tr></table>`;
}

function tracker(activeStep) {
  const steps = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const dots = steps.map((s, i) => {
    const on = i <= activeStep;
    const line = i < steps.length - 1
      ? `<td style="padding-bottom:18px;"><div style="height:3px;background:${on && i < activeStep ? G : '#ddd'};border-radius:2px;"></div></td>`
      : '';
    return `<td align="center">
      <div style="width:18px;height:18px;border-radius:50%;background:${on ? G : '#e0e0e0'};margin:0 auto;"></div>
      <div style="font-size:10px;color:${on ? G : '#bbb'};font-weight:${i === activeStep ? '700' : '500'};margin-top:6px;text-align:center;">${s}</div>
    </td>${line}`;
  }).join('');
  return `<tr><td style="padding:20px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fbf5;border-radius:12px;padding:16px;">
      <tr>${dots}</tr>
    </table>
  </td></tr>`;
}

function infoBox(rows) {
  const rowHtml = rows.map(([label, val], i) =>
    `<tr style="border-top:${i > 0 ? '1px solid #e0f0e0' : 'none'};">
      <td style="padding:8px 16px;font-size:13px;color:#777;">${label}</td>
      <td style="padding:8px 16px;font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">${val}</td>
    </tr>`
  ).join('');
  return `<tr><td style="padding:0 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fbf5;border-radius:12px;">${rowHtml}</table>
  </td></tr>`;
}

function productRows(items) {
  return (items || []).map(item => `
    <tr style="border-top:1px solid #f0f0f0;">
      <td style="padding:14px 16px;">
        <span style="font-size:22px;">🌿</span>
        <span style="font-size:13px;font-weight:600;color:#1a1a1a;margin-left:10px;">${item.name || item.productName || 'Plant'}</span>
        ${item.variant ? `<div style="font-size:11px;color:#999;margin-left:32px;">${item.variant}</div>` : ''}
      </td>
      <td style="padding:14px 16px;text-align:center;font-size:13px;color:#555;">×${item.quantity || item.qty || 1}</td>
      <td style="padding:14px 16px;text-align:right;font-size:13px;font-weight:700;color:${G};">₹${((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(2)}</td>
    </tr>`).join('');
}

function ctaButton(label, url, color) {
  return `<tr><td align="center" style="padding:24px 40px 12px;">
    <a href="${url}" style="display:inline-block;background:${color || `linear-gradient(135deg,${DG},${G})`};color:#fff;text-decoration:none;font-size:14px;font-weight:800;padding:14px 44px;border-radius:50px;box-shadow:0 6px 20px rgba(45,122,45,0.35);">${label}</a>
  </td></tr>`;
}

// ─── Build email HTML per type ───────────────────────────────────────────────
function buildOtpEmail({ name, otp }) {
  return wrap(`
    ${emailHeader('🔐 Verify Your Account', 'One-Time Password')}
    <tr><td style="padding:36px 40px;text-align:center;">
      <p style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Hello, ${name || 'Valued Customer'}!</p>
      <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">Use the OTP below to verify your IGO Nursery account.<br/><strong>Do not share this with anyone.</strong></p>
      <div style="display:inline-block;background:#f0faf0;border:2px dashed ${G};border-radius:16px;padding:24px 52px;margin-bottom:24px;">
        <div style="font-size:11px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Your OTP Code</div>
        <div style="font-size:48px;font-weight:900;color:${DG};letter-spacing:12px;">${otp}</div>
        <div style="font-size:13px;color:#e53935;margin-top:10px;font-weight:600;">⏱ Valid for 10 minutes only</div>
      </div>
      <div style="background:#fff8e1;border-left:4px solid #ffc107;border-radius:8px;padding:14px 20px;text-align:left;font-size:13px;color:#5d4037;line-height:1.7;max-width:480px;margin:0 auto;">
        <strong style="display:block;color:#e65100;margin-bottom:4px;">⚠️ Security Notice</strong>
        IGO Nursery will never ask for your OTP via call, chat, or email. If you did not request this, contact us immediately.
      </div>
    </td></tr>
    ${emailFooter()}
  `);
}

function buildOrderConfirmEmail({ customerName, orderId, orderDate, paymentMethod, address, expectedDelivery, items, subtotal, tax, shipping, discount, total }) {
  return wrap(`
    ${emailHeader('🎉 Order Confirmed!', 'Thank you for shopping with IGO Nursery')}
    <tr><td style="padding:28px 40px 0;">
      <p style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Hi ${customerName || 'Valued Customer'},</p>
      <p style="font-size:14px;color:#666;line-height:1.8;">Your order has been successfully placed and is being carefully prepared. We'll notify you at every step! 🌱</p>
    </td></tr>
    ${tracker(0)}
    <tr><td style="padding:0 40px 8px;font-size:11px;font-weight:700;color:${G};letter-spacing:2px;text-transform:uppercase;">Order Details</td></tr>
    ${infoBox([
      ['Order ID', `#${orderId}`],
      ['Order Date', orderDate || new Date().toLocaleDateString('en-IN')],
      ['Payment', paymentMethod || 'Paid'],
      ['Shipping To', address || '—'],
      ['Expected Delivery', expectedDelivery || '3–5 business days'],
    ])}
    <tr><td style="padding:0 40px 8px;font-size:11px;font-weight:700;color:${G};letter-spacing:2px;text-transform:uppercase;">Your Items</td></tr>
    <tr><td style="padding:0 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0f0e0;border-radius:12px;overflow:hidden;">
        <tr style="background:#f5fbf5;">
          <th style="padding:10px 16px;font-size:11px;color:${DG};text-align:left;">Item</th>
          <th style="padding:10px 16px;font-size:11px;color:${DG};text-align:center;">Qty</th>
          <th style="padding:10px 16px;font-size:11px;color:${DG};text-align:right;">Price</th>
        </tr>
        ${productRows(items)}
      </table>
    </td></tr>
    <tr><td style="padding:0 40px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #eee;border-radius:12px;">
        <tr><td style="padding:8px 16px;font-size:13px;color:#666;">Subtotal</td><td style="padding:8px 16px;font-size:13px;color:#333;text-align:right;">₹${subtotal || '—'}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#666;">Tax (5%)</td><td style="padding:8px 16px;font-size:13px;color:#333;text-align:right;">₹${tax || '—'}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#666;">Shipping</td><td style="padding:8px 16px;font-size:13px;color:${G};font-weight:700;text-align:right;">${shipping || 'FREE'}</td></tr>
        ${discount ? `<tr><td style="padding:8px 16px;font-size:13px;color:#666;">Discount</td><td style="padding:8px 16px;font-size:13px;color:#e53935;text-align:right;">−₹${discount}</td></tr>` : ''}
        <tr style="border-top:2px solid #e0f0e0;"><td style="padding:12px 16px;font-size:15px;font-weight:800;color:#1a1a1a;">Grand Total</td><td style="padding:12px 16px;font-size:16px;font-weight:900;color:${DG};text-align:right;">₹${total}</td></tr>
      </table>
    </td></tr>
    ${ctaButton('TRACK YOUR ORDER →', 'https://igonursery.com/track-order')}
    ${emailFooter()}
  `);
}

function buildShippedEmail({ customerName, orderId, awb, courier, shippedOn, expectedDelivery, address, items }) {
  return wrap(`
    ${emailHeader('🚚 Your Order is On Its Way!', 'Happiness is coming your way')}
    <tr><td style="padding:28px 40px 0;">
      <p style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Hi ${customerName || 'Valued Customer'},</p>
      <p style="font-size:14px;color:#666;line-height:1.8;">Your order <strong>#${orderId}</strong> has been handed to <strong>${courier || 'our courier'}</strong> and is in transit. 🌿</p>
    </td></tr>
    ${tracker(2)}
    <tr><td style="padding:0 40px 8px;font-size:11px;font-weight:700;color:${G};letter-spacing:2px;text-transform:uppercase;">Shipment Details</td></tr>
    ${infoBox([
      ['Order ID', `#${orderId}`],
      ['AWB / Tracking No.', awb || '—'],
      ['Courier Partner', courier || '—'],
      ['Shipped On', shippedOn || new Date().toLocaleDateString('en-IN')],
      ['Expected Delivery', expectedDelivery || '—'],
      ['Shipping To', address || '—'],
    ])}
    <tr><td style="padding:0 40px 8px;font-size:11px;font-weight:700;color:${G};letter-spacing:2px;text-transform:uppercase;">Items Shipped</td></tr>
    <tr><td style="padding:0 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0f0e0;border-radius:12px;overflow:hidden;">
        ${productRows(items)}
      </table>
    </td></tr>
    ${ctaButton('TRACK YOUR ORDER →', 'https://igonursery.com/track-order')}
    ${emailFooter()}
  `);
}

function buildOutForDeliveryEmail({ customerName, orderId, awb, courier, address, expectedTime, items }) {
  return wrap(`
    ${emailHeader('🏍️ Out for Delivery!', 'Your order arrives today')}
    <tr><td style="padding:28px 40px 0;">
      <p style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Hi ${customerName || 'Valued Customer'},</p>
      <p style="font-size:14px;color:#666;line-height:1.8;">Your order <strong>#${orderId}</strong> is <strong style="color:#ff6f00;">out for delivery</strong> and will arrive within a few hours. Please keep your phone reachable! 📍</p>
    </td></tr>
    ${tracker(3)}
    <tr><td style="padding:0 40px 20px;">
      <div style="background:#fff8f0;border-left:5px solid #ff6f00;border-radius:10px;padding:14px 20px;font-size:13px;color:#e65100;line-height:1.7;">
        📍 <strong>Delivery agent is on the way!</strong><br/>Make sure someone is available at the delivery address.
      </div>
    </td></tr>
    ${infoBox([
      ['Order ID', `#${orderId}`],
      ['Courier', courier || '—'],
      ['AWB No.', awb || '—'],
      ['Delivering To', address || '—'],
      ['Expected By', expectedTime || 'Today'],
    ])}
    ${ctaButton('TRACK LIVE →', 'https://igonursery.com/track-order', 'linear-gradient(135deg,#e65100,#ff9800)')}
    ${emailFooter()}
  `);
}

function buildDeliveredEmail({ customerName, orderId, deliveryDate, items, reviewUrl }) {
  return wrap(`
    ${emailHeader('✅ Order Delivered!', 'We hope you love your plants 🌱')}
    <tr><td style="padding:28px 40px 0;">
      <p style="font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Hi ${customerName || 'Valued Customer'},</p>
      <p style="font-size:14px;color:#666;line-height:1.8;">Your order <strong>#${orderId}</strong> was delivered on <strong>${deliveryDate || new Date().toLocaleDateString('en-IN')}</strong>. Happy growing! 🏡</p>
    </td></tr>
    ${tracker(4)}
    <tr><td style="padding:20px 40px;">
      <div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:16px;padding:24px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">🏡</div>
        <div style="font-size:20px;font-weight:800;color:${DG};">Delivered on ${deliveryDate || 'Today'}</div>
        <div style="font-size:13px;color:#666;margin-top:6px;">Order #${orderId}</div>
      </div>
    </td></tr>
    <tr><td style="padding:0 40px 24px;">
      <div style="background:#fffde7;border:1px solid #fff9c4;border-radius:14px;padding:24px;text-align:center;">
        <div style="font-size:28px;letter-spacing:4px;margin-bottom:10px;">⭐⭐⭐⭐⭐</div>
        <div style="font-size:15px;font-weight:700;color:#f57f17;margin-bottom:6px;">Loving your plants? Rate us!</div>
        <div style="font-size:13px;color:#777;margin-bottom:16px;">Your feedback helps us grow and serve you better.</div>
        <a href="${reviewUrl || 'https://igonursery.com/review'}" style="display:inline-block;background:#f57f17;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 28px;border-radius:50px;">WRITE A REVIEW</a>
      </div>
    </td></tr>
    ${ctaButton('SHOP AGAIN →', 'https://igonursery.com/store')}
    ${emailFooter()}
  `);
}

function buildAdminNewOrderEmail({ customerName, customerEmail, orderId, total, items }) {
  return wrap(`
    ${emailHeader('🚀 New Order Received!', 'Action required — process this order')}
    <tr><td style="padding:28px 40px 0;">
      <p style="font-size:14px;color:#555;line-height:1.8;">A new order has been placed by <strong>${customerName}</strong> (${customerEmail}).</p>
    </td></tr>
    ${infoBox([
      ['Order ID', `#${orderId}`],
      ['Customer', customerName],
      ['Email', customerEmail],
      ['Grand Total', `₹${total}`],
    ])}
    <tr><td style="padding:0 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0f0e0;border-radius:12px;overflow:hidden;">
        <tr style="background:#f5fbf5;"><th style="padding:10px 16px;font-size:11px;color:${DG};text-align:left;">Item</th><th style="padding:10px 16px;font-size:11px;color:${DG};text-align:center;">Qty</th><th style="padding:10px 16px;font-size:11px;color:${DG};text-align:right;">Price</th></tr>
        ${productRows(items)}
      </table>
    </td></tr>
    ${ctaButton('OPEN ADMIN PANEL →', 'https://igonursery.com/admin')}
    ${emailFooter()}
  `);
}

// ─── Request router ──────────────────────────────────────────────────────────
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url || '';
  const method = req.method;

  // ── Health check ────────────────────────────────────────────────────────
  if (url === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', resend: !!RESEND_KEY && RESEND_KEY !== 're_PASTE_YOUR_KEY_HERE' }));
  }

  if (method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  const body = await parseBody(req);

  try {
    let emailResult;

    // ── OTP / Verification ───────────────────────────────────────────────
    if (url === '/api/emails/otp') {
      const html = buildOtpEmail(body);
      emailResult = await sendViaResend({
        to: body.to,
        subject: `${body.otp} is your IGO Nursery OTP`,
        html,
      });
    }

    // ── Order Confirmation ───────────────────────────────────────────────
    else if (url === '/api/emails/order-confirmation') {
      const html = body.html || buildOrderConfirmEmail(body);
      emailResult = await sendViaResend({
        to: body.to,
        subject: body.subject || `Order Confirmed! #${body.orderId} — IGO Nursery`,
        html,
      });

      // Also alert admin
      const adminHtml = buildAdminNewOrderEmail({
        customerName: body.customerName,
        customerEmail: body.to,
        orderId: body.orderId,
        total: body.total,
        items: body.items || [],
      });
      sendViaResend({
        to: ADMIN_EMAIL,
        subject: `🌿 New Order #${body.orderId} from ${body.customerName}`,
        html: adminHtml,
      }).catch(console.error);
    }

    // ── Order Packed ────────────────────────────────────────────────────
    else if (url === '/api/emails/order-packed') {
      const html = buildShippedEmail({ ...body, tracker: 1 });
      emailResult = await sendViaResend({
        to: body.to,
        subject: `📦 Your Order #${body.orderId} is Packed! — IGO Nursery`,
        html,
      });
    }

    // ── Order Shipped ────────────────────────────────────────────────────
    else if (url === '/api/emails/order-shipped') {
      const html = buildShippedEmail(body);
      emailResult = await sendViaResend({
        to: body.to,
        subject: `🚚 Your Order #${body.orderId} is Shipped! — IGO Nursery`,
        html,
      });
    }

    // ── Out for Delivery ─────────────────────────────────────────────────
    else if (url === '/api/emails/out-for-delivery') {
      const html = buildOutForDeliveryEmail(body);
      emailResult = await sendViaResend({
        to: body.to,
        subject: `🏍️ Your Order #${body.orderId} is Out for Delivery! — IGO Nursery`,
        html,
      });
    }

    // ── Delivered ────────────────────────────────────────────────────────
    else if (url === '/api/emails/delivered') {
      const html = buildDeliveredEmail(body);
      emailResult = await sendViaResend({
        to: body.to,
        subject: `✅ Order #${body.orderId} Delivered — IGO Nursery`,
        html,
      });
    }

    // ── Auth: Signup (generate OTP via Admin API → send via Resend) ─────
    else if (url === '/api/auth/signup') {
      const { email, password, name, phone } = body;
      if (!email || !password) throw new Error('email and password are required');

      const supabase = await getSupabaseAdmin();

      // 1. Create or fetch the user via Admin API
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { data: { name: name || '', phone: phone || '' } }
      });
      if (linkErr) throw new Error(linkErr.message);

      const otp = linkData.properties.email_otp;
      const userId = linkData.user.id;

      // 2. Ensure customer row exists in DB
      await supabase.from('customers').upsert({
        id: userId,
        email,
        name: name || '',
        phone: phone || ''
      }, { onConflict: 'id' });

      // 3. Send OTP via Resend
      const html = buildOtpEmail({ name: name || 'Valued Customer', otp });
      await sendViaResend({
        to: email,
        subject: `${otp} is your IGO Nursery verification code`,
        html,
      });

      console.log(`✅ Signup OTP sent → ${email}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'OTP sent to your email.' }));
    }

    // ── Auth: Resend OTP ─────────────────────────────────────────────────
    else if (url === '/api/auth/resend') {
      const { email, name } = body;
      if (!email) throw new Error('email is required');

      const supabase = await getSupabaseAdmin();
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
      });
      if (linkErr) throw new Error(linkErr.message);

      const otp = linkData.properties.email_otp;
      const html = buildOtpEmail({ name: name || 'Valued Customer', otp });
      await sendViaResend({
        to: email,
        subject: `${otp} is your IGO Nursery verification code`,
        html,
      });

      console.log(`✅ Resend OTP → ${email}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'New OTP sent to your email.' }));
    }

    // ── Generic / Admin update ───────────────────────────────────────────
    else if (url === '/api/emails/admin-update' || url === '/api/emails/send') {
      emailResult = await sendViaResend({
        to: body.to || ADMIN_EMAIL,
        subject: body.subject || 'IGO Nursery Update',
        html: body.html,
        text: body.text,
      });
    }

    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unknown email route' }));
    }

    console.log(`✅ Email sent → ${body.to} | Route: ${url} | ID: ${emailResult?.id}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, id: emailResult?.id, mocked: emailResult?.mocked }));

  } catch (err) {
    console.error(`❌ Email failed → ${url}:`, err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🌿 IGO Nursery Email Server running on port ${PORT}`);
  console.log(`📧 Using Resend: ${RESEND_KEY && RESEND_KEY !== 're_PASTE_YOUR_KEY_HERE' ? '✅ Configured' : '⚠️  API key not set yet'}`);
  console.log(`📬 Admin alerts → ${ADMIN_EMAIL}`);
  console.log(`🔐 Supabase Admin: ${SUPABASE_URL && SUPABASE_SRK ? '✅ Connected' : '⚠️  Not configured'}`);
  console.log(`\nRoutes ready:`);
  console.log(`  POST /api/auth/signup      ← NEW: Proxy signup OTP via Resend`);
  console.log(`  POST /api/auth/resend       ← NEW: Resend OTP via Resend`);
  console.log(`  POST /api/emails/otp`);
  console.log(`  POST /api/emails/order-confirmation`);
  console.log(`  POST /api/emails/order-shipped`);
  console.log(`  POST /api/emails/out-for-delivery`);
  console.log(`  POST /api/emails/delivered`);
  console.log(`  POST /api/emails/admin-update\n`);
});
