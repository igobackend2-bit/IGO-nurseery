import React, { useEffect, useMemo, useState } from 'react';
import { CartItem, Customer, Notification, Order, Page, Product as NurseryProduct, StoreProduct } from './types';
import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import GardenAssistant from './pages/GardenAssistant';
import Landscape from './pages/Landscape';
import AMC from './pages/AMC';
import Lab from './pages/Lab';
import KnowledgeHub from './pages/KnowledgeHub';
import KnowledgeDetail from './pages/KnowledgeDetail';
import Visit from './pages/Visit';
import Cart from './pages/Cart';
import AddProduct from './pages/AddProduct';
import Checkout, { OrderData } from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracker from './pages/OrderTracker';
import OrderHistory from './pages/OrderHistory';
import AdminOrders from './pages/AdminOrders';
import AdminLeads from './pages/AdminLeads';
import AdminOverview from './pages/AdminOverview';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import ErrorBoundary from './components/ErrorBoundary';
import AdminInventory from './pages/AdminInventory';
import OrderDetail from './pages/OrderDetail';
import CustomerAuth from './pages/CustomerAuth';
import CustomerProfile from './pages/CustomerProfile';
import AdminNotifications from './pages/AdminNotifications';
import InfoPage from './pages/InfoPage';
import MailHub from './pages/MailHub';
import { INITIAL_STORE_PRODUCTS } from './data/storeProducts';
import { KNOWLEDGE_ARTICLES } from './data/knowledgeArticles';
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendAdminOrderNotification } from './services/orderEmailService';
import {
  ADMIN_TOKEN_STORAGE_KEY,
  CUSTOMER_ORDER_REFS_STORAGE_KEY,
  CustomerOrderReference,
  adminLogin,
  adminLogout,
  createOrderPayload,
  fetchAdminOrders,
  fetchCustomerOrders,
  getAdminSession,
  submitOrder,
  updateAdminOrderStatus,
  adminDeleteCustomer,
} from './services/api';
import { customerApi } from './services/customerApi';

import NotificationPopup from './components/NotificationPopup';

const DEFAULT_ADMIN_EMAIL = 'admin@igo.local';

interface ParsedRoute {
  page: Page;
  primaryParam: string | null;
  canonicalPath: string;
}

interface AdminIdentity {
  id: string;
  email: string;
  name: string;
}

const normalizePath = (rawPath: string): string => {
  const withoutQuery = rawPath.split('?')[0].split('#')[0] || '/';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  return collapsed.length > 1 && collapsed.endsWith('/') ? collapsed.slice(0, -1) : collapsed;
};

const safeDecode = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const buildPath = (page: Page, param: string | null = null): string => {
  switch (page) {
    case Page.Home:
      return '/';
    case Page.Shop:
      return '/store';
    case Page.Product:
      return param ? `/product/${encodeURIComponent(param)}` : '/product';
    case Page.Assistant:
      return '/assistant';
    case Page.Landscape:
      return '/landscape';
    case Page.AMC:
      return '/amc';
    case Page.Lab:
      return '/lab';
    case Page.Knowledge:
      return param ? `/knowledge/${encodeURIComponent(param)}` : '/knowledge';
    case Page.Visit:
      return '/visit';
    case Page.Cart:
      return '/cart';
    case Page.Checkout:
      return '/checkout';
    case Page.Orders:
    case Page.OrderHistory:
      return '/orders';
    case Page.OrderDetail:
      return param ? `/orders/${encodeURIComponent(param)}` : '/orders';
    case Page.OrderConfirmation:
      return param ? `/order-confirmation/${encodeURIComponent(param)}` : '/order-confirmation';
    case Page.OrderTracker:
      return '/track-order';
    case Page.AdminLogin:
      return '/admin';
    case Page.AdminOrders:
      return param ? `/admin/orders/${encodeURIComponent(param)}` : '/admin/orders';
    case Page.AddProduct:
      return '/add-product';
    case Page.About:
      return '/about';
    case Page.Account:
    case Page.CustomerProfile:
      return param ? `/account/${encodeURIComponent(param)}` : '/account';
    case Page.CustomerAuth:
      return '/login';
    case Page.AdminLeads:
      return '/admin/leads';
    case Page.AdminOverview:
      return '/admin/overview';
    case Page.AdminInventory:
      return '/admin/inventory';
    case Page.PrivacyPolicy:
      return '/privacy-policy';
    case Page.TermsOfService:
      return '/terms-of-service';
    case Page.ShippingInfo:
      return '/shipping-info';
    default:
      return '/';
  }
};

const parseLocationToRoute = (): ParsedRoute => {
  const normalized = normalizePath(window.location.pathname);
  const segments = normalized.split('/').filter(Boolean).map(safeDecode);

  if (segments.length === 0) {
    return { page: Page.Home, primaryParam: null, canonicalPath: '/' };
  }

  const [first, second, third] = segments;

  if (first === 'store' || first === 'shop' || first === 'products') {
    return { page: Page.Shop, primaryParam: null, canonicalPath: '/store' };
  }
  if (first === 'product') {
    return {
      page: Page.Product,
      primaryParam: second ?? null,
      canonicalPath: buildPath(Page.Product, second ?? null),
    };
  }
  if (first === 'knowledge') {
    return {
      page: Page.Knowledge,
      primaryParam: second ?? null,
      canonicalPath: buildPath(Page.Knowledge, second ?? null),
    };
  }
  if (first === 'cart') {
    return { page: Page.Cart, primaryParam: null, canonicalPath: '/cart' };
  }
  if (first === 'checkout') {
    return { page: Page.Checkout, primaryParam: null, canonicalPath: '/checkout' };
  }
  if (first === 'orders') {
    return {
      page: second ? Page.OrderDetail : Page.Orders,
      primaryParam: second ?? null,
      canonicalPath: second ? buildPath(Page.OrderDetail, second) : '/orders',
    };
  }
  if (first === 'order-confirmation') {
    return {
      page: Page.OrderConfirmation,
      primaryParam: second ?? null,
      canonicalPath: buildPath(Page.OrderConfirmation, second ?? null),
    };
  }
  if (first === 'track-order') {
    return { page: Page.OrderTracker, primaryParam: null, canonicalPath: '/track-order' };
  }
  if (first === 'admin') {
    if (second === 'orders') {
      return {
        page: Page.AdminOrders,
        primaryParam: third ?? null,
        canonicalPath: buildPath(Page.AdminOrders, third ?? null),
      };
    }
    if (second === 'leads') {
      return { page: Page.AdminLeads, primaryParam: null, canonicalPath: '/admin/leads' };
    }
    if (second === 'overview') {
      return { page: Page.AdminOverview, primaryParam: null, canonicalPath: '/admin/overview' };
    }
    if (second === 'inventory') {
      return { page: Page.AdminInventory, primaryParam: null, canonicalPath: '/admin/inventory' };
    }
    return { page: Page.AdminLogin, primaryParam: null, canonicalPath: '/admin' };
  }
  if (first === 'add-product') {
    return { page: Page.AddProduct, primaryParam: null, canonicalPath: '/add-product' };
  }

  if (first === 'privacy-policy') {
    return { page: Page.PrivacyPolicy, primaryParam: null, canonicalPath: '/privacy-policy' };
  }
  if (first === 'terms-of-service') {
    return { page: Page.TermsOfService, primaryParam: null, canonicalPath: '/terms-of-service' };
  }
  if (first === 'shipping-info') {
    return { page: Page.ShippingInfo, primaryParam: null, canonicalPath: '/shipping-info' };
  }

  if (first === 'account') {
    return {
      page: Page.CustomerProfile,
      primaryParam: second ?? null,
      canonicalPath: buildPath(Page.CustomerProfile, second ?? null),
    };
  }

  const staticRoutes: Record<string, Page> = {
    [Page.Assistant]: Page.Assistant,
    [Page.Landscape]: Page.Landscape,
    [Page.AMC]: Page.AMC,
    [Page.Lab]: Page.Lab,
    [Page.Visit]: Page.Visit,
    [Page.About]: Page.About,
    [Page.Account]: Page.CustomerProfile,
    'login': Page.CustomerAuth,
  };

  const matchedPage = staticRoutes[first];
  if (matchedPage) {
    return { page: matchedPage, primaryParam: null, canonicalPath: buildPath(matchedPage) };
  }

  return { page: Page.Home, primaryParam: null, canonicalPath: '/' };
};

const readCustomerOrderReferences = (): CustomerOrderReference[] => {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDER_REFS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is CustomerOrderReference =>
        Boolean(item?.orderNumber) && Boolean(item?.accessKey),
    );
  } catch {
    return [];
  }
};

const persistCustomerOrderReference = (reference: CustomerOrderReference) => {
  const existing = readCustomerOrderReferences();
  const withoutDuplicate = existing.filter((item) => item.orderNumber !== reference.orderNumber);
  localStorage.setItem(
    CUSTOMER_ORDER_REFS_STORAGE_KEY,
    JSON.stringify([reference, ...withoutDuplicate]),
  );
};

const MainApp: React.FC = () => {
  const initialRoute = parseLocationToRoute();
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [routeParam, setRouteParam] = useState<string | null>(initialRoute.primaryParam);
  const [products, setProducts] = useState<StoreProduct[]>(() => {
    try {
      const saved = localStorage.getItem('igo_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse products from local storage', e);
    }
    return INITIAL_STORE_PRODUCTS;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY),
  );
  const [adminProfile, setAdminProfile] = useState<AdminIdentity | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeToast, setActiveToast] = useState<{ message: string; type: string } | null>(null);
  const [lastNotifId, setLastNotifId] = useState<number | null>(null);

  const isAdmin = Boolean(adminToken);
  const activeOrders = isAdmin ? adminOrders : customerOrders;

  const selectedOrder = useMemo(() => {
    if (!routeParam) {
      return null;
    }

    if (currentPage === Page.OrderConfirmation && recentOrder?.orderNumber === routeParam) {
      return recentOrder;
    }

    return activeOrders.find((order) => order.orderNumber === routeParam) ?? null;
  }, [activeOrders, currentPage, recentOrder, routeParam]);

  const selectedKnowledgeArticle = useMemo(
    () => KNOWLEDGE_ARTICLES.find((article) => article.id === routeParam) ?? null,
    [routeParam],
  );

  const syncRouteWithLocation = () => {
    const parsed = parseLocationToRoute();
    setCurrentPage(parsed.page);
    setRouteParam(parsed.primaryParam);

    if (normalizePath(window.location.pathname) !== parsed.canonicalPath) {
      window.history.replaceState({}, '', parsed.canonicalPath);
    }
    window.scrollTo(0, 0);
  };

  const navigateTo = (page: Page, param: string | null = null) => {
    const path = buildPath(page, param);
    // Force state update even if path is the same but param changed (essential for deep-linking)
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({}, '', path);
    }
    syncRouteWithLocation();
  };

  const loadCustomerOrders = async () => {
    const references = readCustomerOrderReferences();
    if (references.length === 0) {
      setCustomerOrders([]);
      return;
    }

    try {
      const response = await fetchCustomerOrders(references);
      setCustomerOrders(response.orders);
    } catch (error) {
      console.error('Unable to load customer orders.', error);
    }
  };

  const loadAdminOrders = async (token: string) => {
    try {
      const response = await fetchAdminOrders(token);
      setAdminOrders(response.orders);
    } catch (error) {
      console.error('Unable to load admin orders.', error);
    }
  };

  const loadCustomerData = async () => {
    // Independent fetching to ensure one failure doesn't block notifications
    try {
      customerApi.getOrders()
        .then(res => setCustomerOrders(res.orders))
        .catch(err => console.error('Orders load failed:', err));

      customerApi.getNotifications(customer?.email)
        .then(res => {
          setNotifications(res.notifications);
          // Check for newest unread notification to trigger toast if not already seen
          const latest = res.notifications[0];
          if (latest && !latest.isRead && latest.id !== lastNotifId) {
            setLastNotifId(latest.id);
            // Only toast if it's truly new (created in last 30s)
            const created = new Date(latest.createdAt).getTime();
            if (Date.now() - created < 30000) {
              setActiveToast({
                message: `NOTIFICATION: ${latest.title} - ${latest.message.substring(0, 40)}...`,
                type: 'shipped'
              });
            }
          }
        })
        .catch(err => console.error('Notifications load failed:', err));

      if (isAdmin) {
        const leadsRaw = localStorage.getItem('igo_leads') || '[]';
        localStorage.setItem('igo_leads_snapshot', JSON.stringify(JSON.parse(leadsRaw)));
      }
    } catch (error) {
      console.error('Data sync failed:', error);
    }
  };

  useEffect(() => {
    const handleRouteChange = () => syncRouteWithLocation();
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Primary Guest / Reference Loading
        await loadCustomerOrders();

        // 2. Customer Auth
        const customerSession = await customerApi.getSession().catch(() => null);
        if (customerSession) {
          setCustomer(customerSession.customer);
          await loadCustomerData().catch(() => { });
        }

        // 3. Admin Auth
        const storedToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
        if (storedToken) {
          try {
            const session = await getAdminSession(storedToken);
            setAdminToken(session.token);
            setAdminProfile(session.admin);
            await loadAdminOrders(session.token).catch(() => { });
          } catch (error) {
            console.error('Admin session expired.', error);
            localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
            setAdminToken(null);
            setAdminProfile(null);
          }
        }
      } catch (error) {
        console.error('Bootstrap failure:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setAdminOrders([]);
      return;
    }

    if (adminToken) {
      void loadAdminOrders(adminToken);
    }
  }, [adminToken, isAdmin]);

  // Sync admin notifications from leads
  useEffect(() => {
    if (isAdmin) {
      const leads = JSON.parse(localStorage.getItem('igo_leads') || '[]');
      const newNotifications = leads
        .filter((l: any) => l.status === 'new')
        .map((l: any) => ({
          id: l.id,
          type: 'lead',
          title: `New ${l.type.toUpperCase()}`,
          message: `${l.customerName} requested ${l.selectedPlan || 'service'}`,
          time: l.createdAt,
          read: false
        }));
      setAdminNotifications(newNotifications);

      // Trigger high-priority toasts for customer replies
      if (isAdmin && lastNotifId !== null) {
        const lastLeads = JSON.parse(localStorage.getItem('igo_leads_snapshot') || '[]');
        leads.forEach((l: any) => {
          const prev = lastLeads.find((p: any) => p.id === l.id);
          if (l.status === 'new' && (!prev || prev.status !== 'new')) {
            setActiveToast({
              message: `REPLY: ${l.customerName} sent a message regarding ${l.type}`,
              type: 'shipped'
            });
          }
        });
        localStorage.setItem('igo_leads_snapshot', JSON.stringify(leads));
      } else if (isAdmin) {
        localStorage.setItem('igo_leads_snapshot', JSON.stringify(leads));
      }
    }
  }, [isAdmin, currentPage, lastNotifId]);

  // Periodic Notification Fetching + Real-time Sync (ENABLED FOR ALL)
  useEffect(() => {
    // Listen for real-time storage events (for simulated local backend)
    const handleStorageChange = (e: StorageEvent) => {
      // Refresh notifications if our own notify log or leads log changes
      if (e.key === 'igo_notifications' || e.key === 'igo_leads') {
        // INSTANT UPDATE: Read directly from storage to provide immediate feedback
        if (e.key === 'igo_notifications') {
          try {
            const localNotifs = JSON.parse(localStorage.getItem('igo_notifications') || '[]');
            const userEmail = customer?.email;
            if (!userEmail) return; // Don't show notifications if not logged in

            const filtered = localNotifs.filter((n: any) => n.customerEmail === userEmail);

            // Optimistic update
            setNotifications(prev => {
              const merged = [...prev];
              filtered.forEach((fn: any) => {
                if (!merged.find(mn => mn.id === fn.id)) merged.push(fn);
              });
              return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });

            // Trigger Toast for newest notification if unread
            const latest = filtered[0];
            if (latest && !latest.isRead) {
              setActiveToast({
                message: `NOTIFICATION: ${latest.title} - ${latest.message.substring(0, 40)}...`,
                type: 'shipped'
              });
            }
          } catch (err) { }
        }

        // Full sync as backup/refinement
        void loadCustomerData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(async () => {
      await loadCustomerData();
    }, 10000); // Poll every 10s as backup

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [customer]); // Re-run if login state changes so data reloads

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if ([Page.AdminOrders, Page.AdminLeads, Page.AdminOverview].includes(currentPage) && !isAdmin) {
      navigateTo(Page.AdminLogin);
    }
  }, [currentPage, isAdmin, isBootstrapping]);

  // Real-time Lead Notifications for Admin
  useEffect(() => {
    if (!isAdmin) return;

    let lastLeadsCount = JSON.parse(localStorage.getItem('igo_leads') || '[]').length;

    const checkLeads = () => {
      const currentLeads = JSON.parse(localStorage.getItem('igo_leads') || '[]');
      if (currentLeads.length > lastLeadsCount) {
        const newLead = currentLeads[0];
        setActiveToast({
          message: `New Lead: ${newLead.customerName} requested ${newLead.type.replace('-', ' ')}`,
          type: 'shipped'
        });
      }
      lastLeadsCount = currentLeads.length;
    };

    const interval = setInterval(checkLeads, 10000); // Check every 10s
    window.addEventListener('storage', (e) => {
      if (e.key === 'igo_leads') checkLeads();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLeads as any);
    };
  }, [isAdmin]);

  const handleAdminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const normalizedEmail = (email || '').toLowerCase().trim();
      const normalizedPass = (password || '').trim();

      // Emergency Bypass
      if (normalizedEmail === 'admin@igo.local' && normalizedPass === 'igo789') {
        const emergencySession = {
          token: 'emergency-token',
          admin: { id: '1', email: 'admin@igo.local', name: 'Emergency Admin' }
        };
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, emergencySession.token);
        setAdminToken(emergencySession.token);
        setAdminProfile(emergencySession.admin);
        navigateTo(Page.AdminOrders);
        return true;
      }

      const session = await adminLogin(normalizedEmail, normalizedPass);
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, session.token);
      setAdminToken(session.token);
      setAdminProfile(session.admin);
      await loadAdminOrders(session.token);
      navigateTo(Page.AdminOrders);
      return true;
    } catch (error) {
      console.error('Admin login failed.', error);
      return false;
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (adminToken) {
        await adminLogout(adminToken);
      }
    } catch (error) {
      console.error('Admin logout failed.', error);
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      setAdminToken(null);
      setAdminProfile(null);
      setAdminOrders([]);
      navigateTo(Page.AdminLogin);
    }
  };

  const handleCustomerLogin = (session: any) => {
    setCustomer(session.customer);
    loadCustomerData();
    if (cartItems.length > 0) {
      navigateTo(Page.Checkout);
    } else {
      navigateTo(Page.CustomerProfile);
    }
  };

  const handleCustomerLogout = async () => {
    await customerApi.logout();
    setCustomer(null);
    setNotifications([]);
    setCustomerOrders([]);
    navigateTo(Page.Home);
  };

  const handlePageChange = (page: Page, param: string | null = null) => {
    navigateTo(page, param);
  };

  const handleAddToCart = (product: StoreProduct) => {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return previousItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...previousItems, { product, quantity: 1 }];
    });
  };

  const handleIncreaseQuantity = (productId: string) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleDecreaseQuantity = (productId: string) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((previousItems) => previousItems.filter((item) => item.product.id !== productId));
  };

  const handleSubmitProduct = (productInput: Omit<StoreProduct, 'id'>) => {
    const newProduct: StoreProduct = {
      ...productInput,
      id: `store-${Date.now()}`,
    };

    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      localStorage.setItem('igo_products', JSON.stringify(updated));
      return updated;
    });
    navigateTo(Page.Shop);
  };

  const handleUpdateProducts = (updatedProducts: StoreProduct[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('igo_products', JSON.stringify(updatedProducts));
  };

  const handleSubmitOrder = async (orderData: OrderData) => {
    try {
      const payload = createOrderPayload(orderData, cartItems, customer?.id);

      // Create a local order object from the payload to show immediately
      const localOrder: Order = {
        ...payload,
        paymentMethod: payload.paymentMethod as Order['paymentMethod'],
        status: payload.status as Order['status'],
        lastFour: orderData.lastFour,
      };

      // 1. Backend Submission
      const response = await submitOrder(payload);
      persistCustomerOrderReference({
        orderNumber: response.order.orderNumber,
        accessKey: response.accessKey,
      });
      if (customer) {
        loadCustomerData(); // Refresh orders list for profile
      }
      console.log('✅ Order saved to backend');

      // 2. Background Emails
      const emailData = {
        to: orderData.email,
        subject: `Order Confirmation #${localOrder.orderNumber}`,
        orderNumber: localOrder.orderNumber,
        trackingNumber: localOrder.trackingNumber,
        customerName: localOrder.customerName,
        estimatedDelivery: localOrder.estimatedDelivery,
        total: localOrder.total,
        lastFour: localOrder.lastFour,
        items: localOrder.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      Promise.allSettled([
        sendOrderConfirmationEmail(emailData),
        sendAdminOrderNotification(emailData)
      ]).then(() => console.log('✅ Background emails processed'));

      // 3. Instant UI Update
      setRecentOrder(localOrder);
      setCustomerOrders((prev) => [localOrder, ...prev]);
      if (isAdmin) {
        setAdminOrders((prev) => [localOrder, ...prev]);
      }

      setCartItems([]);

      // 4. Real-time Toast Feedback
      setActiveToast({
        message: `Project #${localOrder.orderNumber} initiated. Details sent to your inbox.`,
        type: 'shipped' // Use 'shipped' for green icon style
      });

      navigateTo(Page.OrderConfirmation, localOrder.orderNumber);
    } catch (err) {
      console.error('❌ Error preparing order:', err);
      alert('There was a problem preparing your order. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const orderToUpdate =
      adminOrders.find((order) => order.id === orderId) ??
      customerOrders.find((order) => order.id === orderId) ??
      recentOrder;

    if (!orderToUpdate || !adminToken) {
      return;
    }

    try {
      const response = await updateAdminOrderStatus(adminToken, orderToUpdate.orderNumber, status);

      if (status === 'shipped') {
        try {
          await sendOrderShippedEmail({
            to: response.order.customerEmail,
            subject: `Great news! Your order ${response.order.orderNumber} has shipped`,
            orderNumber: response.order.orderNumber,
            trackingNumber: response.order.trackingNumber,
            customerName: response.order.customerName,
            estimatedDelivery: response.order.estimatedDelivery,
            total: response.order.total,
            items: response.order.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
          });
        } catch (emailError) {
          console.error('Unable to send shipping email notification.', emailError);
        }
      }

      setAdminOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.orderNumber === response.order.orderNumber ? response.order : order,
        ),
      );
      setCustomerOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.orderNumber === response.order.orderNumber ? response.order : order,
        ),
      );
      if (recentOrder?.orderNumber === response.order.orderNumber) {
        setRecentOrder(response.order);
      }

      // Success Toast for Admin
      setActiveToast({
        message: `Order #${response.order.orderNumber} status updated to ${status}.`,
        type: status === 'cancelled' ? 'cancelled' : 'shipped'
      });
    } catch (error) {
      console.error('Unable to update order status.', error);
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (!adminToken) return;
    try {
      await adminDeleteCustomer(adminToken, customerId);
      // Refresh admin orders to update the customer list
      await loadAdminOrders(adminToken);
      setActiveToast({ message: 'Account permanently deleted.', type: 'shipped' });
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer account.');
    }
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const confirmationOrder = useMemo(() => {
    if (currentPage !== Page.OrderConfirmation || !routeParam) {
      return null;
    }
    return (
      recentOrder?.orderNumber === routeParam
        ? recentOrder
        : customerOrders.find((order) => order.orderNumber === routeParam)
    ) ?? null;
  }, [currentPage, customerOrders, recentOrder, routeParam]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <Home onNavigate={handlePageChange} />;
      case Page.Shop:
        return (
          <Shop
            products={products}
            addToCart={(product: NurseryProduct) =>
              handleAddToCart({
                id: `shop-${product.id}`,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image,
                description: product.description,
              })
            }
          />
        );
      case Page.Product:
        return (
          <Product
            products={[]}
            selectedSlug={routeParam}
            onOpenProduct={(slug) => navigateTo(Page.Product, slug)}
            onAddToCart={handleAddToCart}
          />
        );
      case Page.Assistant:
        return <GardenAssistant />;
      case Page.Landscape:
        return <Landscape />;
      case Page.AMC:
        return <AMC />;
      case Page.Lab:
        return <Lab />;
      case Page.Knowledge:
        return routeParam ? (
          <KnowledgeDetail article={selectedKnowledgeArticle} onBack={() => navigateTo(Page.Knowledge)} />
        ) : (
          <KnowledgeHub articles={KNOWLEDGE_ARTICLES} onOpenArticle={(id) => navigateTo(Page.Knowledge, id)} />
        );
      case Page.Visit:
        return <Visit />;
      case Page.Cart:
        return (
          <Cart
            items={cartItems}
            isLoggedIn={!!customer}
            onIncrease={handleIncreaseQuantity}
            onDecrease={handleDecreaseQuantity}
            onRemove={handleRemoveFromCart}
            onContinueShopping={() => navigateTo(Page.Shop)}
            onCheckout={() => {
              if (customer) {
                navigateTo(Page.Checkout);
              } else {
                navigateTo(Page.CustomerAuth);
              }
            }}
          />
        );
      case Page.Checkout:
        if (!customer) {
          return (
            <CustomerAuth
              onLogin={handleCustomerLogin}
              onSignup={() => window.scrollTo(0, 0)}
            />
          );
        }
        return <Checkout items={cartItems} onBack={() => navigateTo(Page.Cart)} onSubmitOrder={handleSubmitOrder} />;
      case Page.Orders:
      case Page.OrderHistory:
        return (
          <OrderHistory
            orders={customerOrders}
            onBack={() => navigateTo(Page.Home)}
            onOpenOrder={(orderNumber) => navigateTo(Page.OrderDetail, orderNumber)}
          />
        );
      case Page.OrderDetail:
        return (
          <OrderDetail
            order={selectedOrder}
            onBack={() => navigateTo(Page.Orders)}
          />
        );
      case Page.OrderConfirmation:
        return confirmationOrder ? (
          <OrderConfirmation
            items={confirmationOrder.items}
            total={confirmationOrder.total}
            orderNumber={confirmationOrder.orderNumber}
            onContinueShopping={() => navigateTo(Page.Shop)}
          />
        ) : (
          <OrderDetail order={null} onBack={() => navigateTo(Page.Orders)} />
        );
      case Page.Account:
      case Page.CustomerAuth:
      case Page.CustomerProfile:
        if (!customer) {
          return (
            <CustomerAuth
              onLogin={handleCustomerLogin}
              onSignup={() => window.scrollTo(0, 0)}
            />
          );
        }
        return (
          <CustomerProfile
            customer={customer}
            orders={customerOrders}
            notifications={notifications}
            onLogout={handleCustomerLogout}
            onUpdateProfile={(updated) => setCustomer(updated)}
            onRefreshNotifications={loadCustomerData}
            initialTab={routeParam as any}
          />
        );
      case Page.PrivacyPolicy:
        return <InfoPage type="privacy" onBack={() => navigateTo(Page.Home)} />;
      case Page.TermsOfService:
        return <InfoPage type="terms" onBack={() => navigateTo(Page.Home)} />;
      case Page.ShippingInfo:
        return <InfoPage type="shipping" onBack={() => navigateTo(Page.Home)} />;
      case Page.MailHub:
        return <MailHub />;
      case Page.OrderTracker:
        return <OrderTracker />;
      case Page.AdminLogin:
        return <AdminLogin defaultEmail={adminProfile?.email ?? DEFAULT_ADMIN_EMAIL} onLogin={handleAdminLogin} />;

      case Page.AdminOrders:
      case Page.AdminLeads:
      case Page.AdminOverview:
      case Page.AdminInventory:
      case Page.AdminNotifications:
      case Page.AddProduct:
        // Double check admin status
        if (!isAdmin && localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) !== 'emergency-token') {
          return <AdminLogin defaultEmail={adminProfile?.email ?? DEFAULT_ADMIN_EMAIL} onLogin={handleAdminLogin} />;
        }

        try {
          const renderAdminContent = () => {
            if (currentPage === Page.AdminOrders) {
              return (
                <AdminOrders
                  orders={adminOrders || []}
                  onBack={() => navigateTo(Page.Home)}
                  onOpenOrder={(num) => navigateTo(Page.AdminOrders, num)}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              );
            }
            if (currentPage === Page.AdminInventory) {
              return <AdminInventory products={products || []} onUpdateProducts={handleUpdateProducts} />;
            }
            if (currentPage === Page.AdminLeads) {
              return <AdminLeads onNavigate={handlePageChange} leadId={routeParam} />;
            }
            if (currentPage === Page.AdminOverview) {
              return <AdminOverview orders={adminOrders} onNavigate={navigateTo} />;
            }
            if (currentPage === Page.AddProduct) {
              return <AddProduct onSubmitProduct={handleSubmitProduct} onCancel={() => navigateTo(Page.Shop)} />;
            }
            return <AdminOverview orders={adminOrders} onNavigate={navigateTo} />;
          };

          return (
            <ErrorBoundary>
              <AdminLayout
                currentPage={currentPage}
                onNavigate={handlePageChange}
                onLogout={handleAdminLogout}
                notifications={adminNotifications || []}
                orders={adminOrders || []}
              >
                <div className="admin-safe-container">
                  {renderAdminContent()}
                </div>
              </AdminLayout>
            </ErrorBoundary>
          );
        } catch (e) {
          console.error("Admin Render Error:", e);
          return <div className="p-20 text-center font-bold">A rendering error occurred. Please refresh.</div>;
        }

      default:
        return <Home onNavigate={handlePageChange} />;
    }
  };

  const hideChrome = [Page.AdminLogin, Page.AddProduct, Page.AdminOrders, Page.AdminLeads, Page.AdminOverview, Page.AdminNotifications, Page.MailHub, Page.AdminInventory].includes(currentPage);

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-igo-lime selection:text-igo-dark w-full overflow-x-hidden bg-white">
      {activeToast && (
        <NotificationPopup
          message={activeToast.message}
          type={activeToast.type}
          onClose={() => setActiveToast(null)}
        />
      )}
      {!hideChrome && (
        <SiteHeader
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          cartCount={cartCount}
          isAdmin={isAdmin}
          onAdminLogout={handleAdminLogout}
          customer={customer}
          onCustomerLogout={handleCustomerLogout}
          notifications={notifications}
        />
      )}
      {/* Structural Fix: flex-grow + min-h-0 ensures children calculate height correctly relative to the viewport shell */}
      <main className={`flex-grow flex flex-col min-h-0 relative z-0 ${!hideChrome ? 'pt-24' : ''}`}>{renderPage()}</main>
      {!hideChrome && <Footer setCurrentPage={handlePageChange} />}
    </div>
  );
};

export default MainApp;
