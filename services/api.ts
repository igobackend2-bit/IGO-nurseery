import { Order, CartItem } from '../types';
import { OrderData } from '../pages/Checkout';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
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

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || 'Request failed.');
  }

  return body as T;
};

export const adminLogin = async (email: string, password: string): Promise<AdminSessionResponse> => {
  return request<AdminSessionResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getAdminSession = async (token: string): Promise<AdminSessionResponse | null> => {
  return request<AdminSessionResponse>('/api/admin/session', {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
};

export const adminLogout = async (token?: string) => {
  if (token) {
    await request('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  return { success: true };
};

export const fetchAdminOrders = (token: string) =>
  request<{ orders: Order[] }>('/api/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchAdminOrder = (token: string, orderNumber: string) =>
  request<{ order: Order }>(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAdminOrderStatus = (token: string, orderNumber: string, status: Order['status']) =>
  request<{ order: Order }>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });

export const adminDeleteCustomer = (token: string, customerId: number) =>
  request<{ success: boolean }>(`/api/admin/customer/${customerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

export const createOrderPayload = (orderData: OrderData, cartItems: CartItem[], customerId?: number) => {
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


export const submitOrder = (payload: ReturnType<typeof createOrderPayload>) =>
  request<{ order: Order; accessKey: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchCustomerOrders = (references: CustomerOrderReference[]) =>
  request<{ orders: Order[] }>('/api/orders/lookup', {
    method: 'POST',
    body: JSON.stringify({ references }),
  });

export const fetchCustomerOrder = (orderNumber: string, accessKey: string) =>
  request<{ order: Order }>(`/api/orders/${encodeURIComponent(orderNumber)}?accessKey=${encodeURIComponent(accessKey)}`);
