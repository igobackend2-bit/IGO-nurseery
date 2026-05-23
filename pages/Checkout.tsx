import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, CheckCircle, Truck, CreditCard } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutProps {
  items: CartItem[];
  onBack: () => void;
  onSubmitOrder: (orderData: OrderData) => void;
}

export interface OrderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'card' | 'upi' | 'bank-transfer';
  lastFour?: string;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const Checkout: React.FC<CheckoutProps> = ({ items, onBack, onSubmitOrder }) => {
  const [formData, setFormData] = useState<OrderData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card',
    lastFour: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryCharge + tax;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (formData.paymentMethod === 'card' && (!formData.lastFour || !/^\d{4}$/.test(formData.lastFour))) {
      newErrors.lastFour = 'Please enter exactly 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmitOrder(formData);
      } catch (err) {
        console.error("Order submission failed:", err);
        setIsSubmitting(false);
      }
    } else {
      alert("Please scroll up and fill out all the required checkout fields correctly in red.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-igo-dark font-black uppercase text-xs tracking-widest mb-4 hover:text-igo-lime transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-igo-lime" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-igo-dark">Checkout</h1>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-2xl font-black text-igo-dark mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-igo-lime text-igo-dark flex items-center justify-center text-sm font-black">1</span>
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.email ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="9876543210"
                      />
                      {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-2xl font-black text-igo-dark mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-igo-lime text-igo-dark flex items-center justify-center text-sm font-black">2</span>
                    Shipping Address
                  </h2>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors resize-none ${
                        errors.address ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                      }`}
                      rows={3}
                      placeholder="Street address"
                    />
                    {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid md:grid-cols-3 gap-5 mt-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.city ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="Chennai"
                      />
                      {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.state ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="Tamil Nadu"
                      />
                      {errors.state && <p className="text-red-600 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-igo-muted mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`w-full rounded-2xl px-4 py-3 border-2 outline-none transition-colors ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                        }`}
                        placeholder="600001"
                      />
                      {errors.zipCode && <p className="text-red-600 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-2xl font-black text-igo-dark mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-igo-lime text-igo-dark flex items-center justify-center text-sm font-black">3</span>
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {[
                      { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                      { value: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: CheckCircle },
                      { value: 'bank-transfer', label: 'Bank Transfer', icon: Truck },
                    ].map(({ value, label }) => (
                      <div key={value} className="space-y-3">
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${formData.paymentMethod === value ? 'border-igo-lime bg-igo-lime/5' : 'border-gray-200 hover:border-igo-lime'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={value}
                            checked={formData.paymentMethod === value}
                            onChange={handleChange}
                            className="w-5 h-5 text-igo-lime"
                          />
                          <span className="text-sm font-black text-igo-dark">{label}</span>
                        </label>
                        
                        {value === 'card' && formData.paymentMethod === 'card' && (
                          <div className="ml-10 p-5 bg-white border-2 border-igo-lime/20 rounded-2xl animate-in slide-in-from-left-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-igo-muted mb-2">
                              For Reference Only: Last 4 Card Digits*
                            </label>
                            <input
                              type="text"
                              name="lastFour"
                              maxLength={4}
                              value={formData.lastFour}
                              onChange={handleChange}
                              className={`w-32 rounded-xl px-4 py-2 border-2 outline-none text-center font-bold tracking-[0.5em] ${
                                errors.lastFour ? 'border-red-500' : 'border-gray-200 focus:border-igo-lime'
                              }`}
                              placeholder="0000"
                            />
                            {errors.lastFour && <p className="text-red-600 text-[10px] mt-1 font-bold">{errors.lastFour}</p>}
                            <p className="text-[10px] text-gray-400 mt-2 italic font-bold">Note: We never ask for your full card number or CVV.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 ${
                    isSubmitting 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-igo-lime text-igo-dark hover:bg-[#9fd620] shadow-lg shadow-igo-lime/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-4 border-gray-400 border-t-igo-dark rounded-full animate-spin"></div>
                      Processing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm h-fit lg:sticky lg:top-28">
            <h2 className="text-2xl font-black text-igo-dark mb-6">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="flex-1">
                    <p className="text-sm font-black text-igo-dark">{item.product.name}</p>
                    <p className="text-xs text-igo-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-igo-dark">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-gray-100 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-igo-muted">Subtotal</span>
                <span className="font-black text-igo-dark">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-igo-muted">Tax (5%)</span>
                <span className="font-black text-igo-dark">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-igo-muted">Delivery</span>
                <span className="font-black text-igo-dark">{deliveryCharge === 0 ? 'Free' : formatCurrency(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-lg pt-3 border-t border-gray-100 mt-3">
                <span className="font-black text-igo-dark">Total</span>
                <span className="font-black text-green-700 text-2xl">{formatCurrency(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
