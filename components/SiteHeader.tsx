import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Menu,
  Search,
  Zap,
  X,
  ChevronRight,
  Package,
  BarChart3,
  LogOut,
  Shield,
  Truck,
  User,
  Bell,
  Settings,
  CreditCard,
  History,
} from 'lucide-react';
import { Customer, Page, Notification, StoreProduct } from '../types';
import { INITIAL_STORE_PRODUCTS } from '../data/storeProducts';
import { getUnifiedProducts, UnifiedProduct } from '../data/unifiedSearch';
import { customerApi } from '../services/customerApi';

interface SiteHeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page, param?: string) => void;
  cartCount: number;
  isAdmin: boolean;
  onAdminLogout: () => void;
  customer: Customer | null;
  onCustomerLogout: () => void;
  notifications: Notification[];
  onRefreshNotifications?: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  currentPage,
  setCurrentPage,
  cartCount,
  isAdmin,
  onAdminLogout,
  customer,
  onCustomerLogout,
  notifications = [],
  onRefreshNotifications,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedProduct[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // SEO-friendly path map — used for href on all anchor links
  const PAGE_PATHS: Partial<Record<Page, string>> = {
    [Page.Home]: '/',
    [Page.Shop]: '/store',
    [Page.Product]: '/product',
    [Page.Landscape]: '/landscape',
    [Page.AMC]: '/amc',
    [Page.Lab]: '/lab',
    [Page.Knowledge]: '/knowledge',
    [Page.Assistant]: '/assistant',
    [Page.Visit]: '/visit',
    [Page.Cart]: '/cart',
    [Page.CustomerAuth]: '/customer-auth',
    [Page.CustomerProfile]: '/customer-profile',
  };

  const navItems = [
    { name: 'Store', page: Page.Shop, path: '/store' },
    { name: 'Product', page: Page.Product, path: '/product' },
    { name: 'Landscape Studio', page: Page.Landscape, path: '/landscape' },
    { name: 'AMC Care', page: Page.AMC, path: '/amc' },
    { name: 'Tech Lab', page: Page.Lab, path: '/lab' },
    { name: 'Knowledge', page: Page.Knowledge, path: '/knowledge' },
  ];

  const handleNav = (page: Page, param?: string) => {
    setCurrentPage(page, param);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  // SPA-friendly anchor click handler — allows Googlebot to see href, prevents full reload
  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, page: Page, param?: string) => {
    e.preventDefault();
    handleNav(page, param);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const allProducts = getUnifiedProducts();
      const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 antialiased transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg border-b border-gray-200'
            : 'border-b border-gray-100 bg-cover bg-center'
        }`}
        style={!isScrolled ? { backgroundImage: "linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url('/images/branding/header-bg.png')" } : {}}
        <meta name="google-site-verification" content="eXtKF0HcqFnHnEU-GU9NTUTWw6ER5HZr3_cQlcxxgJQ" />
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24 gap-4 xl:gap-8">
            <a href="/" onClick={(e) => handleAnchorNav(e, Page.Home)} className="flex items-center gap-4 cursor-pointer group py-2 shrink-0" aria-label="IGO Nursery — Home">
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-gray-100/50 bg-white group-hover:shadow-md transition-all">
                <img
                  src="/images/branding/igo-logo.jpg"
                  alt="IGO Nursery logo — premium nursery plants Chennai"
                  className="w-full h-full object-cover scale-[1.35] transition-all duration-300 group-hover:scale-[1.45] group-hover:rotate-3 mix-blend-multiply"
                />
              </div>
            </a>

            <nav className="hidden lg:flex flex-1 justify-center items-center gap-x-6 xl:gap-x-10" aria-label="Main navigation">
              {navItems.map((item) => (
                <a
                  key={item.page}
                  href={item.path}
                  onClick={(e) => handleAnchorNav(e, item.page)}
                  aria-current={currentPage === item.page ? 'page' : undefined}
                  className={`text-[12px] xl:text-[13px] uppercase tracking-[0.15em] font-black transition-all hover:text-igo-lime hover:scale-105 relative py-2 no-underline ${
                    currentPage === item.page
                      ? 'text-igo-dark after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-igo-lime'
                      : 'text-igo-muted'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">


              <button
                aria-label="Search products"
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-igo-dark hover:bg-gray-50 rounded-xl transition-colors hidden md:block"
              >
                <Search className="w-5 h-5" />
              </button>

              <a
                href="/assistant"
                onClick={(e) => handleAnchorNav(e, Page.Assistant)}
                className="bg-igo-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-igo-charcoal transition-all shadow-lg hidden md:flex items-center gap-2 no-underline"
              >
                <Zap className="w-3.5 h-3.5 text-igo-lime" />
                AI Assistant
              </a>



              <div className="relative ml-2">
                <a
                  href="/cart"
                  onClick={(e) => handleAnchorNav(e, Page.Cart)}
                  className={`p-2.5 rounded-xl transition-colors inline-flex no-underline ${
                    currentPage === Page.Cart ? 'bg-igo-dark text-white' : 'text-igo-dark hover:bg-gray-50'
                  }`}
                  aria-label={`Open shopping cart${cartCount > 0 ? ` — ${cartCount} items` : ''}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-igo-lime text-igo-dark text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </a>
              </div>

              {/* Customer Notifications Bell - Always visible for accessibility */}
              <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2.5 text-igo-dark hover:bg-gray-50 rounded-xl transition-colors relative group"
                    title="System Notifications"
                  >
                    <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-igo-lime animate-shake' : 'text-igo-dark'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[8px] items-center justify-center font-black shadow-sm">
                          {unreadCount}
                        </span>
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2">
                      <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-igo-dark uppercase tracking-widest leading-none">Notifications</h3>
                        {unreadCount > 0 && <span className="text-[10px] font-black text-igo-lime uppercase tracking-widest">{unreadCount} New</span>}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((note, i) => (
                            <button 
                              key={i} 
                              onClick={async () => {
                                // 1. Mark as Read
                                try {
                                  await customerApi.markNotificationRead(note.id);
                                } catch (e) {
                                  console.error('Failed to mark read:', e);
                                }
                                
                                // 2. Intelligent Redirection
                                if (note.targetPage === 'customer-profile') {
                                  let target = note.targetId || 'inbox';
                                  
                                  const isOrderNotif = note.type === 'order' || 
                                    (note.message && note.message.toLowerCase().includes('order')) || 
                                    (note.title && note.title.toLowerCase().includes('order')) ||
                                    (note.targetId && note.targetId.startsWith('IGO-'));

                                  if (isOrderNotif && note.targetId && note.targetId !== 'orders') {
                                    target = `orders?id=${note.targetId}`;
                                  } else if (isOrderNotif || note.targetId === 'orders') {
                                    target = 'orders';
                                  } else if (note.targetId && note.targetId !== 'inbox') {
                                    target = `inbox?id=${note.targetId}`;
                                  }
                                  handleNav(Page.CustomerProfile, target);
                                } else if (note.targetPage) {
                                  handleNav(note.targetPage as any, note.targetId);
                                } else if (note.type === 'order' || note.message.toLowerCase().includes('order')) {
                                  handleNav(Page.CustomerProfile, note.targetId ? `orders?id=${note.targetId}` : 'orders');
                                } else {
                                  handleNav(Page.CustomerProfile, 'inbox');
                                }
                                
                                // 3. Refresh & Close
                                if (onRefreshNotifications) {
                                  onRefreshNotifications();
                                }
                                setIsNotificationsOpen(false);
                              }}
                              className={`w-full p-5 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-none flex gap-4 text-left group relative ${note.isRead ? 'opacity-60' : 'bg-igo-lime/5'}`}
                            >
                              {!note.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-igo-lime" />
                              )}
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${note.isRead ? 'bg-gray-100 text-gray-400' : 'bg-white text-igo-lime shadow-sm group-hover:scale-110'}`}>
                                <Bell className={`w-5 h-5 ${!note.isRead ? 'animate-bounce' : ''}`} />
                              </div>
                              <div className="overflow-hidden flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                  <p className={`text-[10px] uppercase tracking-widest leading-none group-hover:text-igo-lime transition-colors truncate ${note.isRead ? 'font-bold text-gray-400' : 'font-black text-igo-dark'}`}>{note.title}</p>
                                  {!note.isRead && <span className="text-[7px] font-black bg-igo-lime text-igo-dark px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">New</span>}
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 line-clamp-2 leading-snug">{note.message}</p>
                                <p className="text-[8px] font-black text-gray-300 uppercase mt-2 tracking-widest">{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-10 text-center text-gray-400">
                            <p className="text-[10px] font-black uppercase tracking-widest">Workspace Clean</p>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => { handleNav(Page.CustomerProfile, 'inbox'); setIsNotificationsOpen(false); }}
                        className="w-full py-3 bg-gray-50 text-[9px] font-black text-igo-dark uppercase tracking-widest hover:text-igo-lime transition-colors"
                      >
                        View Full Inbox
                      </button>
                    </div>
                  )}
                </div>

              {/* Customer Profile / Login */}
              <div className="relative ml-2">
                {customer ? (
                  <div className="flex items-center gap-2">
                    <a
                      href="/customer-profile/account"
                      onClick={(e) => handleAnchorNav(e, Page.CustomerProfile, 'account')}
                      className="p-2.5 text-igo-dark hover:bg-gray-50 rounded-xl transition-colors relative flex items-center gap-2 no-underline"
                      title="My Profile"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block truncate max-w-[100px]">{customer.name}</span>
                    </a>
                  </div>
                ) : (
                  <a
                    href="/customer-auth"
                    onClick={(e) => handleAnchorNav(e, Page.CustomerAuth)}
                    className="p-2.5 text-igo-dark hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap no-underline"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Login</span>
                  </a>
                )}
              </div>


              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2.5 text-igo-dark bg-gray-50 rounded-xl ml-2"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-igo-dark/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl transition-transform duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <img
              src="/images/branding/igo-logo.jpg"
              alt="IGO Agritechfarms"
              className="h-14 w-auto rounded-lg border border-gray-100 shadow-sm object-contain bg-white"
            />
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-grow space-y-2" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                key={item.page}
                href={item.path}
                onClick={(e) => handleAnchorNav(e, item.page)}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold text-igo-dark hover:bg-igo-lime hover:text-white transition-all group no-underline"
              >
                <span className="uppercase tracking-widest text-sm">{item.name}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}

            <div className="border-t my-6" />



            <a
              href="/assistant"
              onClick={(e) => handleAnchorNav(e, Page.Assistant)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-igo-dark text-white font-bold mt-4 shadow-xl no-underline"
            >
              <Zap className="w-4 h-4 text-igo-lime" />
              <span className="uppercase tracking-widest text-sm">Garden Assistant</span>
            </a>
          </nav>

          <div className="border-t pt-8 space-y-4">
            {isAdmin ? (
              <button
                onClick={() => {
                  onAdminLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-800 transition-all hover:bg-red-200"
              >
                Logout Admin
              </button>
            ) : null}

            <div className="text-[10px] font-black text-igo-muted uppercase tracking-[0.2em] mb-4">Muttukadu Headquarters</div>
            <p className="text-sm text-gray-500 mb-6">ECR Road, Muttukadu, Chennai 603112</p>
            <a
              href="/visit"
              onClick={(e) => handleAnchorNav(e, Page.Visit)}
              className="text-igo-dark font-black uppercase text-xs tracking-widest border-b-2 border-igo-lime pb-1 no-underline"
            >
              Book Campus Visit
            </a>
          </div>
        </div>
      </div>

      {/* Global Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20">
          <div className="absolute inset-0 bg-igo-dark/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsSearchOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-top-12 duration-500">
            <div className="p-8">
              <div className="relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-igo-muted" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search products, tools, and greenery..."
                  className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl text-lg font-bold text-igo-dark outline-none focus:ring-4 focus:ring-igo-lime/20 transition-all shadow-inner"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-gray-200 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-igo-muted uppercase tracking-[0.3em] px-2 mb-2">Search Results</p>
                  <div className="grid gap-3">
                    {searchResults.map(product => (
                      <button 
                        key={product.id}
                        onClick={() => {
                          const slug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
                          handleNav(Page.Product, slug);
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-igo-lime hover:bg-white hover:shadow-xl transition-all group text-left"
                      >
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[10px] font-black text-igo-lime uppercase tracking-widest leading-none mb-1">{product.category}</p>
                          <h4 className="text-base font-black text-igo-dark uppercase tracking-tight">{product.name}</h4>
                          <p className="text-xs font-black text-igo-muted">₹{product.price.toLocaleString()}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-igo-lime transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchQuery.length > 2 ? (
                <div className="py-20 text-center">
                  <p className="text-sm font-bold text-igo-muted italic">No products found for "{searchQuery}"</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-igo-lime">Try searching for "Monstera" or "Indoor"</p>
                </div>
              ) : (
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 mb-4">Trending Collections</p>
                   <div className="flex flex-wrap gap-2">
                      {['Monstera', 'Snake Plant', 'Tools', 'Outdoor', 'Areca Palm'].map(tag => (
                        <button 
                          key={tag}
                          onClick={() => handleSearch(tag)}
                          className="px-6 py-3 bg-gray-50 rounded-2xl text-xs font-black uppercase tracking-widest text-igo-dark hover:bg-igo-lime transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteHeader;
