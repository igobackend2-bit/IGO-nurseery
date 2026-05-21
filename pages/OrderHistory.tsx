import React, { useMemo } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onBack: () => void;
  onOpenOrder: (orderNumber: string) => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'shipped':
      return <Truck className="w-5 h-5 text-blue-600" />;
    case 'processing':
      return <Package className="w-5 h-5 text-orange-600" />;
    case 'cancelled':
      return <Clock className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'shipped':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'processing':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onBack, onOpenOrder }) => {
  const orderStats = useMemo(() => {
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      delivered: orders.filter(o => o.status === 'delivered').length,
      inTransit: orders.filter(o => o.status === 'shipped').length,
    };
  }, [orders]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header with Background */}
      <section className="relative bg-igo-dark overflow-hidden py-16">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=2000" 
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-igo-dark via-igo-dark/90 to-igo-charcoal/80"></div>
        <div className="absolute inset-0 opacity-10 grid-pattern-lg"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-igo-lime font-black uppercase text-xs tracking-widest mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">My Orders</h1>
          <p className="text-gray-300 mt-2">Track and manage all your orders</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Order Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-igo-muted font-black uppercase tracking-widest mb-2">Total Orders</p>
              <p className="text-4xl font-black text-igo-dark">{orderStats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-igo-muted font-black uppercase tracking-widest mb-2">Total Spent</p>
              <p className="text-2xl font-black text-green-600">{formatCurrency(orderStats.totalSpent)}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-igo-muted font-black uppercase tracking-widest mb-2">Delivered</p>
              <p className="text-4xl font-black text-green-600">{orderStats.delivered}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-igo-muted font-black uppercase tracking-widest mb-2">In Transit</p>
              <p className="text-4xl font-black text-blue-600">{orderStats.inTransit}</p>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-igo-dark mb-2">No Orders Yet</h3>
                <p className="text-igo-muted">Start shopping to see your orders here</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                    <div className="grid md:grid-cols-4 gap-4 items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-igo-lime mb-1">Order Number</p>
                        <p className="text-lg font-black text-igo-dark font-mono">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-1">Tracking Number</p>
                        <p className="text-sm font-black text-igo-dark font-mono">{order.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-1">Order Date</p>
                        <p className="text-sm font-black text-igo-dark">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-1">Order Total</p>
                        <p className="text-xl font-black text-green-600">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Status</p>
                        <p className="text-sm font-black text-igo-dark capitalize">{order.status}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                      <span className="text-xs font-black uppercase tracking-widest capitalize">{order.status}</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-igo-muted mb-2">Customer Details</p>
                        <div className="space-y-2">
                          <p className="text-sm font-black text-igo-dark">{order.customerName}</p>
                          <div className="flex items-center gap-2 text-sm text-igo-muted">
                            <Mail className="w-4 h-4" /> {order.customerEmail}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-igo-muted">
                            <Phone className="w-4 h-4" /> {order.customerPhone}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-igo-muted mb-2">Shipping Address</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-igo-lime flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-igo-dark">
                            <p className="font-black">{order.shippingAddress}</p>
                            <p>{order.city}, {order.state} {order.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-igo-muted mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="font-black text-sm text-igo-dark">{item.product.name}</p>
                              <p className="text-xs text-igo-muted">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-black text-igo-dark">{formatCurrency(item.product.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="p-4 bg-igo-lime/10 rounded-lg border border-igo-lime/20 flex items-center gap-3">
                        <Truck className="w-5 h-5 text-igo-lime" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-igo-lime">Estimated Delivery</p>
                          <p className="text-sm font-black text-igo-dark">
                            {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenOrder(order.orderNumber)}
                        className="rounded-2xl bg-igo-dark px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-igo-charcoal"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderHistory;
