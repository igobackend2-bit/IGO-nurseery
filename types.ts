
export enum Page {
  Home = 'home',
  Shop = 'shop',
  Product = 'product',
  Assistant = 'assistant',
  Landscape = 'landscape',
  AMC = 'amc',
  Lab = 'lab',
  Knowledge = 'knowledge',
  About = 'about',
  Visit = 'visit',
  Account = 'account',
  Cart = 'cart',
  AddProduct = 'add-product',
  Checkout = 'checkout',
  Orders = 'orders',
  OrderDetail = 'order-detail',
  OrderConfirmation = 'order-confirmation',
  OrderTracker = 'track-order',
  AdminLogin = 'admin',
  OrderHistory = 'order-history',
  AdminOrders = 'admin-orders',
  AdminLeads = 'admin-leads',
  AdminOverview = 'admin-overview',
  CustomerAuth = 'customer-auth',
  CustomerProfile = 'customer-profile',
  AdminProfile = 'admin-profile',
  AdminInventory = 'admin-inventory',
  AdminNotifications = 'admin-notifications',
  MailHub = 'mail-hub',
  PrivacyPolicy = 'privacy-policy',
  TermsOfService = 'terms-of-service',
  ShippingInfo = 'shipping-info'
}

export interface Lead {
  id: string;
  type: 'consultation' | 'inspection' | 'lab-audit' | 'payment-notification' | 'deletion-request' | 'general-inquiry';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  location?: string;
  issue?: string;
  auditDate?: string;
  cost?: number;
  projectType?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved' | 'approved' | 'rejected' | 'pending' | 'accepting' | 'alternate-days';
  createdAt: string;
  planName?: string;
  selectedPlan?: string;
  amount?: number;
  reason?: string;
  adminDecision?: string;
  chatHistory?: {
    sender: 'admin' | 'customer';
    message: string;
    timestamp: string;
  }[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  maintenance: 'Low' | 'Medium' | 'High';
  light: 'Direct' | 'Indirect' | 'Shade';
  description: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock?: number;
  outOfStock?: boolean;
  isArchived?: boolean;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  content: string;
  publishDate?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId?: number;
  shippingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: 'card' | 'upi' | 'bank-transfer';
  lastFour?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  deletionRequested?: boolean;
}

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone?: string;
  emailNotifications?: boolean;
}

export interface Notification {
  id: number;
  customerId: number;
  orderNumber: string;
  type: string;
  title?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  targetPage?: string;
  targetId?: string;
}


export interface AssistantData {
  userType: string;
  location: string;
  environment: string;
  budget: string;
  features: string[];
}
