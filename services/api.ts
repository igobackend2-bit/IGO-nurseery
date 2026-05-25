import { Order, CartItem } from '../types';
import { OrderData } from '../pages/Checkout';

export const ADMIN_TOKEN_STORAGE_KEY = 'igo-admin-token';
export const CUSTOMER_ORDER_REFS_STORAGE_KEY = 'igo-customer-order-refs';

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
  const { data, error } = await supabase.from('orders').select('*, order_items(*, products(*))');
  if (error) throw new Error(error.message);
  return { orders: data as any };
};

export const fetchAdminOrder = async (token: string, orderNumber: string) => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase.from('orders').select('*, order_items(*, products(*))').eq('order_number', orderNumber).single();
  if (error) throw new Error(error.message);
  return { order: data as any };
};

export const updateAdminOrderStatus = async (token: string, orderNumber: string, status: Order['status']) => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase.from('orders').update({ status }).eq('order_number', orderNumber).select().single();
  if (error) throw new Error(error.message);
  return { order: data as any };
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
  
  const { data: order, error } = await supabase.from('orders').insert({
    order_number: payload.orderNumber,
    access_key: payload.accessKey,
    customer_id: payload.customerId || null,
    shipping_address: payload.shippingAddress,
    city: payload.city,
    state: payload.state,
    zip_code: payload.zipCode,
    subtotal: payload.subtotal,
    tax: payload.tax,
    delivery_charge: payload.deliveryCharge,
    total: payload.total,
    payment_method: payload.paymentMethod,
    status: payload.status,
    estimated_delivery: payload.estimatedDelivery
  }).select().single();
  
  if (error) throw new Error(error.message);
  
  const itemsToInsert = payload.items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price
  }));
  
  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) throw new Error(itemsError.message);
  }
  
  return { order: payload as any, accessKey: payload.accessKey };
};

export const fetchCustomerOrders = async (references: CustomerOrderReference[]) => {
  if (!references || references.length === 0) return { orders: [] };
  const { supabase } = await import('./supabaseClient');
  const orderNumbers = references.map(r => r.orderNumber);
  
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(*, products(*))')
    .in('order_number', orderNumbers);
    
  if (error) throw new Error(error.message);
  return { orders: data as any };
};

export const fetchCustomerOrder = async (orderNumber: string, accessKey: string) => {
  const { supabase } = await import('./supabaseClient');
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(*, products(*))')
    .eq('order_number', orderNumber)
    .eq('access_key', accessKey)
    .single();
    
  if (error) throw new Error(error.message);
  return { order: data as any };
};
