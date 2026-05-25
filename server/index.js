import http from 'node:http';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { 
  buildGenericStatusEmail, 
  buildOrderConfirmedEmail, 
  BRAND 
} from './emailTemplates.js';
import {
  createAdminSession,
  createCustomer,
  createCustomerSession,
  createNotification,
  createOrder,
  deleteAdminSession,
  deleteCustomerSession,
  findAdminOrderByNumber,
  findCustomerOrderByReference,
  findCustomerOrdersByReferences,
  getAdminSession,
  getCustomerSession,
  listAdminOrders,
  listCustomerNotifications,
  listCustomerOrders,
  markNotificationAsRead,
  updateCustomerProfile,
  updateOrderStatus,
  findCustomerById,
  updateCustomerSettings,
  updateCustomerPassword,
  setCustomerResetToken,
  findCustomerByResetToken,
  clearCustomerResetToken,
  verifyCustomerPassword,
  createSalt,
  hashPassword,
  findCustomerByEmail,
  setCustomerOtp,
  verifyCustomerOtp,
  createPendingVerification,
  getPendingVerification,
  deletePendingVerification,
  deleteCustomer,
  requestCustomerDeletion,
} from './db.js';

// ... (existing imports)
import { 
  API_PORT, 
  SMTP_HOST, 
  SMTP_PORT, 
  SMTP_USER, 
  SMTP_PASS,
  ROOT_DIR
} from './config.js';

const LOGO_ATTACHMENT = {
  filename: 'igo-logo.jpg',
  path: 'https://igonursery.com/images/branding/igo-logo.jpg',
  cid: 'logo',
  contentDisposition: 'inline'
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, JSON_HEADERS);
  response.end(JSON.stringify(payload));
};

const notFound = (response) => sendJson(response, 404, { message: 'Endpoint not found.' });

const readJsonBody = async (request) => {
  // If Vercel/Middleware already parsed the body
  if (request.body !== undefined && request.body !== null) {
    if (typeof request.body === 'object') return request.body;
    try {
      return JSON.parse(request.body);
    } catch (e) {
      return {};
    }
  }

  // Fallback to reading the stream
  try {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    if (chunks.length === 0) return {};
    const rawBody = Buffer.concat(chunks).toString('utf8');
    return JSON.parse(rawBody);
  } catch (err) {
    console.error('Error reading JSON body stream:', err);
    return {};
  }
};

const getBearerToken = (request) => {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim();
};

const requireAdmin = async (request, response) => {
  const token = getBearerToken(request);
  const session = await getAdminSession(token);
  if (!session) {
    sendJson(response, 401, { message: 'Unauthorized' });
    return null;
  }

  return session;
};

const requireCustomer = async (request, response) => {
  const token = getBearerToken(request);
  const session = await getCustomerSession(token);
  if (!session) {
    sendJson(response, 401, { message: 'Unauthorized' });
    return null;
  }
  return session;
};

const isAllowedStatus = (status) =>
  ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status);

let mailTransporter = null;

const getTransporter = async () => {
  if (mailTransporter) return mailTransporter;
  
  if (SMTP_USER && SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
    console.log('📧 SMTP Transporter initialized on-demand.');
  }
  return mailTransporter;
};

export const handler = async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`);
  const { pathname: rawPathname } = requestUrl;
  
  // Normalize path: Strip trailing slash and ensure /api prefix
  let sanitized = rawPathname.replace(/\/$/, '');
  if (sanitized === '') sanitized = '/';
  
  const pathname = sanitized.startsWith('/api') ? sanitized : `/api${sanitized}`;
  
  try {
    console.log(`[${request.method}] ${rawPathname} -> Normalized: ${pathname}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    });
    response.end();
    return;
  }


    if (request.method === 'GET' && pathname === '/api/health') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/admin/login') {
      const body = await readJsonBody(request);
      if (body.password) body.password = body.password.trim();
      const session = await createAdminSession({
        email: String(body.email || '').trim(),
        password: String(body.password || ''),
      });

      if (!session) {
        sendJson(response, 401, { message: 'Invalid email or password.' });
        return;
      }

      sendJson(response, 200, session);
      return;
    }

    if (request.method === 'GET' && pathname === '/api/admin/session') {
      const session = await requireAdmin(request, response);
      if (!session) {
        return;
      }

      sendJson(response, 200, session);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/admin/logout') {
      const token = getBearerToken(request);
      if (token) {
        deleteAdminSession(token);
      }
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/admin/orders') {
      const session = await requireAdmin(request, response);
      if (!session) {
        return;
      }

      sendJson(response, 200, { orders: await listAdminOrders() });
      return;
    }

    if (request.method === 'GET' && pathname.startsWith('/api/admin/orders/')) {
      const session = await requireAdmin(request, response);
      if (!session) {
        return;
      }

      const orderNumber = decodeURIComponent(pathname.replace('/api/admin/orders/', ''));
      const order = await findAdminOrderByNumber(orderNumber);
      if (!order) {
        sendJson(response, 404, { message: 'Order not found.' });
        return;
      }

      sendJson(response, 200, { order });
      return;
    }

    if (request.method === 'PATCH' && pathname.startsWith('/api/admin/orders/')) {
      const session = await requireAdmin(request, response);
      if (!session) {
        return;
      }

      const orderNumber = decodeURIComponent(pathname.replace('/api/admin/orders/', '').replace('/status', ''));
      const body = await readJsonBody(request);
      if (!isAllowedStatus(body.status)) {
        sendJson(response, 400, { message: 'Invalid order status.' });
        return;
      }

      const existingOrder = await findAdminOrderByNumber(orderNumber);
      if (!existingOrder) {
        sendJson(response, 404, { message: 'Order not found.' });
        return;
      }

      const updatedOrder = await updateOrderStatus(orderNumber, body.status);
      
      // Re-fetch the full order to ensure all fields (including joined ones) are populated for notifications
      const fullOrder = await findAdminOrderByNumber(orderNumber);
      
      // If order is linked to a customer, create an internal notification
      if (fullOrder.customerId) {
        createNotification({
          customerId: fullOrder.customerId,
          orderNumber,
          type: body.status,
          message: body.status === 'cancelled' 
            ? `Your order #${orderNumber} has been cancelled.` 
            : `Great news! Your order #${orderNumber} is now ${body.status}.`
        });
      }

        if (mailTransporter) {
          // Only send email if notifications are enabled (check DB for linked customer)
          let shouldSendEmail = true;
          if (fullOrder.customerId) {
            const customerRef = await findCustomerById(fullOrder.customerId);
            if (customerRef && customerRef.emailNotifications === false) {
              shouldSendEmail = false;
              console.log(`🔕 Email notifications disabled for customer: ${fullOrder.customerEmail}`);
            }
          }

          if (shouldSendEmail) {
            const subject = body.status === 'cancelled' 
              ? `Update: Your order #${orderNumber} has been cancelled`
              : `Update: Your order #${orderNumber} is now ${body.status}`;

            const emailData = buildGenericStatusEmail(fullOrder, body.status);
            console.log(`✉️ Sending update email to: ${fullOrder.customerEmail}`);
            
            const transporter = await getTransporter();
            if (transporter) {
              try {
                await transporter.sendMail({
                from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
                to: fullOrder.customerEmail,
                subject: subject,
                html: emailData.html,
                attachments: [LOGO_ATTACHMENT]
              });
              console.log(`✅ Update email sent successfully to ${fullOrder.customerEmail}`);
            } catch (mailErr) {
              console.error(`❌ SMTP Error sending update to ${fullOrder.customerEmail}:`, mailErr.message);
            }
          }
        }
      }

      sendJson(response, 200, { order: fullOrder });
      return;
    }

    if (request.method === 'DELETE' && pathname.startsWith('/api/admin/customer/')) {
      const session = await requireAdmin(request, response);
      if (!session) return;

      const id = pathname.split('/').pop();
      if (!id) {
        sendJson(response, 400, { message: 'Customer ID is required.' });
        return;
      }

      const customer = await findCustomerById(id);
      if (customer) {
        deleteCustomer(id);
        
        // Send Account Deleted Email
        if (mailTransporter) {
          console.log(`✉️ Sending account deletion confirmation to ${customer.email}`);
          mailTransporter.sendMail({
            from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
            to: customer.email,
            subject: 'Your IGO Nursery Account has been Deleted',
            text: `Hello ${customer.name},\n\nAs per your request, your IGO Nursery account (${customer.email}) has been permanently deleted.\n\nYour personal data has been removed from our active systems. If you have any questions, please contact our support team.\n\nThank you for being part of IGO Nursery.\n\nBest regards,\nIGO Nursery Team`,
          }).catch(err => {
            console.error('❌ Failed to send deletion email:', err);
          });
        }
      } else {
        deleteCustomer(id);
      }

      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/orders') {
      const body = await readJsonBody(request);
      const required = [
        'id',
        'orderNumber',
        'trackingNumber',
        'accessKey',
        'customerName',
        'customerEmail',
        'customerPhone',
        'shippingAddress',
        'city',
        'state',
        'zipCode',
        'subtotal',
        'tax',
        'deliveryCharge',
        'total',
        'paymentMethod',
        'status',
        'estimatedDelivery',
      ];

      const missing = required.find((key) => body[key] === undefined || body[key] === null || body[key] === '');
      if (missing || !Array.isArray(body.items) || body.items.length === 0) {
        sendJson(response, 400, { message: 'Missing order data.' });
        return;
      }

      const order = await createOrder(body);

      // If customer is logged in, create a confirmation notification for their inbox
      if (body.customerId) {
        await createNotification({
          customerId: body.customerId,
          orderNumber: body.orderNumber,
          type: 'processing',
          message: `Successfully placed order #${body.orderNumber}. You can track its status in your inbox.`
        });
        console.log(`🔔 Confirmation notification created for customer ${body.customerId}`);
      }

      // Send Order Confirmation Email
      const transporter = await getTransporter();
      if (transporter) {
        try {
          console.log(`✉️ Sending order confirmation email to ${body.customerEmail}...`);
          const emailData = buildOrderConfirmedEmail(order);
          await transporter.sendMail({
            from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
            to: body.customerEmail,
            subject: `Order Confirmed: #${body.orderNumber}`,
            html: emailData.html,
            attachments: [LOGO_ATTACHMENT]
          });
          console.log(`✅ Order confirmation sent to ${body.customerEmail}`);
        } catch (mailErr) {
          console.error(`❌ SMTP Error sending order confirmation to ${body.customerEmail}:`, mailErr.message);
        }
      }

      sendJson(response, 201, {
        order,
        accessKey: body.accessKey,
      });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/orders/lookup') {
      const body = await readJsonBody(request);
      const references = Array.isArray(body.references) ? body.references : [];
      sendJson(response, 200, { orders: await findCustomerOrdersByReferences(references) });
      return;
    }

    if (request.method === 'GET' && pathname.startsWith('/api/orders/')) {
      const orderNumber = decodeURIComponent(pathname.replace('/api/orders/', ''));
      const accessKey = requestUrl.searchParams.get('accessKey');

      if (!accessKey) {
        sendJson(response, 400, { message: 'accessKey is required.' });
        return;
      }

      const order = await findCustomerOrderByReference(orderNumber, accessKey);
      if (!order) {
        sendJson(response, 404, { message: 'Order not found.' });
        return;
      }

      sendJson(response, 200, { order });
      return;
    }

    if (request.method === 'GET' && pathname.startsWith('/api/orders/public/')) {
      const orderNumber = decodeURIComponent(pathname.replace('/api/orders/public/', ''));
      const order = await findAdminOrderByNumber(orderNumber);
      
      if (!order) {
        sendJson(response, 404, { message: 'Order not found.' });
        return;
      }

      // Return limited data for public tracking
      const publicOrder = {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        customerName: order.customerName.split(' ')[0] + '***', // Masking name for privacy
        shippingAddress: order.city + ', ' + order.state, // Only show general location
        city: order.city,
        state: order.state,
        zipCode: '******',
        items: order.items,
        total: order.total,
        createdAt: order.createdAt,
      };

      sendJson(response, 200, { order: publicOrder });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/customer/signup') {
      const body = await readJsonBody(request);
      if (body.email) body.email = body.email.trim().toLowerCase();
      if (body.password) body.password = body.password.trim();
      // Note: do not log body here — it contains the user's password

      if (!body.email || !body.password || !body.name) {
        sendJson(response, 400, { message: 'Email, name and password are required.' });
        return;
      }

      // Pre-check if email already verified/exists
      if (await findCustomerByEmail(body.email)) {
        console.log(`❌ Signup rejected: Customer ${body.email} already exists`);
        sendJson(response, 400, { message: 'Customer with this email already exists.' });
        return;
      }

      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000).getTime();
        
        // Stateless OTP Fix: We sign the OTP into a secure cookie so Vercel doesn't lose it if DB is missing
        const crypto = await import('node:crypto');
        const payloadStr = JSON.stringify({ email: body.email, otp, expires, type: 'signup', payload: body });
        const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret').update(payloadStr).digest('hex');
        const cookieVal = Buffer.from(payloadStr).toString('base64') + '.' + signature;
        response.setHeader('Set-Cookie', `igo_otp_session=${cookieVal}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax`);
        
        console.log(`📝 Creating pending verification for ${body.email}...`);
        try {
          await createPendingVerification(body.email, 'signup', body, otp, new Date(expires).toISOString());
        } catch(e) {
          console.warn('⚠️ DB Pending Verification failed, relying on secure cookie fallback.');
        }
        
        console.log('\n' + '*'.repeat(40));
        console.log(`🔐 STAGED SIGNUP OTP FOR ${body.email}: ${otp}`);
        console.log('*'.repeat(40) + '\n');
        
        const transporter = await getTransporter();
        if (transporter) {
          try {
            console.log(`✉️ Attempting to send signup OTP to ${body.email}...`);
            await transporter.sendMail({
              from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
              to: body.email,
              subject: '🌿 Verify Your IGO Nursery Account',
              html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f8f4;font-family:'Segoe UI',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;"><table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#1b5e20,#2d7a3a);padding:32px 40px;text-align:center;"><div style="margin-bottom:12px;"><img src="cid:logo" alt="Logo" width="70" height="70" style="border-radius:12px;background:#fff;border:3px solid rgba(255,255,255,0.2);" /></div><div style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;">IGO Nursery</div></td></tr><tr><td style="padding:36px 40px;"><h2 style="color:#1b5e20;margin:0 0 12px;font-size:20px;">Verify Your Account</h2><p style="color:#555;line-height:1.7;font-size:15px;">Hello <b>${body.name}</b>,<br><br>Welcome to IGO Nursery! Use the code below to verify your account and start your green journey.</p><div style="text-align:center;margin:28px 0;"><div style="display:inline-block;background:#e8f5e9;border:2px dashed #2d7a3a;border-radius:12px;padding:16px 40px;"><div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#1b5e20;">${otp}</div></div></div><p style="color:#888;font-size:13px;text-align:center;">This code expires in 15 minutes.</p><hr style="border:none;border-top:1px solid #e0f2e9;margin:24px 0;"><p style="color:#aaa;font-size:12px;text-align:center;">If you didn't sign up, you can safely ignore this email.</p></td></tr></table></td></tr></table></body></html>`,
              attachments: [LOGO_ATTACHMENT]
            });
            console.log(`✅ Signup OTP sent to ${body.email}`);
          } catch (mailErr) {
            console.error('❌ Failed to send signup email:', mailErr);
          }
        }
        
        console.log(`✅ Signup initialization complete for ${body.email}`);
        sendJson(response, 200, { success: true, needsVerification: true, email: body.email });
      } catch (err) {
        console.error('❌ Staged signup error:', err);
        if (err.stack) console.error(err.stack);
        sendJson(response, 500, { message: `Signup initialization failed: ${err.message}` });
      }
      return;
    }

    if (request.method === 'POST' && pathname === '/api/customer/verify-otp') {
      const body = await readJsonBody(request);
      if (body.email) body.email = body.email.trim().toLowerCase();
      
      if (!body.otp) {
        sendJson(response, 400, { message: 'OTP is required.' });
        return;
      }
      
      const cookies = request.headers.cookie || '';
      const match = cookies.match(/igo_otp_session=([^;]+)/);
      let pending = null;
      
      if (match) {
        const cookieVal = match[1];
        const [payloadBase64, signature] = cookieVal.split('.');
        const crypto = await import('node:crypto');
        const expectedSignature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret').update(Buffer.from(payloadBase64, 'base64').toString()).digest('hex');
        
        if (signature === expectedSignature) {
          const cookieData = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          if (cookieData.email === body.email) {
            pending = {
              otp_code: cookieData.otp,
              expires_at: new Date(cookieData.expires).toISOString(),
              type: cookieData.type,
              payload: cookieData.payload
            };
            console.log(`✅ Loaded pending verification for ${body.email} from secure cookie.`);
          }
        } else {
          console.warn('⚠️ Invalid OTP cookie signature detected.');
        }
      }
      
      if (!pending) {
        // Fallback to DB if cookie is missing/invalid
        pending = await getPendingVerification(body.email);
      }
      
      if (!pending || String(pending.otp_code) !== String(body.otp) || new Date(pending.expires_at) < new Date()) {
        const debugInfo = `pending=${!!pending}, otpMatch=${pending ? String(pending.otp_code) === String(body.otp) : false}`;
        console.error(`❌ OTP Verification failed for ${body.email}:`, {
          pendingFound: !!pending,
          otpMatch: pending ? String(pending.otp_code) === String(body.otp) : false,
          expired: pending ? new Date(pending.expires_at) < new Date() : false,
          serverTime: new Date().toISOString(),
          expiresAt: pending?.expires_at
        });
        sendJson(response, 400, { message: `Invalid or expired OTP. (Debug: ${debugInfo})` });
        return;
      }
      
      // Clear the cookie once used
      response.setHeader('Set-Cookie', 'igo_otp_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');

      try {
        if (pending.type === 'signup') {
          const customer = await createCustomer(pending.payload);
          await verifyCustomerOtp(customer.email, body.otp); // Mark as verified in DB
          await deletePendingVerification(body.email);
          console.log(`✅ Profile created for verified customer: ${customer.email}`);
          
          // Auto-login: Create session immediately
          const session = await createCustomerSession({ 
            email: customer.email, 
            password: pending.payload.password,
            isBypassPassword: true 
          });
          
          sendJson(response, 201, session);
        } else if (pending.type === 'login') {
          await verifyCustomerOtp(body.email, body.otp); // Mark as verified in DB
          const session = await createCustomerSession({ 
            email: body.email, 
            password: pending.payload.password,
            isBypassPassword: true // Internally tell createCustomerSession to skip re-hash check if we already checked it
          });
          await deletePendingVerification(body.email);
          console.log(`✅ 2FA successful for customer: ${body.email}`);
          sendJson(response, 200, session);
        }
      } catch (err) {
        console.error('❌ Verification completion error:', err);
        if (err.stack) console.error(err.stack);
        sendJson(response, 500, { message: `System error during verification finalization: ${err.message}` });
      }
      return;
    }

    if (request.method === 'POST' && pathname === '/api/customer/login') {
      const body = await readJsonBody(request);
      if (body.email) body.email = body.email.trim().toLowerCase();
      if (body.password) body.password = body.password.trim();
      
      console.log(`🔑 Login attempt for: ${body.email}`);
      const customer = await findCustomerByEmail(body.email);
      
      if (!customer || !await verifyCustomerPassword(customer.id, body.password)) {
        console.log(`❌ Login failed for: ${body.email}`);
        sendJson(response, 401, { message: 'Invalid email or password.' });
        return;
      }

      // Password is correct, now initiate 2FA
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60000).getTime(); // 10 mins for login OTP
      
      const crypto = await import('node:crypto');
      const payloadStr = JSON.stringify({ email: body.email, otp, expires, type: 'login', payload: { password: body.password } });
      const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret').update(payloadStr).digest('hex');
      const cookieVal = Buffer.from(payloadStr).toString('base64') + '.' + signature;
      response.setHeader('Set-Cookie', `igo_otp_session=${cookieVal}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
      
      // Store payload including password to recreate session on verify
      try {
        await createPendingVerification(body.email, 'login', { password: body.password }, otp, new Date(expires).toISOString());
      } catch(e) {
        console.warn('⚠️ DB Pending Verification failed, relying on secure cookie fallback.');
      }
      
      console.log('\n' + '!'.repeat(40));
      console.log(`🔐 LOGIN 2FA OTP FOR ${body.email}: ${otp}`);
      console.log('!'.repeat(40) + '\n');
      
      const transporter = await getTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
            to: body.email,
            subject: '🔐 Your IGO Nursery Login Code',
            html: `<!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f8f4;padding:32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#1b5e20,#2d7a3a);padding:28px 40px;text-align:center;"><img src="cid:logo" alt="Logo" width="80" style="border-radius:12px;border:3px solid rgba(255,255,255,0.4);margin-bottom:12px;background:#fff;" /><div style="color:#fff;font-size:22px;font-weight:900;">IGO Nursery</div></td></tr><tr><td style="padding:36px 40px;"><h2 style="color:#1b5e20;margin:0 0 12px;">Login Verification</h2><p style="color:#555;line-height:1.7;">Hello <b>${customer.name}</b>,<br><br>Use the code below to complete your login.</p><div style="text-align:center;margin:28px 0;"><div style="display:inline-block;background:#e8f5e9;border:2px dashed #2d7a3a;border-radius:12px;padding:16px 40px;"><div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#1b5e20;">${otp}</div></div></div><p style="color:#888;font-size:13px;text-align:center;">This code expires in 10 minutes.</p><hr style="border:none;border-top:1px solid #e0f2e9;margin:24px 0;"><p style="color:#aaa;font-size:12px;text-align:center;">If you didn't request this, please ignore this email.</p></td></tr></table></td></tr></table></body></html>`,
            attachments: [LOGO_ATTACHMENT]
          });
          console.log(`✅ Login OTP sent successfully to ${body.email}`);
        } catch (mailErr) {
          console.error(`❌ SMTP Error sending login OTP to ${body.email}:`, mailErr.message);
          // Don't fail the whole request, but log it clearly
        }
      }
      
      sendJson(response, 200, { success: true, needsVerification: true, email: body.email });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/customer/session') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      sendJson(response, 200, session);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/customer/logout') {
      const token = getBearerToken(request);
      if (token) await deleteCustomerSession(token);
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/customer/profile') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      sendJson(response, 200, { customer: session.customer });
      return;
    }

    if (request.method === 'PATCH' && pathname === '/api/customer/profile') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const body = await readJsonBody(request);
      const updated = await updateCustomerProfile(session.customer.id, body);
      sendJson(response, 200, { customer: updated });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/customer/orders') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const orders = await listCustomerOrders(session.customer.id);
      sendJson(response, 200, { orders });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/customer/notifications') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const notifications = await listCustomerNotifications(session.customer.id);
      sendJson(response, 200, { notifications });
      return;
    }

    if (request.method === 'POST' && pathname.match(/^\/api\/customer\/notifications\/(\d+)\/read$/)) {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const match = pathname.match(/^\/api\/customer\/notifications\/(\d+)\/read$/);
      await markNotificationAsRead(Number(match[1]), session.customer.id);
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'PATCH' && pathname === '/api/customer/settings') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      try {
        const body = await readJsonBody(request);
        await updateCustomerSettings(session.customer.id, body);
        const updated = await findCustomerById(session.customer.id);
        sendJson(response, 200, { customer: updated });
      } catch (err) {
        console.error('Settings Update Failed:', err);
        sendJson(response, 500, { message: 'Failed to update customer settings.' });
      }
      return;
    }

    if (request.method === 'PATCH' && pathname === '/api/customer/password') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const body = await readJsonBody(request);
      
      if (!await verifyCustomerPassword(session.customer.id, body.currentPassword)) {
        sendJson(response, 400, { message: 'Incorrect current password' });
        return;
      }

      const salt = createSalt();
      const hash = hashPassword(body.newPassword, salt);
      await updateCustomerPassword(session.customer.id, hash, salt);

      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'PATCH' && pathname === '/api/customer/request-deletion') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      await requestCustomerDeletion(session.customer.id);
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/customer/forgot-password') {
      const body = await readJsonBody(request);
      const customer = await findCustomerByEmail(body.email);
      
      if (customer) {
        const resetToken = createToken(32);
        const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        await setCustomerResetToken(customer.id, resetToken, expires);

        const host = request.headers.host || 'localhost:3000';
        const protocol = request.headers['x-forwarded-proto'] || 'http';
        const resetUrl = `${protocol}://${host}/account/reset-password?token=${resetToken}`;

        console.log('\n' + '='.repeat(60));
        console.log('🔑 PASSWORD RESET REQUESTED');
        console.log(`👤 Customer: ${customer.name} (${customer.email})`);
        console.log(`🔗 Reset Link: ${resetUrl}`);
        console.log('='.repeat(60) + '\n');

        const transporter = await getTransporter();
        if (transporter) {
          try {
            await transporter.sendMail({
              from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
              to: customer.email,
              subject: '🔑 Reset Your IGO Nursery Password',
            html: `<!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f8f4;padding:32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#1b5e20,#2d7a3a);padding:28px 40px;text-align:center;"><img src="cid:logo" alt="Logo" width="80" style="border-radius:12px;border:3px solid rgba(255,255,255,0.4);margin-bottom:12px;background:#fff;" /><div style="color:#fff;font-size:22px;font-weight:900;">IGO Nursery</div></td></tr><tr><td style="padding:36px 40px;"><h2 style="color:#1b5e20;margin:0 0 12px;">Password Reset Request</h2><p style="color:#555;line-height:1.7;">Hello <b>${customer.name}</b>,<br><br>We received a request to reset your password. Click the button below to set a new one.</p><div style="text-align:center;margin:28px 0;"><a href="${resetUrl}" style="display:inline-block;background:#2d7a3a;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;">Reset My Password</a></div><p style="color:#888;font-size:13px;text-align:center;">This link expires in 1 hour.</p><hr style="border:none;border-top:1px solid #e0f2e9;margin:24px 0;"><p style="color:#aaa;font-size:12px;text-align:center;">If you didn't request this, you can safely ignore this email.</p></td></tr></table></td></tr></table></body></html>`,
            attachments: [LOGO_ATTACHMENT]
          });
          console.log(`✅ Reset email sent successfully to ${customer.email}`);
        } catch (mailErr) {
          console.error(`❌ SMTP Error sending reset to ${customer.email}:`, mailErr.message);
        }
      }
    }
      
      // Always return 200 for security
      sendJson(response, 200, { message: 'If an account exists, a reset link has been sent.' });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/customer/reset-password') {
      const body = await readJsonBody(request);
      const customer = await findCustomerByResetToken(body.token);

      if (!customer) {
        return sendJson(response, 400, { message: 'Invalid or expired reset token.' });
      }

      const salt = createSalt();
      const hash = hashPassword(body.newPassword, salt);
      await updateCustomerPassword(customer.id, hash, salt);
      await clearCustomerResetToken(customer.id);
      
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/customer/orders') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const orders = await listCustomerOrders(session.customer.id, session.customer.email);
      sendJson(response, 200, { orders });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/customer/notifications') {
      const session = await requireCustomer(request, response);
      if (!session) return;
      const notifications = await listCustomerNotifications(session.customer.id);
      sendJson(response, 200, { notifications });
      return;
    }

    if (request.method === 'POST' && pathname.startsWith('/api/customer/notifications/')) {
      const session = await requireCustomer(request, response);
      if (!session) return;
      
      // Handle both /api/customer/notifications/:id and /api/customer/notifications/:id/read
      const segments = pathname.split('/').filter(Boolean);
      const id = segments[3]; // api(0)/customer(1)/notifications(2)/ID(3)
      
      if (id && id !== 'read') {
        await markNotificationAsRead(id, session.customer.id);
        sendJson(response, 200, { success: true });
      } else {
        sendJson(response, 400, { message: 'Invalid notification ID' });
      }
      return;
    }

    if (request.method === 'POST' && pathname === '/api/emails/order-confirmation') {

      const body = await readJsonBody(request);
      if (!mailTransporter) {
        sendJson(response, 500, { message: 'Mailer not initialized yet' });
        return;
      }

      // Build rich HTML email if order data is provided, otherwise use provided text
      let htmlContent = body.html || null;
      let subjectLine = body.subject;
      if (!htmlContent && body.orderData) {
        const emailData = buildOrderConfirmedEmail(body.orderData);
        htmlContent = emailData.html;
        subjectLine = emailData.subject;
      }

      const mailOptions = {
        from: `"IGO Nursery" <${SMTP_USER || 'orders@igo.local'}>`,
        to: body.to,
        subject: subjectLine,
        ...(htmlContent ? { html: htmlContent } : { text: body.text }),
        attachments: [LOGO_ATTACHMENT]
      };

      const info = await mailTransporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✉️ Email sent: %s', info.messageId);
      console.log('🔗 Preview URL: %s', previewUrl);
      
      sendJson(response, 200, { success: true, previewUrl });
      return;
    }

    notFound(response);
  } catch (error) {
    console.error('🔴 GLOBAL API ERROR:', error);
    
    // Ensure we only send the error if headers haven't been sent yet
    if (!response.writableEnded) {
      const errorMessage = error.message || 'An unexpected internal error occurred.';
      const statusCode = error.status || 500;
      
      response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ 
        success: false,
        message: `System Error: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }));
    }
  }
};

// Standard Node.js Server Startup
if (!process.env.VERCEL) {
  const server = http.createServer(handler);
  // Use Railway's PORT env var, fallback to API_PORT for local dev
  const LISTEN_PORT = Number(process.env.PORT || API_PORT);
  server.listen(LISTEN_PORT, '0.0.0.0', () => {
    console.log(`IGO backend API running on port ${LISTEN_PORT}`);
  });
}

export default handler;
