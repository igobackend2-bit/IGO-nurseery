/**
 * IGO Nursery - Beautiful HTML Email Templates
 * Earthy green tones, botanical feel, warm and friendly tone, mobile-responsive.
 */

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const BRAND = {
  name: 'IGO Nursery',
  tagline: 'Precision AgriTech Greenery',
  website: 'http://localhost:3000',
  trackOrder: 'http://localhost:3000/track-order',
  whatsapp: 'https://wa.me/919876543210',
  phone: '+91 98765 43210',
  email: 'igonursery@gmail.com',
  logo: 'cid:logo',
  green: '#2d7a3a',
  lightGreen: '#e8f5e9',
  darkGreen: '#1b5e20',
  orange: '#e44d26',
};

const STATUS_STEPS = ['Confirmed', 'Shipped', 'Out For Delivery', 'Delivered'];

const getStatusIndex = (status) => {
  const map = { pending: 0, processing: 0, shipped: 1, out_for_delivery: 2, delivered: 3 };
  return map[status?.toLowerCase()] ?? 0;
};

const renderTracker = (status) => {
  const current = getStatusIndex(status);
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      ${STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        const bg = done ? BRAND.green : '#c8e6c9';
        const textColor = done ? '#fff' : '#666';
        const label = done && i === current ? `<b>${step}</b>` : step;
        return `
          <td align="center" style="padding:0 4px;">
            <div style="width:40px;height:40px;border-radius:50%;background:${bg};color:${textColor};font-size:18px;line-height:40px;margin:0 auto;text-align:center;">
              ${done ? '✓' : (i + 1)}
            </div>
            <div style="font-size:11px;color:${done ? BRAND.green : '#999'};margin-top:6px;font-weight:${done ? '700' : '400'};">${label}</div>
          </td>
          ${i < STATUS_STEPS.length - 1 ? `<td style="vertical-align:top;padding-top:18px;"><div style="height:3px;background:${done && i < current ? BRAND.green : '#c8e6c9'};"></div></td>` : ''}
        `;
      }).join('')}
    </tr>
  </table>`;
};

const renderItems = (items = []) =>
  items.map(item => `
  <tr>
    <td style="padding:12px 8px;border-bottom:1px solid #e0f2e9;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="56">
            <div style="width:48px;height:48px;background:#e8f5e9;border-radius:8px;text-align:center;line-height:48px;font-size:28px;">🌿</div>
          </td>
          <td style="padding-left:12px;">
            <div style="font-weight:700;color:#1b5e20;font-size:14px;">${item.name || item.product?.name || 'Plant'}</div>
            <div style="font-size:12px;color:#666;margin-top:2px;">Qty: ${item.quantity}</div>
          </td>
          <td align="right" style="font-weight:700;color:#2d7a3a;white-space:nowrap;">
            ${formatCurrency((item.price || item.product?.price || 0) * item.quantity)}
          </td>
        </tr>
      </table>
    </td>
  </tr>`).join('');

const baseLayout = (customerName, status, content, orderNumber) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>IGO Nursery - Order Update</title></head>
<body style="margin:0;padding:0;background:#f1f8f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f8f4;padding:24px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND.darkGreen},${BRAND.green});padding:36px 40px;text-align:center;">
          <!-- Logo in the empty place -->
          <div style="margin-bottom:16px;">
            <img src="${BRAND.logo}" alt="Logo" width="80" height="80" style="border-radius:16px;display:inline-block;object-fit:contain;background:#ffffff;border:4px solid rgba(255,255,255,0.2);" />
          </div>
          <div style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">${BRAND.name}</div>
          <div style="color:#a5d6a7;font-size:12px;margin-top:4px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${BRAND.tagline}</div>
        </td>
      </tr>

      <!-- GREETING -->
      <tr>
        <td style="padding:32px 40px 0;">
          <h2 style="margin:0 0 8px;color:${BRAND.darkGreen};font-size:22px;">Hello, ${customerName}! 👋</h2>
          <p style="margin:0;color:#555;font-size:15px;line-height:1.6;">${content.greeting}</p>
        </td>
      </tr>

      <!-- STATUS TRACKER -->
      <tr>
        <td style="padding:16px 40px 0;">
          <div style="background:${BRAND.lightGreen};border-radius:12px;padding:20px;">
            <div style="font-weight:700;color:${BRAND.darkGreen};font-size:14px;margin-bottom:4px;">📦 Order Tracker</div>
            ${renderTracker(status)}
          </div>
        </td>
      </tr>

      <!-- ORDER META -->
      <tr>
        <td style="padding:20px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#555;padding:4px 8px;">🔖 Order ID</td>
              <td align="right" style="font-size:13px;font-weight:700;color:${BRAND.darkGreen};padding:4px 8px;">#${orderNumber}</td>
            </tr>
            ${content.deliveryAddress ? `<tr>
              <td style="font-size:13px;color:#555;padding:4px 8px;">📍 Delivery Address</td>
              <td align="right" style="font-size:13px;color:#333;padding:4px 8px;">${content.deliveryAddress}</td>
            </tr>` : ''}
            ${content.estimatedDelivery ? `<tr>
              <td style="font-size:13px;color:#555;padding:4px 8px;">🗓️ Est. Delivery</td>
              <td align="right" style="font-size:13px;font-weight:700;color:${BRAND.orange};padding:4px 8px;">${content.estimatedDelivery}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>

      <!-- ITEMS -->
      ${content.items && content.items.length > 0 ? `
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="font-weight:700;color:${BRAND.darkGreen};font-size:15px;margin-bottom:8px;">🛒 Your Plants</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0f2e9;border-radius:10px;overflow:hidden;">
            ${renderItems(content.items)}
          </table>
        </td>
      </tr>` : ''}

      <!-- BILLING SUMMARY -->
      ${content.subtotal !== undefined ? `
      <tr>
        <td style="padding:16px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightGreen};border-radius:10px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#555;padding:3px 8px;">Subtotal</td>
              <td align="right" style="font-size:13px;color:#333;padding:3px 8px;">${formatCurrency(content.subtotal)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#555;padding:3px 8px;">IGST (18%)</td>
              <td align="right" style="font-size:13px;color:#333;padding:3px 8px;">${formatCurrency(content.tax || 0)}</td>
            </tr>
            ${content.deliveryCharge !== undefined ? `<tr>
              <td style="font-size:13px;color:#555;padding:3px 8px;">Delivery</td>
              <td align="right" style="font-size:13px;color:#333;padding:3px 8px;">${content.deliveryCharge === 0 ? 'FREE' : formatCurrency(content.deliveryCharge)}</td>
            </tr>` : ''}
            <tr>
              <td style="font-size:15px;font-weight:900;color:${BRAND.darkGreen};padding:8px 8px 3px;border-top:2px solid #a5d6a7;">Grand Total</td>
              <td align="right" style="font-size:16px;font-weight:900;color:${BRAND.darkGreen};padding:8px 8px 3px;border-top:2px solid #a5d6a7;">${formatCurrency(content.total)}</td>
            </tr>
          </table>
        </td>
      </tr>` : ''}

      <!-- CARE TIPS (for delivered) -->
      ${content.careTips ? `
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="background:#fff8e1;border-left:4px solid #ffc107;border-radius:8px;padding:16px;">
            <div style="font-weight:700;color:#f57f17;margin-bottom:8px;">🌱 Plant Care Tips</div>
            <div style="font-size:13px;color:#555;line-height:1.8;">${content.careTips}</div>
          </div>
        </td>
      </tr>` : ''}

      <!-- CTA BUTTON -->
      <tr>
        <td align="center" style="padding:28px 40px 0;">
          <a href="${BRAND.trackOrder}?orderNumber=${orderNumber}" style="display:inline-block;background:${BRAND.green};color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;">
            🔍 Track Your Order
          </a>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding:32px 40px;margin-top:24px;border-top:1px solid #e0f2e9;text-align:center;">
          <div style="font-size:13px;color:#888;line-height:2;">
            <div>📞 <a href="tel:${BRAND.phone}" style="color:${BRAND.green};text-decoration:none;">${BRAND.phone}</a></div>
            <div>💬 <a href="${BRAND.whatsapp}" style="color:${BRAND.green};text-decoration:none;">WhatsApp Us</a></div>
            <div>✉️ <a href="mailto:${BRAND.email}" style="color:${BRAND.green};text-decoration:none;">${BRAND.email}</a></div>
            <div>🌐 <a href="${BRAND.website}" style="color:${BRAND.green};text-decoration:none;">${BRAND.website}</a></div>
          </div>
          <div style="margin-top:16px;font-size:11px;color:#bbb;">© ${new Date().getFullYear()} IGO Nursery. All rights reserved.<br>You received this email because you placed an order with us.</div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

export const buildOrderConfirmedEmail = (order) => ({
  subject: `🌿 Order Confirmed! #${order.orderNumber} - IGO Nursery`,
  html: baseLayout(order.customerName, 'processing', {
    greeting: `Thank you for your order! 🎉 We've received it and our team is carefully preparing your plants for dispatch. You'll receive another update when your order ships.`,
    deliveryAddress: order.shippingAddress ? `${order.shippingAddress}, ${order.city}, ${order.state} - ${order.zipCode}` : '',
    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
  }, order.orderNumber),
});

export const buildOrderShippedEmail = (order) => ({
  subject: `🚚 Your Order #${order.orderNumber} Has Shipped! - IGO Nursery`,
  html: baseLayout(order.customerName, 'shipped', {
    greeting: `Great news! Your plants are on their way 🌿. Your order has been dispatched and is heading to you. Get ready to welcome your new green companions!`,
    deliveryAddress: order.shippingAddress ? `${order.shippingAddress}, ${order.city}, ${order.state}` : '',
    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    items: order.items,
    total: order.total,
  }, order.orderNumber),
});

export const buildOutForDeliveryEmail = (order) => ({
  subject: `📦 Out For Delivery! Order #${order.orderNumber} - IGO Nursery`,
  html: baseLayout(order.customerName, 'out_for_delivery', {
    greeting: `Your plants are almost there! 🌱 Your order is out for delivery today. Please ensure someone is available to receive the package.`,
    deliveryAddress: order.shippingAddress ? `${order.shippingAddress}, ${order.city}, ${order.state}` : '',
    items: order.items,
    total: order.total,
  }, order.orderNumber),
});

export const buildOrderDeliveredEmail = (order) => ({
  subject: `✅ Delivered! Order #${order.orderNumber} - IGO Nursery`,
  html: baseLayout(order.customerName, 'delivered', {
    greeting: `Your plants have arrived! 🎉🌿 We hope you love your new green companions. Here are some care tips to help them thrive.`,
    items: order.items,
    total: order.total,
    careTips: `
      • <b>Watering:</b> Water your plants when the top inch of soil feels dry. Avoid overwatering.<br>
      • <b>Sunlight:</b> Place in bright, indirect sunlight. Most plants thrive with 4–6 hours of light daily.<br>
      • <b>Soil:</b> Use well-draining potting mix. Repot once a year to refresh nutrients.<br>
      • <b>Fertilizing:</b> Feed with organic fertilizer once a month during the growing season.<br>
      • <b>Support:</b> Contact us anytime on WhatsApp for expert care guidance! 🌱
    `,
  }, order.orderNumber),
});

export const buildGenericStatusEmail = (order, status) => {
  if (status === 'shipped') return buildOrderShippedEmail(order);
  if (status === 'out_for_delivery') return buildOutForDeliveryEmail(order);
  if (status === 'delivered') return buildOrderDeliveredEmail(order);
  return buildOrderConfirmedEmail(order);
};
