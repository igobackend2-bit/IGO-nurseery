import React, { useState, useMemo } from 'react';
import { Users, Search, AlertCircle, Filter, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Order } from '../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

interface AdminCustomersProps {
  orders: Order[];
  onDeleteCustomer: (customerId: number) => void;
  onNavigateToOrders: (email: string) => void;
}

const AdminCustomers: React.FC<AdminCustomersProps> = ({ orders, onDeleteCustomer, onNavigateToOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const globalCustomers = useMemo(() => {
    const customerMap = new Map<
      string,
      {
        id: number | null;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        orderCount: number;
        totalSpent: number;
        latestOrderNumber: string;
        latestOrderDate: string;
        deletionRequested: boolean;
      }
    >();

    orders.forEach((order) => {
      const email = order.customerEmail || '';
      if (!email) return;
      const key = email.toLowerCase();
      const existing = customerMap.get(key);

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt).getTime() > new Date(existing.latestOrderDate).getTime()) {
          existing.latestOrderNumber = order.orderNumber;
          existing.latestOrderDate = order.createdAt;
        }
        if (order.deletionRequested) existing.deletionRequested = true;
        return;
      }

      customerMap.set(key, {
        id: order.customerId ?? null,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.shippingAddress,
        city: order.city,
        state: order.state,
        zipCode: order.zipCode,
        orderCount: 1,
        totalSpent: order.total,
        latestOrderNumber: order.orderNumber,
        latestOrderDate: order.createdAt,
        deletionRequested: !!order.deletionRequested,
      });
    });

    return customerMap;
  }, [orders]);

  const uniqueCustomers = useMemo(() => {
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    return Array.from(globalCustomers.values())
      .filter(customer => {
        if (customer.id === null) return false;
        if (!cleanSearchTerm) return true;
        
        return (
          (customer.name || '').toLowerCase().includes(cleanSearchTerm) ||
          (customer.email || '').toLowerCase().includes(cleanSearchTerm) ||
          (customer.phone || '').toLowerCase().includes(cleanSearchTerm)
        );
      })
      .sort((a, b) => b.orderCount - a.orderCount);
  }, [globalCustomers, searchTerm]);

  return (
    <div className="p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Customer Directory</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Users className="w-3 h-3 text-igo-lime" /> Platform Users & Lifetime Value
            </p>
         </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">

          {/* Search */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
            <div className="flex-1 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-igo-muted" />
              <input
                type="text"
                placeholder="Search by customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-igo-lime transition-colors"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-igo-lime mb-2">
                  Customer Profiles & History
                </p>
                <h2 className="text-2xl font-black text-igo-dark">
                  {uniqueCustomers.length} Unique Customers
                </h2>
              </div>
            </div>

            {uniqueCustomers.length === 0 ? (
              <p className="text-sm text-igo-muted p-4">No customer details found for this search.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {uniqueCustomers.map((customer) => (
                  <div
                    key={customer.email}
                    className={`rounded-3xl border p-6 transition-colors ${
                      customer.deletionRequested 
                        ? 'border-red-300 bg-red-50/50 hover:border-red-600' 
                        : 'border-gray-100 bg-white shadow-sm hover:border-igo-lime hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl shadow-sm border border-indigo-100 uppercase">
                            {customer.name.substring(0, 2)}
                         </div>
                         <div>
                            <p className="text-lg font-black text-igo-dark leading-tight">{customer.name}</p>
                            {customer.deletionRequested && (
                              <div className="flex items-center gap-1 mt-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Deletion Requested</span>
                              </div>
                            )}
                         </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs font-bold text-igo-muted">
                         <Mail className="w-4 h-4 text-gray-400" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-igo-muted">
                         <Phone className="w-4 h-4 text-gray-400" /> {customer.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-igo-muted">
                         <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> 
                         <span className="truncate" title={`${customer.address}, ${customer.city}`}>{customer.address}, {customer.city}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-igo-dark pb-3 border-b border-gray-200/50">
                        <span className="text-igo-muted">Lifetime Orders</span>
                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-200">{customer.orderCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-igo-dark pt-1">
                        <span className="text-igo-muted">Lifetime Value</span>
                        <span className="text-green-600 font-black text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-100">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onNavigateToOrders(customer.email)}
                      className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-igo-dark px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-igo-lime hover:text-igo-dark"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      View All Orders
                    </button>
                    
                    {customer.id && (
                      <button
                        onClick={() => {
                          if (window.confirm(`PERMANENTLY DELETE ACCOUNT: ${customer.email}?\n\nThis will remove their profile, notifications, and sessions. This CANNOT be undone.`)) {
                            onDeleteCustomer(customer.id as number);
                          }
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 transition-all border border-red-100 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Customer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminCustomers;
