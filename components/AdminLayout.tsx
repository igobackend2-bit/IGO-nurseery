import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Home, 
  Bell, 
  Search,
  Activity,
  PlusCircle,
  Inbox,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  History,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Star,
  Megaphone
} from 'lucide-react';
import { Page, Order } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page, param?: string) => void;
  onLogout: () => void;
  notifications?: any[];
  orders?: Order[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  onLogout,
  notifications = [],
  orders = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { customerApi } = await import('../services/customerApi');
        const dbLeads = await customerApi.getLeads();
        setLeads(dbLeads);
      } catch (e) {
        console.error('Failed to fetch leads for AdminLayout', e);
      }
    };
    fetchLeads();
  }, []);

  const menuItems = [
    { id: Page.AdminOverview, label: 'Command Center', icon: Activity },
    { id: Page.AdminOrders, label: 'All Orders', icon: Package },
    { id: Page.AdminCustomers, label: 'All CX (Customers)', icon: User },
    { id: Page.AdminLeads, label: 'CRM Inquiries', icon: Users },
    { id: Page.AdminVisitorLeads, label: 'Popup / Visitor Leads', icon: Megaphone },
    { id: Page.AdminProducts, label: 'Products', icon: Package },
    { id: Page.AdminInventory, label: 'Stock & Remove', icon: ShoppingBag },
    { id: Page.AddProduct, label: 'Add New Product', icon: PlusCircle },
  ];

  const secondaryItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, disabled: true },
    { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
  ];

  // Global Intelligence Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    
    const matchedLeads = leads.filter((l: any) => 
      (l.customerName || '').toLowerCase().includes(query) || 
      (l.customerEmail || '').toLowerCase().includes(query) ||
      (l.id || '').toString().toLowerCase().includes(query)
    );

    const matchedOrders = orders.filter((o) => 
      (o.customerName || '').toLowerCase().includes(query) || 
      (o.customerEmail || '').toLowerCase().includes(query) ||
      (o.orderNumber || '').toLowerCase().includes(query)
    );

    // Group by email to create a "Customer Profile" result
    const customers = new Map();
    
    [...matchedLeads, ...matchedOrders].forEach(item => {
      const email = item.customerEmail || item.email;
      if (!customers.has(email)) {
        customers.set(email, {
          email,
          name: item.customerName || item.name,
          phone: item.customerPhone || item.phone,
          leads: matchedLeads.filter((l: any) => l.customerEmail === email),
          orders: orders.filter(o => o.customerEmail === email)
        });
      }
    });

    return Array.from(customers.values());
  }, [searchQuery, orders]);

  return (
    <div className="flex min-h-[100dvh] bg-[#f1f5f9] overflow-hidden font-sans w-full">
      {/* Sidebar - FIXED to ensure it's always full height */}
      <aside className="w-72 bg-igo-dark flex flex-col shadow-2xl relative z-40 shrink-0 h-screen sticky top-0">
        <div className="p-8 overflow-y-auto flex-1 scrollbar-hide">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-igo-lime rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)]">
                 <Activity className="w-6 h-6 text-igo-dark" />
              </div>
              <div>
                <h1 className="text-white font-black tracking-widest text-sm">IGO CORE</h1>
                <p className="text-igo-lime text-[10px] font-black uppercase tracking-widest">Admin Control</p>
              </div>
           </div>

           <nav className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4 ml-2">Main Console</label>
              <button
                onClick={() => onNavigate(Page.Home)}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/60 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Home className="w-5 h-5 group-hover:text-igo-lime transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest">View Public Site</span>
              </button>

              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                    currentPage === item.id 
                      ? 'bg-igo-lime text-igo-dark shadow-[0_10px_30px_rgba(132,204,22,0.3)]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-current" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}

              <div className="pt-8 mb-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4 ml-2">System Tools</label>
                {secondaryItems.map((item) => (
                  <button
                    key={item.id}
                    disabled={item.disabled}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/30 cursor-not-allowed opacity-50"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8">
                 <button
                   onClick={() => onNavigate(Page.MailHub)}
                   className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all group"
                 >
                   <Mail className="w-5 h-5 group-hover:text-white transition-colors" />
                   <span className="text-xs font-black uppercase tracking-widest">Simulated Mail</span>
                 </button>
              </div>
           </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
           <button
             onClick={onLogout}
             className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black uppercase text-xs tracking-widest"
           >
             <LogOut className="w-5 h-5" />
             Log Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 relative z-30">
           <div className="flex items-center gap-8 w-1/2 relative">
              <div className="relative w-full max-w-md group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-igo-lime transition-colors" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Intelligence Search (Name, Email, Order#)..."
                   className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-igo-lime transition-all"
                 />
                 
                 {/* Search Results Dropdown */}
                 {searchQuery && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                         <p className="text-[10px] font-black text-igo-muted uppercase tracking-widest">Customer Intelligence Match</p>
                      </div>
                      {searchResults.length > 0 ? (
                        searchResults.map((cust, i) => (
                           <button 
                             key={i}
                             onClick={() => { setSelectedCustomer(cust); setSearchQuery(''); }}
                             className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none group text-left"
                           >
                              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-bold group-hover:bg-igo-lime group-hover:text-igo-dark transition-all uppercase">
                                 {cust.name.substring(0, 2)}
                              </div>
                              <div className="flex-grow">
                                 <p className="text-xs font-black text-igo-dark">{cust.name}</p>
                                 <p className="text-[10px] font-bold text-gray-400">{cust.email}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">{cust.orders.length} Orders</p>
                                 <p className="text-[10px] font-black text-igo-lime uppercase tracking-widest leading-none">{cust.leads.length} Leads</p>
                              </div>
                           </button>
                        ))
                      ) : (
                        <div className="p-10 text-center text-gray-400">
                           <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                           <p className="text-xs font-bold uppercase tracking-widest italic">No Engagement Data Found</p>
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showNotifications ? 'bg-igo-lime text-igo-dark' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                   <Bell className="w-5 h-5" />
                   {notifications.filter(n => !n.read).length > 0 && (
                     <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                   )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                   <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                         <h3 className="text-xs font-black text-igo-dark uppercase tracking-[0.2em]">Operational Alerts</h3>
                         <span className="px-2 py-1 bg-red-100 text-red-600 text-[8px] font-black rounded uppercase tracking-widest">
                           {notifications.length} New
                         </span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                         {notifications.length > 0 ? (
                           notifications.map((n, i) => (
                             <button 
                               key={i} 
                               onClick={() => {
                                 setShowNotifications(false);
                                 if (n.type === 'lead' || n.id.toString().startsWith('lead-')) {
                                   onNavigate(Page.AdminLeads, n.id.toString());
                                 } else {
                                   onNavigate(Page.AdminOrders, n.id.toString());
                                 }
                               }}
                               className="w-full p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none flex gap-4 text-left group"
                             >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                   <Inbox className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-igo-dark uppercase tracking-widest leading-none mb-1 group-hover:text-igo-lime transition-colors">{n.title}</p>
                                   <p className="text-[10px] font-bold text-gray-500 line-clamp-1">{n.message}</p>
                                   <p className="text-[8px] font-black text-gray-300 uppercase mt-2 italic tracking-widest">{new Date(n.time || n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                             </button>
                           ))
                         ) : (
                           <div className="p-10 text-center text-gray-400">
                             <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                             <p className="text-xs font-bold uppercase tracking-widest">Workspace Clean</p>
                           </div>
                         )}
                      </div>
                      <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                         <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-all">Clear All Sync Logs</button>
                      </div>
                   </div>
                )}
              </div>
              
              <div className="h-8 w-px bg-gray-100"></div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-igo-dark uppercase tracking-widest">Master Admin</p>
                    <p className="text-[9px] font-bold text-igo-lime uppercase tracking-widest">Regional Hub</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-igo-lime to-green-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                    MA
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto bg-[#fcfdfd] relative">
           {children}
        </div>
      </main>

      {/* CUSTOMER 360 INTELLIGENCE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-igo-dark/80 backdrop-blur-md" onClick={() => setSelectedCustomer(null)}></div>
           <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col md:flex-row h-[85vh]">
              
              {/* Profile Sidebar */}
              <div className="w-full md:w-80 bg-gray-50 p-10 border-r border-gray-100 flex flex-col shrink-0">
                 <div className="w-24 h-24 rounded-3xl bg-igo-lime text-igo-dark flex items-center justify-center text-3xl font-black mb-6 uppercase shadow-xl">
                    {selectedCustomer.name.substring(0, 2)}
                 </div>
                 <h2 className="text-2xl font-black text-igo-dark uppercase tracking-tighter leading-tight mb-2">{selectedCustomer.name}</h2>
                 <p className="text-xs font-black text-igo-lime uppercase tracking-widest mb-10 italic">Premium Client Hub</p>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Mail className="w-4 h-4 text-gray-400" />
                       <div className="overflow-hidden">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-[11px] font-bold text-igo-dark truncate">{selectedCustomer.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Phone className="w-4 h-4 text-gray-400" />
                       <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Contact Number</p>
                          <p className="text-[11px] font-bold text-igo-dark">{selectedCustomer.phone || 'Not provided'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto pt-10">
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="w-full py-4 bg-igo-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                       <X className="w-4 h-4" /> Close Portfolio
                    </button>
                 </div>
              </div>

              {/* Engagement Data */}
              <div className="flex-1 p-10 flex flex-col overflow-y-auto">
                 <div className="flex justify-between items-end mb-10">
                    <h3 className="text-xl font-black text-igo-dark uppercase tracking-tighter shadow-text">Engagement Intelligence</h3>
                    <div className="flex gap-4">
                       <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-widest">{selectedCustomer.orders.length} Purchases</span>
                       <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-widest">{selectedCustomer.leads.length} Inquiries</span>
                    </div>
                 </div>

                 <div className="space-y-12">
                    {/* Orders History */}
                    <div>
                       <div className="flex items-center gap-3 mb-6">
                          <ShoppingBag className="w-4 h-4 text-igo-dark" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-igo-muted italic">Purchase history</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCustomer.orders.length > 0 ? (
                            selectedCustomer.orders.map((o: any, idx: number) => (
                               <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group hover:border-igo-lime transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                     <p className="text-[10px] font-black text-igo-dark uppercase tracking-widest">#{o.orderNumber}</p>
                                     <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase tracking-widest">{o.status}</span>
                                  </div>
                                  <p className="text-lg font-black text-igo-dark tracking-tighter mb-1">₹{o.totalAmount || o.total}</p>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(o.createdAt || o.date).toLocaleDateString()}</p>
                               </div>
                            ))
                          ) : (
                            <p className="text-xs font-bold text-gray-300 italic tracking-widest col-span-2 text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No Transaction Records Found</p>
                          )}
                       </div>
                    </div>

                    {/* Leads/Inquiries History */}
                    <div>
                       <div className="flex items-center gap-3 mb-6">
                          <MessageSquare className="w-4 h-4 text-igo-dark" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-igo-muted italic">Inquiry history</h4>
                       </div>
                       <div className="space-y-4">
                          {selectedCustomer.leads.length > 0 ? (
                            selectedCustomer.leads.map((l: any, idx: number) => (
                               <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center group hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
                                  <div className="flex gap-6 items-center">
                                     <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-igo-lime group-hover:text-igo-dark transition-all">
                                        {l.type.substring(0, 1).toUpperCase()}
                                     </div>
                                     <div>
                                        <p className="text-xs font-black text-igo-dark uppercase tracking-widest leading-none mb-1">{l.type}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{l.selectedPlan || 'General Request'} — {new Date(l.createdAt).toLocaleDateString()}</p>
                                     </div>
                                  </div>
                                  <button className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-igo-dark group-hover:text-white transition-all">
                                     <ExternalLink className="w-4 h-4" />
                                  </button>
                               </div>
                            ))
                          ) : (
                            <p className="text-xs font-bold text-gray-300 italic tracking-widest text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No Inquiry Interaction Data</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
