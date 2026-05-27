import React from 'react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface CartPageProps {
  items: CartItem[];
  isLoggedIn: boolean;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onContinueShopping: () => void;
  onCheckout?: () => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const Cart: React.FC<CartPageProps> = ({
  items,
  isLoggedIn,
  onIncrease,
  onDecrease,
  onRemove,
  onContinueShopping,
  onCheckout,
}) => {
  useSEO(SEO_CONFIGS.cart);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header with Background Image */}
      <section className="relative bg-igo-dark overflow-hidden py-16 md:py-20">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=2000" 
            alt="Shopping Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-igo-dark via-igo-dark/90 to-igo-charcoal/80"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 grid-pattern-lg"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="w-8 h-8 text-igo-lime animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Your Cart</h1>
          </div>
          <p className="text-gray-300 text-base md:text-lg font-medium">
            Review selected products, adjust quantity, and verify totals.
          </p>
        </div>
      </section>

      <section className="relative py-10 md:py-14 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000" 
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 p-10 text-center shadow-lg overflow-hidden">
                {/* Background Image in Empty State */}
                <div className="absolute inset-0 opacity-5">
                  <img 
                    src="https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?auto=format&fit=crop&q=80&w=1000" 
                    alt="Empty Cart"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-igo-lime/10 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-10 h-10 text-igo-lime" />
                  </div>
                  <h2 className="text-2xl font-black text-igo-dark mb-2">Your cart is empty</h2>
                  <p className="text-igo-muted mb-6">Add products from the store to see them here.</p>
                  <button
                    type="button"
                    onClick={onContinueShopping}
                    className="bg-igo-lime text-igo-dark px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.12em] hover:bg-[#9fd620] transition-colors inline-block"
                  >
                    Go To Store
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <article
                    key={item.product.id}
                    className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 p-4 md:p-6 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                  >
                    {/* Background hover effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000" 
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-igo-muted mb-1">
                              {item.product.category}
                            </div>
                            <h3 className="text-xl font-black text-igo-dark">{item.product.name}</h3>
                            <p className="text-sm text-igo-muted mt-1">{item.product.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(item.product.id)}
                            className="text-igo-muted hover:text-red-600 transition-colors p-2"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => onDecrease(item.product.id)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                              aria-label={`Decrease quantity for ${item.product.name}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-black text-igo-dark">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onIncrease(item.product.id)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                              aria-label={`Increase quantity for ${item.product.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-xs uppercase tracking-[0.12em] font-bold text-igo-muted">
                              Item Total
                            </div>
                            <div className="text-xl font-black text-green-700">{formatCurrency(lineTotal)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <aside className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 p-6 md:p-8 shadow-lg h-fit lg:sticky lg:top-28 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <img 
                src="https://images.unsplash.com/photo-1552820728-8ac41f1ce891?auto=format&fit=crop&q=80&w=1000" 
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-igo-dark mb-6 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-igo-lime" />
                Order Summary
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-igo-muted">Subtotal</span>
                  <span className="font-black text-igo-dark">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-igo-muted">Delivery</span>
                  <span className="font-black text-green-600">Included</span>
                </div>
                <div className="flex items-center justify-between text-base pt-1 border-t-2 border-gray-200 mt-3">
                  <span className="font-black text-igo-dark uppercase tracking-[0.1em]">Total</span>
                  <span className="font-black text-green-700 text-2xl">{formatCurrency(total)}</span>
                </div>
              </div>

              {!isLoggedIn && items.length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-800 leading-relaxed">
                    🔐 Access Restricted: Please sign in or create an account to finalize your order.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onContinueShopping}
                className="mt-8 w-full bg-white border-2 border-igo-dark text-igo-dark py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.12em] hover:bg-igo-dark hover:text-white transition-all duration-300 mb-3"
              >
                Continue Shopping
              </button>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onCheckout}
                  className="w-full bg-igo-lime text-igo-dark py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.12em] hover:bg-[#9fd620] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggedIn ? 'Proceed to Checkout' : 'Login to Purchase'}
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Cart;
