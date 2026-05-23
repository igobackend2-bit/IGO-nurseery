import fs from 'node:fs';
// Dynamic import for experimental SQLite feature to avoid crashes on older Node.js versions
import { supabase } from './supabaseClient.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD, DATA_DIR, DB_PATH, SESSION_TTL_MS } from './config.js';
import { createSalt, createToken, hashPassword, verifyPassword } from './auth.js';

export { createSalt, createToken, hashPassword, verifyPassword };

let realDb = null;

// Only attempt local SQLite initialization if NOT on Vercel
// Vercel uses a read-only filesystem where SQLite writes will fail.
if (!process.env.VERCEL) {
  try {
    const Database = (await import('better-sqlite3')).default;
    realDb = new Database(DB_PATH);
    console.log('📦 Local SQLite Database connected.');
  } catch (err) {
    console.warn('⚠️ SQLite initialization failed (better-sqlite3 might be missing or incompatible):', err.message);
  }
}

if (!realDb) {
  console.log('🚀 Production mode: Using Supabase Cloud Database.');
}

// Fallback to a dummy object to prevent crashes if both Supabase and SQLite are unavailable
const db = realDb || {
  exec: () => ({}),
  prepare: () => ({
    get: () => null,
    all: () => [],
    run: () => ({ lastInsertRowid: 0, changes: 0 }),
    setReadonly: () => ({}),
  })
};

if (realDb) {
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    otp_code TEXT,
    otp_expires TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS pending_verifications (
    email TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'signup' or 'login'
    payload TEXT NOT NULL, -- JSON data
    otp_code TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customer_sessions (
    token TEXT PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL UNIQUE,
    order_number TEXT NOT NULL UNIQUE,
    tracking_number TEXT NOT NULL UNIQUE,
    access_key TEXT NOT NULL UNIQUE,
    customer_id INTEGER, -- Optional: link to account
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    delivery_charge REAL NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    last_four TEXT, -- Last 4 digits for billing reference
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    estimated_delivery TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    product_category TEXT NOT NULL,
    product_image TEXT NOT NULL,
    product_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_number TEXT NOT NULL,
    type TEXT NOT NULL, -- 'shipped', 'cancelled', 'processing'
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );
`);
}


if (realDb) {
  // Support Migrations for existing DB
  try { db.exec('ALTER TABLE orders ADD COLUMN customer_id INTEGER;'); } catch (e) {}
  try { db.exec('ALTER TABLE orders ADD COLUMN last_four TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN email_notifications INTEGER DEFAULT 1;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN reset_token TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN reset_expires TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN is_verified INTEGER DEFAULT 0;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN otp_code TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN otp_expires TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE customers ADD COLUMN deletion_requested INTEGER DEFAULT 0;'); } catch (e) {}

  // For existing users, force them to be verified so they aren't locked out due to previous incomplete flows
  try { db.exec('UPDATE customers SET is_verified = 1 WHERE is_verified = 0;'); } catch (e) {}
}

const insertAdminStatement = db.prepare(`
  INSERT INTO admins (email, name, password_hash, password_salt, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const selectAdminByEmailStatement = db.prepare(`
  SELECT id, email, name, password_hash, password_salt
  FROM admins
  WHERE lower(email) = lower(?)
`);

const insertSessionStatement = db.prepare(`
  INSERT INTO admin_sessions (token, admin_id, expires_at, created_at)
  VALUES (?, ?, ?, ?)
`);

const selectSessionStatement = db.prepare(`
  SELECT
    admin_sessions.token,
    admin_sessions.expires_at,
    admins.id AS admin_id,
    admins.email AS admin_email,
    admins.name AS admin_name
  FROM admin_sessions
  INNER JOIN admins ON admins.id = admin_sessions.admin_id
  WHERE admin_sessions.token = ?
`);

const deleteSessionStatement = db.prepare(`DELETE FROM admin_sessions WHERE token = ?`);
const cleanupSessionsStatement = db.prepare(`DELETE FROM admin_sessions WHERE expires_at <= ?`);

const insertOrderStatement = db.prepare(`
  INSERT INTO orders (
    order_id,
    order_number,
    tracking_number,
    access_key,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    city,
    state,
    zip_code,
    subtotal,
    tax,
    delivery_charge,
    total,
    payment_method,
    last_four,
    status,
    created_at,
    estimated_delivery
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertOrderItemStatement = db.prepare(`
  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_price,
    product_category,
    product_image,
    product_description,
    quantity
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const selectAllOrdersStatement = db.prepare(`
  SELECT *
  FROM orders
  ORDER BY datetime(created_at) DESC
`);

const selectOrderByNumberStatement = db.prepare(`
  SELECT *
  FROM orders
  WHERE order_number = ?
`);

const selectOrdersByReferencesStatement = db.prepare(`
  SELECT *
  FROM orders
  WHERE order_number = ? AND access_key = ?
`);

const selectOrderItemsStatement = db.prepare(`
  SELECT *
  FROM order_items
  WHERE order_id = ?
  ORDER BY id ASC
`);

const updateOrderStatusStatement = db.prepare(`
  UPDATE orders
  SET status = ?
  WHERE order_number = ?
`);

const insertCustomerStatement = db.prepare(`
  INSERT INTO customers (email, name, phone, password_hash, password_salt, is_verified, created_at)
  VALUES (?, ?, ?, ?, ?, 1, ?)
`);

const updateCustomerSettingsStatement = db.prepare(`
  UPDATE customers SET name = ?, phone = ?, email_notifications = ? WHERE id = ?
`);

const updateCustomerPasswordStatement = db.prepare(`
  UPDATE customers SET password_hash = ?, password_salt = ? WHERE id = ?
`);

const selectCustomerByEmailStatement = db.prepare(`
  SELECT * FROM customers WHERE lower(email) = lower(?)
`);

const selectCustomerByIdStatement = db.prepare(`
  SELECT * FROM customers WHERE id = ?
`);

const updateCustomerProfileStatement = db.prepare(`
  UPDATE customers
  SET name = ?, phone = ?
  WHERE id = ?
`);

const deleteCustomerStatement = db.prepare(`
  DELETE FROM customers WHERE id = ?
`);

const setCustomerResetTokenStatement = db.prepare(`
  UPDATE customers SET reset_token = ?, reset_expires = ? WHERE id = ?
`);

const findCustomerByResetTokenStatement = db.prepare(`
  SELECT * FROM customers WHERE reset_token = ? AND reset_expires > ?
`);

const insertCustomerSessionStatement = db.prepare(`
  INSERT INTO customer_sessions (token, customer_id, expires_at, created_at)
  VALUES (?, ?, ?, ?)
`);

const selectCustomerSessionStatement = db.prepare(`
  SELECT
    customer_sessions.token,
    customer_sessions.expires_at,
    customers.id,
    customers.email,
    customers.name,
    customers.phone,
    customers.email_notifications
  FROM customer_sessions
  INNER JOIN customers ON customers.id = customer_sessions.customer_id
  WHERE customer_sessions.token = ?
`);

const deleteCustomerSessionStatement = db.prepare(`DELETE FROM customer_sessions WHERE token = ?`);
const cleanupCustomerSessionsStatement = db.prepare(`DELETE FROM customer_sessions WHERE expires_at <= ?`);

const selectOrdersByCustomerIdStatement = db.prepare(`
  SELECT * FROM orders WHERE customer_id = ? ORDER BY datetime(created_at) DESC
`);

const insertNotificationStatement = db.prepare(`
  INSERT INTO notifications (customer_id, order_number, type, message, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const selectNotificationsByCustomerIdStatement = db.prepare(`
  SELECT * FROM notifications WHERE customer_id = ? ORDER BY datetime(created_at) DESC
`);

const markNotificationReadStatement = db.prepare(`
  UPDATE notifications SET is_read = 1 WHERE id = ? AND customer_id = ?
`);


const seedAdmin = () => {
  const salt = createSalt();
  const passwordHash = hashPassword(ADMIN_PASSWORD, salt);

  const existingAdmin = selectAdminByEmailStatement.get(ADMIN_EMAIL);
  if (existingAdmin) {
    // Force update the password to match config.js
    db.prepare('UPDATE admins SET password_hash = ?, password_salt = ? WHERE id = ?').run(
      passwordHash,
      salt,
      existingAdmin.id
    );
    console.log(`🔐 Admin password synchronized for ${ADMIN_EMAIL}`);
    return;
  }

  insertAdminStatement.run(
    ADMIN_EMAIL,
    'IGO Admin',
    passwordHash,
    salt,
    new Date().toISOString(),
  );
  console.log(`✅ Admin account created with password from config.js`);
};

seedAdmin();

const mapOrderItems = (rows) =>
  rows.map((item) => ({
    product: {
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      category: item.product_category,
      image: item.product_image,
      description: item.product_description,
    },
    quantity: item.quantity,
  }));

const hydrateOrder = (row) => {
  if (!row) {
    return null;
  }

  const itemRows = selectOrderItemsStatement.all(row.id);
  return {
    id: row.order_id,
    orderNumber: row.order_number,
    trackingNumber: row.tracking_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    customerId: row.customer_id,
    deletionRequested: row.customer_id ? (db.prepare('SELECT deletion_requested FROM customers WHERE id = ?').get(row.customer_id)?.deletion_requested === 1) : false,
    items: mapOrderItems(itemRows),
    subtotal: row.subtotal,
    tax: row.tax,
    deliveryCharge: row.delivery_charge,
    total: row.total,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    estimatedDelivery: row.estimated_delivery,
  };
};

const hydrateNotification = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    orderNumber: row.order_number,
    type: row.type,
    message: row.message,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  };
};

export const createAdminSession = async ({ email, password }) => {
  cleanupSessionsStatement.run(new Date().toISOString());
  
  let admin = null;
  if (supabase) {
    const { data } = await supabase.from('admins').select('*').eq('email', email.toLowerCase()).single();
    admin = data;
  } else {
    admin = selectAdminByEmailStatement.get(email);
  }

  if (!admin || !verifyPassword(password, admin.password_salt, admin.password_hash)) {
    return null;
  }

  const token = createToken(32);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_MS).toISOString();

  if (supabase) {
    await supabase.from('admin_sessions').insert({ token, admin_id: admin.id, expires_at: expiresAt, created_at: createdAt.toISOString() });
  } else {
    insertSessionStatement.run(token, admin.id, expiresAt, createdAt.toISOString());
  }

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
};

export const getAdminSession = async (token) => {
  if (!token) {
    return null;
  }

  cleanupSessionsStatement.run(new Date().toISOString());

  if (supabase) {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*, admins(*)')
      .eq('token', token)
      .maybeSingle();
    
    if (error || !data) return null;

    const admin = data.admins;
    return {
      token: data.token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  const session = selectSessionStatement.get(token);
  if (!session) {
    return null;
  }

  return {
    token: session.token,
    admin: {
      id: session.admin_id,
      email: session.admin_email,
      name: session.admin_name,
    },
  };
};

export const deleteAdminSession = (token) => {
  deleteSessionStatement.run(token);
};

export const createOrder = async (payload) => {
  const createdAt = payload.createdAt || new Date().toISOString();
  
  if (supabase) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: payload.id,
        order_number: payload.orderNumber,
        tracking_number: payload.trackingNumber,
        access_key: payload.accessKey,
        customer_id: payload.customerId || null,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        shipping_address: payload.shippingAddress,
        city: payload.city,
        state: payload.state,
        zip_code: payload.zipCode,
        subtotal: payload.subtotal,
        tax: payload.tax,
        delivery_charge: payload.deliveryCharge,
        total: payload.total,
        payment_method: payload.paymentMethod,
        last_four: payload.lastFour || null,
        status: payload.status,
        created_at: createdAt,
        estimated_delivery: payload.estimatedDelivery,
      })
      .select()
      .single();
    
    if (orderError) throw orderError;

    const items = payload.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      product_category: item.product.category,
      product_image: item.product.image,
      product_description: item.product.description,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(items);
    if (itemsError) throw itemsError;

    return { ...order, items: payload.items };
  }

  db.exec('BEGIN');
  try {
    insertOrderStatement.run(
      payload.id,
      payload.orderNumber,
      payload.trackingNumber,
      payload.accessKey,
      payload.customerId || null,
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      payload.shippingAddress,
      payload.city,
      payload.state,
      payload.zipCode,
      payload.subtotal,
      payload.tax,
      payload.deliveryCharge,
      payload.total,
      payload.paymentMethod,
      payload.lastFour || null,
      payload.status,
      createdAt,
      payload.estimatedDelivery,
    );

    const orderRow = selectOrderByNumberStatement.get(payload.orderNumber);
    for (const item of payload.items) {
      insertOrderItemStatement.run(
        orderRow.id,
        item.product.id,
        item.product.name,
        item.product.price,
        item.product.category,
        item.product.image,
        item.product.description,
        item.quantity,
      );
    }
    
    db.exec('COMMIT');
    return hydrateOrder(orderRow);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

export const createCustomer = async ({ email, name, phone, password }) => {
  const salt = createSalt();
  const hash = hashPassword(password, salt);
  const createdAt = new Date().toISOString();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (supabase) {
    const { data, error } = await supabase.from('customers').insert({
      email: normalizedEmail,
      name,
      phone: phone || '',
      password_hash: hash,
      password_salt: salt,
      is_verified: true,
      created_at: createdAt
    }).select().single();
    
    if (error) {
      throw new Error(`[Supabase Error in createCustomer] Code: ${error.code}, Message: ${error.message}`);
    }
    
    return data;
  }

  if (process.env.VERCEL) {
    throw new Error(`[Configuration Error] Supabase client is NULL. VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is missing from Vercel Environment Variables.`);
  }

  insertCustomerStatement.run(normalizedEmail, name, phone, hash, salt, createdAt);
  const customer = selectCustomerByEmailStatement.get(normalizedEmail);
  if (!customer) {
    throw new Error(`[SQLite Error] Failed to retrieve created customer profile for ${normalizedEmail}. SQLite database write failure.`);
  }
  return findCustomerById(customer.id);
};

export const updateCustomerSettings = async (id, data) => {
  if (supabase) {
    await supabase.from('customers').update({ name: data.name, phone: data.phone, email_notifications: data.emailNotifications ? true : false }).eq('id', id);
    return findCustomerById(id);
  }
  updateCustomerSettingsStatement.run(data.name, data.phone, data.emailNotifications ? 1 : 0, id);
  return findCustomerById(id);
};

export const updateCustomerPassword = async (id, hash, salt) => {
  if (supabase) {
    await supabase.from('customers').update({ password_hash: hash, password_salt: salt }).eq('id', id);
    return;
  }
  updateCustomerPasswordStatement.run(hash, salt, id);
};

export const findCustomerById = async (id) => {
  if (supabase) {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      emailNotifications: data.email_notifications === 1 || data.email_notifications === true,
    };
  }

  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    emailNotifications: row.email_notifications === 1,
  };
};

export const findCustomerByEmail = async (email) => {
  if (!email || typeof email !== 'string') return null;
  const normalizedEmail = email.toLowerCase().trim();

  if (supabase) {
    const { data, error } = await supabase.from('customers').select('*').ilike('email', normalizedEmail).maybeSingle();
    
    if (error) {
      console.error('Supabase findCustomerByEmail error:', error);
      throw new Error(`[Supabase Error in findCustomerByEmail] Code: ${error.code}, Message: ${error.message}`);
    }
    return data;
  }

  if (process.env.VERCEL) {
    return null; // Don't throw here, just return null as findCustomer expects
  }

  return selectCustomerByEmailStatement.get(normalizedEmail);
};

export const createCustomerSession = async ({ email, password, isBypassPassword }) => {
  cleanupCustomerSessionsStatement.run(new Date().toISOString());
  const customer = await findCustomerByEmail(email);

  if (!customer) {
    return null;
  }

  if (!isBypassPassword && !verifyPassword(password, customer.password_salt, customer.password_hash)) {
    return null;
  }

  const token = createToken(32);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_MS).toISOString();

  if (supabase) {
    const { error } = await supabase
      .from('customer_sessions')
      .insert({
        token,
        customer_id: customer.id,
        expires_at: expiresAt,
        created_at: createdAt.toISOString()
      });
    
    if (error) throw error;
  } else {
    insertCustomerSessionStatement.run(token, customer.id, expiresAt, createdAt.toISOString());
  }

  return {
    token,
    customer: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      emailNotifications: customer.email_notifications === 1 || customer.email_notifications === true,
    },
  };
};

export const getCustomerSession = async (token) => {
  if (!token) return null;
  cleanupCustomerSessionsStatement.run(new Date().toISOString());
  
  if (supabase) {
    const { data, error } = await supabase
      .from('customer_sessions')
      .select('*, customers(*)')
      .eq('token', token)
      .maybeSingle();
    
    if (error || !data) return null;
    
    const customer = data.customers;
    return {
      token: data.token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        emailNotifications: customer.email_notifications === 1 || customer.email_notifications === true,
      },
    };
  }

  const row = selectCustomerSessionStatement.get(token);
  if (!row) return null;

  return {
    token: row.token,
    customer: {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      emailNotifications: row.email_notifications === 1,
    },
  };
};

export const deleteCustomerSession = async (token) => {
  if (supabase) {
    await supabase.from('customer_sessions').delete().eq('token', token);
    return;
  }
  deleteCustomerSessionStatement.run(token);
};

export const updateCustomerProfile = async (id, { name, phone }) => {
  if (supabase) {
    const { data, error } = await supabase.from('customers').update({ name, phone }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  updateCustomerProfileStatement.run(name, phone, id);
  return selectCustomerByIdStatement.get(id);
};

export const deleteCustomer = (id) => {
  db.exec('BEGIN');
  try {
    // Manually handle what foreign keys SHOULD handle, to ensure compatibility
    db.prepare('UPDATE orders SET customer_id = NULL WHERE customer_id = ?').run(id);
    db.prepare('DELETE FROM notifications WHERE customer_id = ?').run(id);
    db.prepare('DELETE FROM customer_sessions WHERE customer_id = ?').run(id);
    const result = deleteCustomerStatement.run(id);
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

export const setCustomerResetToken = async (id, token, expires) => {
  if (supabase) {
    await supabase.from('customers').update({ reset_token: token, reset_expires: expires }).eq('id', id);
    return;
  }
  setCustomerResetTokenStatement.run(token, expires, id);
};

export const findCustomerByResetToken = async (token) => {
  const now = new Date().toISOString();
  if (supabase) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('reset_token', token)
      .gt('reset_expires', now)
      .maybeSingle();
    
    if (error) return null;
    return data;
  }
  return findCustomerByResetTokenStatement.get(token, now);
};

export const clearCustomerResetToken = async (id) => {
  if (supabase) {
    await supabase.from('customers').update({ reset_token: null, reset_expires: null }).eq('id', id);
    return;
  }
  setCustomerResetTokenStatement.run(null, null, id);
};

export const listCustomerOrders = async (customerId, email) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`customer_id.eq.${customerId},customer_email.eq.${email.toLowerCase()}`)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data.map(row => ({
      ...row,
      items: row.order_items.map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image,
          description: item.product_description,
        },
        quantity: item.quantity
      }))
    }));
  }
  return db.prepare('SELECT * FROM orders WHERE customer_id = ? OR lower(customer_email) = lower(?) ORDER BY datetime(created_at) DESC').all(customerId, email).map(hydrateOrder);
};

export const createNotification = async ({ customerId, orderNumber, type, message }) => {
  const createdAt = new Date().toISOString();
  if (supabase) {
    await supabase.from('notifications').insert({ customer_id: customerId, order_number: orderNumber, type, message, created_at: createdAt });
    return;
  }
  insertNotificationStatement.run(customerId, orderNumber, type, message, createdAt);
};

export const listCustomerNotifications = async (customerId) => {
  if (supabase) {
    const { data, error } = await supabase.from('notifications').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
    if (error) return [];
    return data.map(hydrateNotification);
  }
  return selectNotificationsByCustomerIdStatement.all(customerId).map(hydrateNotification);
};

export const markNotificationAsRead = async (id, customerId) => {
  if (supabase) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('customer_id', customerId);
    return;
  }
  markNotificationReadStatement.run(id, customerId);
};

export const requestCustomerDeletion = async (id) => {
  if (supabase) {
    await supabase.from('customers').update({ deletion_requested: true }).eq('id', id);
    return;
  }
  return db.prepare('UPDATE customers SET deletion_requested = 1 WHERE id = ?').run(id);
};


export const listAdminOrders = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) return [];
    return data.map(row => ({
      ...row,
      items: row.order_items.map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image,
          description: item.product_description,
        },
        quantity: item.quantity
      }))
    }));
  }
  return selectAllOrdersStatement.all().map(hydrateOrder);
};

export const findAdminOrderByNumber = async (orderNumber) => {
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('order_number', orderNumber).maybeSingle();
    if (error || !data) return null;
    return {
      ...data,
      items: data.order_items.map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image,
          description: item.product_description,
        },
        quantity: item.quantity
      }))
    };
  }
  return hydrateOrder(selectOrderByNumberStatement.get(orderNumber));
};

export const findCustomerOrderByReference = async (orderNumber, accessKey) => {
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('order_number', orderNumber).eq('access_key', accessKey).maybeSingle();
    if (error || !data) return null;
    return {
      ...data,
      items: data.order_items.map(item => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          category: item.product_category,
          image: item.product_image,
          description: item.product_description,
        },
        quantity: item.quantity
      }))
    };
  }
  return hydrateOrder(selectOrdersByReferencesStatement.get(orderNumber, accessKey));
};

export const findCustomerOrdersByReferences = async (references) => {
  const results = [];
  for (const reference of references) {
    const order = await findCustomerOrderByReference(reference.orderNumber, reference.accessKey);
    if (order) {
      results.push(order);
    }
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateOrderStatus = async (orderNumber, status) => {
  if (supabase) {
    await supabase.from('orders').update({ status }).eq('order_number', orderNumber);
    return findAdminOrderByNumber(orderNumber);
  }
  updateOrderStatusStatement.run(status, orderNumber);
  return findAdminOrderByNumber(orderNumber);
};

export const verifyCustomerPassword = async (id, password) => {
  const customer = await findCustomerById(id);
  if (!customer) return false;
  
  // Note: For Supabase, the findCustomerById already returns the data
  // But we need the hash and salt which might not be in the public profile
  let row = customer;
  if (supabase && !customer.password_hash) {
     const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
     row = data ? data : row;
  } else if (!supabase) {
     row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  }

  if (!row) return false;
  return verifyPassword(password, row.password_salt, row.password_hash);
};

export const setCustomerOtp = async (id, code, expires) => {
  if (supabase) {
    await supabase.from('customers').update({ otp_code: code, otp_expires: expires }).eq('id', id);
    return;
  }
  db.prepare('UPDATE customers SET otp_code = ?, otp_expires = ? WHERE id = ?').run(code, expires, id);
};

export const verifyCustomerOtp = async (email, code) => {
  const customer = await findCustomerByEmail(email);
  if (!customer) return false;
  
  if (customer.otp_code === code && new Date(customer.otp_expires) > new Date()) {
    if (supabase) {
      await supabase.from('customers').update({ is_verified: true, otp_code: null, otp_expires: null }).eq('id', customer.id);
    } else {
      db.prepare('UPDATE customers SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE id = ?').run(customer.id);
    }
    return true;
  }
  return false;
};
export const createPendingVerification = async (email, type, payload, otp, expires) => {
  if (supabase) {
    const { error } = await supabase
      .from('pending_verifications')
      .upsert({
        email,
        type,
        payload,
        otp_code: otp,
        expires_at: expires
      });
    
    if (error) throw error;
    return;
  }

  try {
    db.prepare(`
      INSERT OR REPLACE INTO pending_verifications (email, type, payload, otp_code, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, type, JSON.stringify(payload), otp, expires);
  } catch (err) {
    console.error('❌ SQLite Pending Verification Error:', err.message);
    throw err;
  }
};

export const getPendingVerification = async (email) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('pending_verifications')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error('Supabase getPendingVerification error:', error);
      return null;
    }
    return data;
  }

  const row = db.prepare('SELECT * FROM pending_verifications WHERE email = ?').get(email);
  if (!row) return null;
  return {
    ...row,
    payload: JSON.parse(row.payload)
  };
};

export const deletePendingVerification = async (email) => {
  if (supabase) {
    const { error } = await supabase
      .from('pending_verifications')
      .delete()
      .eq('email', email);
    
    if (error) console.error('Supabase deletePendingVerification error:', error);
    return;
  }

  db.prepare('DELETE FROM pending_verifications WHERE email = ?').run(email);
};
