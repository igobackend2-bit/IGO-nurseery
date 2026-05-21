import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, ArrowRight, MapPin } from 'lucide-react';
import { Order } from '../types';
import { fetchCustomerOrder } from '../services/api';

const OrderTracker: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-search if orderNumber is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sn = params.get('orderNumber');
    if (sn) {
      setOrderNumber(sn);
      handleTrack(sn);
    }
  }, []);

  const handleTrack = async (targetOrderNumber?: string) => {
    const sn = targetOrderNumber || orderNumber.trim();
    if (!sn) return;

    setSearching(true);
    setError(null);
    setOrder(null);

    try {
      // NOTE: For a public tracker, we might need a more open API endpoint 
      // or ask for email + order number. For now, using the basic fetch.
      // Since our local backend findCustomerOrderByReference requires accessKey,
      // I'll update the backend to allow search by orderNumber alone for public tracking.
      
      const response = await fetch(`/api/orders/public/${encodeURIComponent(sn)}`);
      if (!response.ok) {
        throw new Error('Order not found. Please check your Order ID.');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-igo-dark py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 grid-pattern"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
            Track Your <span className="text-igo-lime">Greenery</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 font-medium">
            Enter your Order ID (e.g. IGO-12345) to see exactly where your plants are.
          </p>
          
          <div className="relative max-w-lg mx-auto">
            <input 
              type="text"
              placeholder="Enter Order ID..."
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 outline-none focus:border-igo-lime transition-all font-mono tracking-widest"
            />
            <button 
              onClick={() => handleTrack()}
              disabled={searching}
              className="absolute right-2 top-2 bottom-2 bg-igo-lime text-igo-dark px-6 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              {searching ? 'Wait...' : 'Track'}
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl text-red-700 font-medium animate-shake">
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="animate-fade-in-up">
            {/* Status Visualizer */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mb-8">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-1">Status: {order.status}</p>
                  <h2 className="text-2xl font-black text-igo-dark">Current Progress</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-1">Estimated Delivery</p>
                  <p className="text-lg font-black text-igo-lime">
                    {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-igo-lime -translate-y-1/2 transition-all duration-1000"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
                
                <div className="relative flex justify-between">
                  {[
                    { step: 1, icon: Clock, label: 'Received' },
                    { step: 2, icon: Package, label: 'Processing' },
                    { step: 3, icon: Truck, label: 'Shipped' },
                    { step: 4, icon: CheckCircle, label: 'Delivered' },
                  ].map((item) => {
                    const isActive = currentStep >= item.step;
                    const Icon = item.icon;
                    return (
                      <div key={item.step} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                          isActive ? 'bg-igo-lime text-igo-dark scale-110 shadow-lg' : 'bg-white text-gray-300 border-2 border-gray-100 scale-100'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-igo-dark' : 'text-gray-300'}`}>
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details Mini Card */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                <h3 className="text-lg font-black text-igo-dark mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-igo-lime" /> Shipping To
                </h3>
                <div className="text-sm font-medium text-igo-dark space-y-1">
                  <p className="font-bold">{order.customerName}</p>
                  <p className="text-igo-muted">{order.shippingAddress}</p>
                  <p className="text-igo-muted">{order.city}, {order.state} {order.zipCode}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                <h3 className="text-lg font-black text-igo-dark mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-igo-lime" /> Order Summary
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <span className="text-igo-dark font-medium">{item.product.name} x{item.quantity}</span>
                      <span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-black text-lg">
                    <span>Total Paid</span>
                    <span className="text-green-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderTracker;
