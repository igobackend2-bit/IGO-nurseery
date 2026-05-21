import React from 'react';
import { CheckCircle, Package, Truck, MapPin, Calendar } from 'lucide-react';
import { CartItem } from '../types';

interface OrderConfirmationProps {
  items: CartItem[];
  total: number;
  orderNumber: string;
  onContinueShopping: () => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  items,
  total,
  orderNumber,
  onContinueShopping,
}) => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  return (
    <div className="bg-gradient-to-b from-green-50 to-gray-50 min-h-screen">
      <style>{`
        @keyframes bloom {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-bloom {
          animation: bloom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-pop-up {
          animation: popUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Icon */}
          <div className="text-center mb-12">
            <div className="inline-block relative animate-bloom">
              <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <CheckCircle className="w-24 h-24 text-green-600 relative animate-float" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-black text-igo-dark mb-4 tracking-tight animate-pop-up">
              Order Confirmed!
            </h1>
            <p className="text-xl text-igo-muted font-medium">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 mb-8">
            {/* Order Number */}
            <div className="text-center pb-8 border-b border-gray-200">
              <p className="text-sm uppercase tracking-[0.2em] font-black text-igo-lime mb-2">Order Number</p>
              <p className="text-3xl font-black text-igo-dark font-mono">{orderNumber}</p>
            </div>

            {/* Order Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 py-8 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-igo-lime" />
                  <p className="text-xs font-black uppercase tracking-widest text-igo-muted">Items</p>
                </div>
                <p className="text-2xl font-black text-igo-dark">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-5 h-5 text-igo-lime" />
                  <p className="text-xs font-black uppercase tracking-widest text-igo-muted">Delivery</p>
                </div>
                <p className="text-lg font-black text-igo-dark">5-7 Business Days</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-igo-lime" />
                  <p className="text-xs font-black uppercase tracking-widest text-igo-muted">Est. Delivery</p>
                </div>
                <p className="text-lg font-black text-igo-dark">
                  {deliveryDate.toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="py-8 border-b border-gray-200">
              <h3 className="text-lg font-black text-igo-dark mb-4">Order Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-black text-igo-dark text-sm">{item.product.name}</p>
                      <p className="text-xs text-igo-muted">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-black text-igo-dark text-sm">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="py-8">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-igo-dark uppercase tracking-tight">Total Amount</span>
                <span className="text-4xl font-black text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-igo-lime/10 border-l-4 border-igo-lime rounded-2xl p-6 mb-8">
            <h3 className="font-black text-igo-dark mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-igo-dark font-medium">
              <li>✓ You will receive an order confirmation email shortly</li>
              <li>✓ Track your order status anytime on our platform</li>
              <li>✓ Expected delivery in 5-7 business days</li>
              <li>✓ Free delivery on orders above ₹500</li>
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={onContinueShopping}
            className="w-full bg-igo-lime text-igo-dark py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#9fd620] transition-colors"
          >
            Continue Shopping
          </button>

          {/* Support Info */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-igo-muted font-medium">
              Need help? Contact us at <span className="font-black text-igo-dark">support@igo.co.in</span> or call <span className="font-black text-igo-dark">1800-IGO-CARE</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderConfirmation;
