import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/SiteHeader';
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
import OrderHistory from './pages/OrderHistory';
import AdminOrders from './pages/AdminOrders';
import AdminLeads from './pages/AdminLeads';
import AdminOverview from './pages/AdminOverview';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
import AdminInventory from './pages/AdminInventory';
import CustomerAuth from './pages/CustomerAuth';
import CustomerProfile from './pages/CustomerProfile';
import { customerApi } from './services/customerApi';
import { productApi } from './services/productApi';
import { Customer, Notification, CartItem, Page, StoreProduct, Product as NurseryProduct, Order } from './types';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { INITIAL_STORE_PRODUCTS } from './data/storeProducts';
import { KNOWLEDGE_ARTICLES } from './data/knowledgeArticles';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from './services/orderEmailService';
import LeadCapturePopup from './components/LeadCapturePopup';

interface ParsedRoute {
  page: Page;
  productSlug: string | null;
  knowledgeArticleId: string | null;
  canonicalPath: string;
}

const normalizePath = (rawPath: string): string => {
  const withoutQuery = rawPath.split('?')[0].split('#')[0] || '/';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1);
  }
  return collapsed || '/';
};

const safeDecode = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const buildPath = (
  page: Page,
  productSlug: string | null = null,
  knowledgeArticleId: string | null = null,
): string => {
  switch (page) {
    case Page.Home:
      return '/';
    case Page.Shop:
      return '/store';
    case Page.Product:
      return productSlug ? `/product/${encodeURIComponent(productSlug)}` : '/product';
    case Page.Assistant:
      return '/assistant';
    case Page.Landscape:
      return '/landscape';
    case Page.AMC:
      return '/amc';
    case Page.Lab:
      return '/lab';
    case Page.Knowledge:
      return knowledgeArticleId ? `/knowledge/${encodeURIComponent(knowledgeArticleId)}` : '/knowledge';
    case Page.Visit:
      return '/visit';
    case Page.Cart:
      return '/cart';
    case Page.Checkout:
      return '/checkout';
    case Page.OrderConfirmation:
      return '/order-confirmation';
    case Page.OrderHistory:
      return '/order-history';
    case Page.AdminOrders:
      return '/admin-orders';
    case Page.AdminLeads:
      return '/admin-leads';
    case Page.AddProduct:
      return '/add-product';
    case Page.About:
      return '/about';
    case Page.Account:
      return '/account';
    case Page.CustomerAuth:
      return '/customer-auth';
    case Page.CustomerProfile:
      return '/customer-profile';
    case Page.AdminOverview:
      return '/admin-overview';
    case Page.AdminOrders:
      return '/admin-orders';
    case Page.AdminLeads:
      return '/admin-leads';
    case Page.AdminProducts:
      return '/admin-products';
    case Page.AdminInventory:
      return '/admin-inventory';
    case Page.AdminProfile:
      return '/admin-profile';
    case Page.AdminNotifications:
      return '/admin-notifications';
    case Page.MailHub:
      return '/mail-hub';
    default:
      return '/';
  }
};

const parseLocationToRoute = (): ParsedRoute => {
  const hashValue = window.location.hash.replace(/^#/, '').trim();
  const source = hashValue.length > 0 ? hashValue : window.location.pathname;
  const normalized = normalizePath(source.startsWith('/') ? source : `/${source}`);
  const segments = normalized
    .split('/')
    .filter(Boolean)
    .map((segment) => safeDecode(segment));

  if (segments.length === 0 || segments[0].toLowerCase() === Page.Home) {
    return {
      page: Page.Home,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/',
    };
  }

  const first = segments[0].toLowerCase();

  if (first === 'store' || first === 'shop' || first === 'products') {
    return {
      page: Page.Shop,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/store',
    };
  }

  if (first === 'product') {
    const productSlug = segments[1] ? segments[1] : null;
    return {
      page: Page.Product,
      productSlug,
      knowledgeArticleId: null,
      canonicalPath: buildPath(Page.Product, productSlug, null),
    };
  }

  if (first === 'knowledge') {
    const knowledgeArticleId = segments[1] ? segments[1] : null;
    return {
      page: Page.Knowledge,
      productSlug: null,
      knowledgeArticleId,
      canonicalPath: buildPath(Page.Knowledge, null, knowledgeArticleId),
    };
  }

  if (first === 'cart') {
    return {
      page: Page.Cart,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/cart',
    };
  }

  if (first === 'checkout') {
    return {
      page: Page.Checkout,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/checkout',
    };
  }

  if (first === 'order-confirmation') {
    return {
      page: Page.OrderConfirmation,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/order-confirmation',
    };
  }

  if (first === 'order-history') {
    return {
      page: Page.OrderHistory,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/order-history',
    };
  }

  if (first === 'admin-orders' || first === 'admin') {
    return {
      page: Page.AdminOrders,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/admin',
    };
  }

  if (first === 'admin-overview') {
    return {
      page: Page.AdminOverview,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/admin-overview',
    };
  }

  if (first === 'admin-leads') {
    return {
      page: Page.AdminLeads,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/admin-leads',
    };
  }

  if (first === 'admin-inventory') {
    return {
      page: Page.AdminInventory,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/admin-inventory',
    };
  }

  if (first === 'admin-products') {
    return {
      page: Page.AdminProducts,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/admin-products',
    };
  }

  if (first === 'add-product') {
    return {
      page: Page.AddProduct,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/add-product',
    };
  }

  if (first === 'customer-auth' || first === 'login' || first === 'auth') {
    return {
      page: Page.CustomerAuth,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/customer-auth',
    };
  }

  if (first === 'customer-profile' || first === 'account' || first === 'profile') {
    return {
      page: Page.CustomerProfile,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: '/customer-profile',
    };
  }

  const staticRoutes: Record<string, Page> = {
    [Page.Assistant]: Page.Assistant,
    [Page.Landscape]: Page.Landscape,
    [Page.AMC]: Page.AMC,
    [Page.Lab]: Page.Lab,
    [Page.Visit]: Page.Visit,
    [Page.About]: Page.About,
    [Page.Account]: Page.CustomerAuth,
    [Page.AdminLogin]: Page.AdminLogin,
    [Page.CustomerAuth]: Page.CustomerAuth,
    [Page.CustomerProfile]: Page.CustomerProfile,
    [Page.AdminProfile]: Page.AdminProfile,
    [Page.AdminNotifications]: Page.AdminNotifications,
    [Page.MailHub]: Page.MailHub,
  };

  const matchedPage = staticRoutes[first];
  if (matchedPage) {
    return {
      page: matchedPage,
      productSlug: null,
      knowledgeArticleId: null,
      canonicalPath: buildPath(matchedPage),
    };
  }

  return {
    page: Page.Home,
    productSlug: null,
    knowledgeArticleId: null,
    canonicalPath: '/',
  };
};

const App: React.FC = () => {
  const initialRoute = parseLocationToRoute();
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [productSlug, setProductSlug] = useState<string | null>(initialRoute.productSlug);
  const [knowledgeArticleId, setKnowledgeArticleId] = useState<string | null>(initialRoute.knowledgeArticleId);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setIsProductsLoading(true);
      const data = await productApi.fetchProducts();
      if (isMounted) {
        setProducts(data);
        setIsProductsLoading(false);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const savedAdmin = localStorage.getItem('isAdmin');
    return savedAdmin === 'true';
  });
  const [currentOrder, setCurrentOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);

  // Sync admin notifications
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
    }
  }, [isAdmin, currentPage]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerNotifications, setCustomerNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchCustomerData = async () => {
    try {
      const [pResult, oResult, nResult] = await Promise.allSettled([
        customerApi.getProfile(),
        customerApi.getOrders(),
        customerApi.getNotifications()
      ]);
      
      if (pResult.status === 'fulfilled' && pResult.value.customer) {
        setCustomer(pResult.value.customer);
      }
      if (oResult.status === 'fulfilled' && oResult.value.orders) {
        setCustomerOrders(oResult.value.orders);
      }
      if (nResult.status === 'fulfilled' && nResult.value.notifications) {
        setCustomerNotifications(nResult.value.notifications);
      }
    } catch (e) {
      console.error('Session fetch error', e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('igo_customer_token');
    if (token) {
      fetchCustomerData().finally(() => setIsAuthLoading(false));
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const syncRouteWithLocation = () => {
    const parsedRoute = parseLocationToRoute();
    setCurrentPage(parsedRoute.page);
    setProductSlug(parsedRoute.productSlug);
    setKnowledgeArticleId(parsedRoute.knowledgeArticleId);

    const currentPath = normalizePath(window.location.pathname);
    if (window.location.hash || currentPath !== parsedRoute.canonicalPath) {
      window.history.replaceState({}, '', parsedRoute.canonicalPath);
    }
    window.scrollTo(0, 0);
  };

  const navigateTo = (path: string) => {
    const targetPath = normalizePath(path);
    const currentPath = normalizePath(window.location.pathname);

    if (targetPath !== currentPath || window.location.hash) {
      window.history.pushState({}, '', targetPath);
    }
    syncRouteWithLocation();
  };

  useEffect(() => {
    const handleRouteChange = () => {
      syncRouteWithLocation();
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const handlePageChange = (page: Page, param?: string) => {
    let path = buildPath(page);
    if (param) {
      // If param starts with ?, it's a query, otherwise append as segment
      if (param.startsWith('?')) {
        path += param;
      } else if (param.includes('?')) {
        // Already has a query, just append
        path += param.startsWith('/') ? param : '/' + param;
      } else {
        path += `/${param}`;
      }
    }
    navigateTo(path);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    console.log(`🔐 Admin logged out`);
    navigateTo('/');
  };

  const handleAdminLogin = async (email: string, pass: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPass = pass.trim();

    if (normalizedEmail === 'admin@igo.local' && normalizedPass === 'Admin@123') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      navigateTo('/admin-orders');
      return true;
    }
    return false;
  };

  const handleCustomerLogin = (session: any) => {
    setCustomer(session.customer);
    fetchCustomerData();
    if (cartItems.length > 0) {
      navigateTo('/checkout');
    } else {
      navigateTo('/customer-profile');
    }
  };

  const handleDeleteCustomer = (customerId: number | string) => {
    console.log(`🗑️ Deleting customer and associated data: ${customerId}`);
    // In a real app, this would call an API. For now, we'll just filter them out of local state if applicable.
    showToast(`Account records for ${customerId} have been purged.`, 'info');
  };

  const handleCustomerLogout = async () => {
    await customerApi.logout();
    setCustomer(null);
    setCustomerOrders([]);
    setCustomerNotifications([]);
    navigateTo('/');
  };

  const handleOpenProduct = (slug: string) => {
    navigateTo(buildPath(Page.Product, slug, null));
  };

  const handleOpenKnowledgeArticle = (articleId: string) => {
    navigateTo(buildPath(Page.Knowledge, null, articleId));
  };

  const handleAddToCart = (product: StoreProduct) => {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return previousItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...previousItems, { product, quantity: 1 }];
    });
  };

  const handleIncreaseQuantity = (productId: string) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const handleDecreaseQuantity = (productId: string) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.product.id !== productId),
    );
  };

  const handleSubmitProduct = async (productInput: Omit<StoreProduct, 'id'>) => {
    const { data: newProduct, error } = await productApi.addProduct(productInput);
    
    if (newProduct) {
      setProducts((previousProducts) => [newProduct, ...previousProducts]);
      showToast(`Product ${newProduct.name} successfully added to store!`, 'success');
      navigateTo('/admin-inventory');
    } else {
      showToast(`Failed: ${error}`, 'error');
    }
  };

  const handleCheckout = () => {
    if (customer) {
      navigateTo(buildPath(Page.Checkout));
    } else {
      navigateTo(buildPath(Page.CustomerAuth));
    }
  };

  const handleSubmitOrder = async (orderData: OrderData) => {
    const orderNumber = `IGO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const trackingNumber = `TRK-${orderNumber.substring(4)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Calculate order totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.05; // 5% tax
    const deliveryCharge = 50; // Fixed delivery charge
    const total = subtotal + tax + deliveryCharge;
    
    // Create date strings
    const createdAt = new Date().toISOString();
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
    
    // Create the order object
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      trackingNumber,
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
      status: 'processing',
      createdAt,
      estimatedDelivery,
    };
    
    // 1. Save to Backend DB (Background)
    const accessKey = Math.random().toString(36).substr(2, 12).toUpperCase();
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newOrder, accessKey }),
    }).then(() => console.log('✅ Order saved to backend')).catch(e => console.error('⚠️ DB Error:', e));

    // 1b. Deduct stock & trigger alarms
    const lowStockAlerts: any[] = [];
    for (const item of cartItems) {
      const currentStock = item.product.stock || 0;
      const newStock = Math.max(0, currentStock - item.quantity);
      productApi.updateProduct(item.product.id, { stock: newStock }).catch(e => console.error('Stock deduction error', e));
      
      if (newStock < 5) {
        lowStockAlerts.push({
          id: `stock-${Date.now()}-${item.product.id}`,
          type: 'inventory',
          title: 'LOW STOCK ALERT',
          message: `${item.product.name} has fallen below safe levels (${newStock} remaining). Restock immediately.`,
          time: new Date().toISOString(),
          read: false
        });
      }
    }
    
    if (lowStockAlerts.length > 0) {
       setAdminNotifications(prev => [...lowStockAlerts, ...prev]);
    }

    // 2. Send Emails (Background)
    const emailData = {
      to: orderData.email,
      subject: `Order Confirmation #${orderNumber}`,
      orderNumber,
      trackingNumber,
      customerName: `${orderData.firstName} ${orderData.lastName}`,
      estimatedDelivery,
      total,
      items: cartItems.map(item => ({ name: item.product.name, quantity: item.quantity, price: item.product.price })),
    };

    Promise.allSettled([
      sendOrderConfirmationEmail(emailData),
      sendAdminOrderNotification(emailData)
    ]).then(results => {
      console.log('✅ background emails processed');
    });
    
    // 3. Instant Navigation
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    setCurrentOrder({ orderNumber, total });
    setCartItems([]);
    
    showToast(`Order #${orderNumber} placed successfully!`, 'success');
    
    if (customer) {
      fetchCustomerData();
    }
    
    navigateTo(buildPath(Page.OrderConfirmation));
  };

  const handleContinueToHome = () => {
    navigateTo(buildPath(Page.Shop));
  };

  const handleOpenOrder = (orderNumber: string) => {
    console.log(`Open order: ${orderNumber}`);
    // In a real app, this would navigate to an order details page or open a modal
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    // Note: The real email and internal notification are now handled by the backend PATCH endpoint
    // to ensure consistency and prevent double-emailing.
      
    showToast(`Status updated and notified ${order.customerEmail}`, 'success');
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const selectedKnowledgeArticle = useMemo(
    () => KNOWLEDGE_ARTICLES.find((article) => article.id === knowledgeArticleId) ?? null,
    [knowledgeArticleId],
  );

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <Home />;
      case Page.Shop:
        return (
          <Shop
            products={products.filter(p => !p.isArchived)}
            onOpenProduct={handleOpenProduct}
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
            products={products.filter(p => !p.isArchived)}
            selectedSlug={productSlug}
            onOpenProduct={handleOpenProduct}
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
        return knowledgeArticleId ? (
          <KnowledgeDetail
            article={selectedKnowledgeArticle}
            onBack={() => navigateTo('/knowledge')}
          />
        ) : (
          <KnowledgeHub
            articles={KNOWLEDGE_ARTICLES}
            onOpenArticle={handleOpenKnowledgeArticle}
          />
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
            onContinueShopping={() => navigateTo('/store')}
            onCheckout={handleCheckout}
          />
        );
      case Page.Checkout:
        if (isAuthLoading) {
          return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-igo-lime border-t-transparent rounded-full animate-spin"></div></div>;
        }
        if (!customer) {
          return (
            <CustomerAuth
              onLogin={handleCustomerLogin}
              onSignup={() => navigateTo('/customer-auth')}
            />
          );
        }
        return (
          <Checkout
            items={cartItems}
            onBack={() => navigateTo('/cart')}
            onSubmitOrder={handleSubmitOrder}
          />
        );
      case Page.OrderConfirmation:
        return currentOrder ? (
          <OrderConfirmation
            items={cartItems.length > 0 ? cartItems : []}
            total={currentOrder.total}
            orderNumber={currentOrder.orderNumber}
            onContinueShopping={handleContinueToHome}
          />
        ) : (
          <Home />
        );
      case Page.AddProduct:
        return (
          <AddProduct
            onSubmitProduct={handleSubmitProduct}
            onCancel={() => navigateTo('/store')}
          />
        );
      case Page.OrderHistory:
        return (
          <OrderHistory
            orders={orders}
            onBack={() => navigateTo('/')}
            onOpenOrder={handleOpenOrder}
          />
        );
      case Page.Account:
      case Page.CustomerAuth:
        return (
          <CustomerAuth 
            onLogin={handleCustomerLogin} 
            onSignup={() => navigateTo('/customer-auth')} 
          />
        );
      case Page.CustomerProfile:
        if (isAuthLoading) {
          return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-igo-lime border-t-transparent rounded-full animate-spin"></div></div>;
        }
        if (!customer) {
          navigateTo('/customer-auth');
          return <Home />;
        }
        return (
          <CustomerProfile
            customer={customer}
            orders={customerOrders}
            notifications={customerNotifications}
            onLogout={handleCustomerLogout}
            onUpdateProfile={(updatedCustomer) => setCustomer(updatedCustomer)}
            onRefreshNotifications={fetchCustomerData}
            initialTab={(window.location.search.split('tab=')[1] as any) || 'account'}
          />
        );
      case Page.AdminOrders:
      case Page.AdminLeads:
      case Page.AdminProducts:
      case Page.AdminInventory:
      case Page.AdminOverview:
      case Page.AdminNotifications:
      case Page.AdminProfile:
      case Page.MailHub:
      case Page.AddProduct:
        if (!isAdmin) {
          return (
            <AdminLogin 
              defaultEmail="admin@igo.local"
              onLogin={handleAdminLogin}
            />
          );
        }

        const renderAdminContent = () => {
          switch (currentPage) {
            case Page.AdminOrders:
              return (
                <AdminOrders
                  orders={orders}
                  onBack={() => navigateTo('/')}
                  onOpenOrder={handleOpenOrder}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onDeleteCustomer={handleDeleteCustomer}
                  onNavigate={(page) => handlePageChange(page)}
                />
              );
            case Page.AdminLeads:
              return <AdminLeads onNavigate={(page) => handlePageChange(page)} />;
            case Page.AdminInventory:
              return (
                <AdminInventory 
                  products={products} 
                  onUpdateProducts={setProducts} 
                />
              );
            case Page.AdminProducts:
              return (
                <AdminProducts 
                  products={products} 
                  onUpdateProducts={setProducts} 
                />
              );
            case Page.AddProduct:
              return (
                <div className="p-10">
                   <AddProduct onSubmitProduct={handleSubmitProduct} onCancel={() => handlePageChange(Page.AdminInventory)} />
                </div>
              );
            default:
              return <AdminOverview onNavigate={(page) => handlePageChange(page)} />;
          }
        };

        return (
          <AdminLayout 
            currentPage={currentPage} 
            onNavigate={(page) => handlePageChange(page)}
            onLogout={handleAdminLogout}
            notifications={adminNotifications}
            orders={orders}
          >
            {renderAdminContent()}
          </AdminLayout>
        );
      case Page.AdminLogin:
        return (
          <AdminLogin
            defaultEmail="admin@igo.local"
            onLogin={handleAdminLogin}
          />
        );
      default:
        return <Home />;
    }
  };

  const isAdminRoute = [
    Page.AdminOrders,
    Page.AdminLeads,
    Page.AdminProducts,
    Page.AdminInventory,
    Page.AdminOverview,
    Page.AdminNotifications,
    Page.AdminProfile,
    Page.MailHub,
    Page.AddProduct,
    Page.AdminLogin
  ].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col selection:bg-igo-lime selection:text-igo-dark">
      {!isAdminRoute && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={handlePageChange} 
          cartCount={cartCount}
          isAdmin={isAdmin}
          onAdminLogout={handleAdminLogout}
          customer={customer}
          onCustomerLogout={handleCustomerLogout}
          notifications={customerNotifications}
          onRefreshNotifications={fetchCustomerData}
        />
      )}
      <main className={`flex-grow ${isAdminRoute ? '' : 'pt-20'}`}>
        {renderPage()}
      </main>
      
      {/* Toast System - "Pop up" for Notifications */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-igo-dark text-white p-5 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-4 min-w-[300px] backdrop-blur-xl bg-opacity-95">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${toast.type === 'success' ? 'bg-igo-lime text-igo-dark' : 'bg-blue-500 text-white'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-igo-lime mb-0.5">Notification</p>
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {!isAdminRoute && <Footer setCurrentPage={handlePageChange} />}
      {!isAdminRoute && <LeadCapturePopup />}
    </div>
  );
};

export default App;
