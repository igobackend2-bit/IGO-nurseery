import { Order, CartItem } from '../types';
import { OrderData } from '../pages/Checkout';

export const ADMIN_TOKEN_STORAGE_KEY = 'igo-admin-token';
export const CUSTOMER_ORDER_REFS_STORAGE_KEY = 'igo-customer-order-refs';

// ─── Supabase → App format normalizer ────────────────────────────────────────
// Supabase returns snake_case with nested `order_items`; the app expects camelCase with `items: CartItem[]`.
export const normalizeOrder = (raw: any): Order => {
  const items: CartItem[] = (raw.order_items || []).map((oi: any) => ({
    product: {
      id:          oi.product_id   || oi.products?.id          || '',
      name:        oi.product_name || oi.products?.name        || 'Product',
      price:       Number(oi.product_price ?? oi.price ?? oi.products?.price ?? 0),
      category:    oi.product_category || oi.products?.category || '',
      image:       oi.product_image    || oi.products?.image    || '',
      description: oi.products?.description || '',
    },
    quantity: Number(oi.quantity ?? 1),
  }));

  return {
    id:               String(raw.id            ?? ''),
    orderNumber:      raw.order_number         ?? raw.orderNumber         ?? '',
    trackingNumber:   raw.tracking_number      ?? raw.trackingNumber      ?? '',
    customerName:     raw.customer_name        ?? raw.customerName        ?? 'Customer',
    customerEmail:    raw.customer_email       ?? raw.customerEmail       ?? '',
    customerPhone:    raw.customer_phone       ?? raw.customerPhone       ?? '',
    customerId:       raw.customer_id          ?? raw.customerId,
    shippingAddress:  raw.shipping_address     ?? raw.shippingAddress     ?? '',
    city:             raw.city                 ?? '',
    state:            raw.state                ?? '',
    zipCode:          raw.zip_code             ?? raw.zipCode             ?? '',
    items,
    subtotal:         Number(raw.subtotal       ?? 0),
    tax:              Number(raw.tax            ?? 0),
    deliveryCharge:   Number(raw.delivery_charge ?? raw.deliveryCharge ?? 0),
    total:            Number(raw.total          ?? 0),
    paymentMethod:    (raw.payment_method ?? raw.paymentMethod ?? 'card') as Order['paymentMethod'],
    lastFour:         raw.last_four            ?? raw.lastFour,
    status:           (raw.status ?? 'pending') as Order['status'],
    createdAt:        raw.order_date           ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    estimatedDelivery: raw.estimated_delivery  ?? raw.estimatedDelivery ?? '',
    deletionRequested: raw.deletion_requested  ?? raw.deletionRequested ?? false,
  };
};

export interface AdminSessionResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
}

export interface CustomerOrderReference {
  orderNumber: string;
  accessKey: string;
}

export const adminLogin = async (email: string, password: string): Promise<AdminSessionResponse> => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  
  // Check if they are admin (in a real app, check a role table)
  return {
    token: data.session?.access_token || '',
    admin: {
      id: data.user?.id || '',
      email: data.user?.email || '',
      name: data.user?.user_metadata?.name || 'Admin',
    }
  };
};

export const getAdminSession = async (token: string): Promise<AdminSessionResponse | null> => {
  const { supabase } = await import('./supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return {
    token: session.access_token,
    admin: {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || 'Admin',
    }
  };
};

export const adminLogout = async (token?: string) => {
  const { supabase } = await import('./supabaseClient');
  await supabase.auth.signOut();
  return { success: true };
};

export const fetchAdminOrders = async (token: string) => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { orders: (data ?? []).map(normalizeOrder) };
};

export const fetchAdminOrder = async (token: string, orderNumber: string) => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single();
  if (error) throw new Error(error.message);
  return { order: normalizeOrder(data) };
};

const getStatusMessage = (status: string, orderNumber: string): string => {
  const msgs: Record<string, string> = {
    confirmed: `Great news! Your order #${orderNumber} has been confirmed and we are preparing it for you! 🌱`,
    picked:    `Our garden experts have carefully hand-picked the best plants for your order #${orderNumber}! 🪴`,
    packed:    `Your order #${orderNumber} is packed securely and is waiting to be shipped! 📦`,
    shipped:   `Your order #${orderNumber} is on the way! Track your delivery on your profile. 🚚`,
    delivered: `Your order #${orderNumber} has been delivered. Happy gardening! 🎉`,
    cancelled: `Your order #${orderNumber} has been cancelled. Contact us if you have any questions.`,
  };
  return msgs[status] ?? `Your order #${orderNumber} status has been updated to: ${status}.`;
};

export const updateAdminOrderStatus = async (token: string, orderNumber: string, status: Order['status']) => {
  const { supabase } = await import('./supabaseClient');

  // 1. Fetch full order (customer_email is stored directly on the order row now)
  const { data: orderData, error: fetchErr } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  // 2. Update status and return updated row with items
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_number', orderNumber)
    .select('*, order_items(*)')
    .single();
  if (error) throw new Error(error.message);

  // 3. Send status-update email + push in-app notification via Supabase
  try {
    const customerEmail = orderData.customer_email ?? '';
    let customerId = orderData.customer_id ?? null;
    const orderNumber = orderData.order_number ?? '';
    const customerName = orderData.customer_name ?? 'Customer';
    let emailNotificationsEnabled = true;

    // We must look up the customer to get their email_notifications preference
    // and also to ensure we have their customerId for the in-app notification
    if (customerEmail) {
      const { supabase } = await import('./supabaseClient');
      // Attempt to fetch email_notifications, but fall back to just id if column doesn't exist
      try {
        const { data: customerRow, error } = await supabase
          .from('customers')
          .select('id, email_notifications')
          .eq('email', customerEmail)
          .maybeSingle();

        if (!error && customerRow) {
          if (!customerId && customerRow.id) {
             customerId = customerRow.id;
             await supabase.from('orders').update({ customer_id: customerId }).eq('order_number', orderNumber);
          }
          if (customerRow.email_notifications === false) {
             emailNotificationsEnabled = false;
          }
        } else if (error) {
          // Fallback if email_notifications column does not exist
          const { data: fallbackRow } = await supabase
            .from('customers')
            .select('id')
            .eq('email', customerEmail)
            .maybeSingle();
            
          if (fallbackRow) {
            if (!customerId && fallbackRow.id) {
               customerId = fallbackRow.id;
               await supabase.from('orders').update({ customer_id: customerId }).eq('order_number', orderNumber);
            }
          }
        }
      } catch (err) {
        console.warn('Could not check email preferences:', err);
      }
    }

    if (customerEmail && emailNotificationsEnabled) {
      const { sendOrderStatusUpdateEmail } = await import('./orderEmailService');
      sendOrderStatusUpdateEmail(customerEmail, customerName, orderNumber, status)
        .then(r => { if (r.success) console.log(`✅ Status email sent to ${customerEmail}`); })
        .catch(e => console.error('Email dispatch failed:', e));
    } else if (customerEmail && !emailNotificationsEnabled) {
      console.log(`🚫 Email skipped for ${customerEmail} because they turned off notifications.`);
    }

    // Push in-app notification stored in Supabase (cross-browser)
    if (customerId) {
      const { supabase } = await import('./supabaseClient');
      await supabase.from('notifications').insert({
        customer_id: customerId,
        title: `Order ${orderNumber} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: getStatusMessage(status, orderNumber),
        type: status === 'cancelled' ? 'cancelled' : 'order',
        target_page: 'customer-profile',
        target_id: orderNumber,
      }).then(({ error }) => { if (error) console.error('Notification insert failed:', error.message); });
    }
  } catch (e) {
    console.error('Failed to send status update:', e);
  }

  return { order: normalizeOrder(data) };
};

export const adminDeleteCustomer = async (token: string, customerId: number) => {
  const { supabase } = await import('./supabaseClient');
  const { error } = await supabase.from('customers').delete().eq('id', customerId);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const createOrderPayload = (orderData: OrderData, cartItems: CartItem[], customerId?: string) => {
  const orderNumber = `IGO-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const trackingNumber = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const accessKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryCharge;

  return {
    id: `order-${Date.now()}`,
    orderNumber,
    trackingNumber,
    accessKey,
    customerId,
    customerName: `${orderData.firstName} ${orderData.lastName}`,
    customerEmail: orderData.email,
    customerPhone: orderData.phone,
    shippingAddress: orderData.address,
    city: orderData.city,
    state: orderData.state,
    zipCode: orderData.zipCode,
    items: cartItems,
    subtotal,
    tax,
    deliveryCharge,
    total,
    paymentMethod: orderData.paymentMethod,
    lastFour: orderData.lastFour,
    status: 'processing' as const,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const submitOrder = async (payload: ReturnType<typeof createOrderPayload>) => {
  const { supabase } = await import('./supabaseClient');

  // 1. If customerId is provided, ensure they exist in public.customers to prevent FK violation
  if (payload.customerId) {
    const { error: customerError } = await supabase.from('customers').upsert({
      id: payload.customerId,
      name: payload.customerName || 'Customer',
      email: payload.customerEmail || '',
      phone: payload.customerPhone || ''
    }, { onConflict: 'id' });
    if (customerError) {
      console.warn('Could not upsert customer during checkout:', customerError.message);
    }
  }

  const orderDataToInsert = {
    order_number:     payload.orderNumber,
    tracking_number:  payload.trackingNumber,
    access_key:       payload.accessKey,
    customer_id:      payload.customerId || null,
    customer_name:    payload.customerName,
    customer_email:   payload.customerEmail,
    customer_phone:   payload.customerPhone,
    last_four:        payload.lastFour || null,
    shipping_address: payload.shippingAddress,
    city:             payload.city,
    state:            payload.state,
    zip_code:         payload.zipCode,
    subtotal:         payload.subtotal,
    tax:              payload.tax,
    delivery_charge:  payload.deliveryCharge,
    total:            payload.total,
    payment_method:   payload.paymentMethod,
    status:           payload.status,
    estimated_delivery: payload.estimatedDelivery,
  };

  let { data: order, error } = await supabase.from('orders').insert(orderDataToInsert).select().single();

  // Handle case where test user exists in auth but not in public.customers table (FK violation)
  if (error && error.code === '23503' && payload.customerId) {
    console.warn('Customer ID not found in public.customers, falling back to guest order');
    orderDataToInsert.customer_id = null;
    const retryResult = await supabase.from('orders').insert(orderDataToInsert).select().single();
    order = retryResult.data;
    error = retryResult.error;
  }

  if (error) throw new Error(error.message);

  // Insert items with inline product data so no FK join is needed on read
  if (payload.items.length > 0) {
    const itemsToInsert = payload.items.map(item => ({
      order_id:         order.id,
      product_id:       item.product.id,
      product_name:     item.product.name,
      product_image:    item.product.image,
      product_category: item.product.category,
      quantity:         item.quantity,
      product_price:    item.product.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) throw new Error(itemsError.message);
  }

  // Push an in-app notification for the customer about their new order
  if (payload.customerId) {
    const { error: notifError } = await supabase.from('notifications').insert({
      customer_id: payload.customerId,
      title: `Order Confirmed: #${payload.orderNumber}`,
      message: `Your order has been placed successfully and is now being processed.`,
      type: 'order',
      target_page: 'customer-profile',
      target_id: 'orders',
      is_read: false
    });
    if (notifError) console.error('Failed to create order notification:', notifError);
  }

  return { order: payload as any, accessKey: payload.accessKey };
};

/** @deprecated use normalizeOrder instead */
export const mapSupabaseOrder = normalizeOrder;

export const fetchCustomerOrders = async (references: CustomerOrderReference[]) => {
  if (!references || references.length === 0) return { orders: [] };
  const { supabase } = await import('./supabaseClient');
  const orderNumbers = references.map(r => r.orderNumber);

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .in('order_number', orderNumbers)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return { orders: (data ?? []).map(normalizeOrder) };
};

export const fetchCustomerOrder = async (orderNumber: string, accessKey: string) => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .eq('access_key', accessKey)
    .single();

  if (error) throw new Error(error.message);
  return { order: normalizeOrder(data) };
};
