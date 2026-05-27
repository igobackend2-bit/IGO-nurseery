
import React, { useState } from 'react';
import { Calendar, UserCheck, ShieldPlus, ChevronRight, CheckCircle, CreditCard, Smartphone, ArrowLeft, Loader2 } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

const AMC_PLANS = [
  { 
    id: 'essential',
    name: 'Essential Care', 
    price: 2500, 
    priceDisplay: '₹2,500/mo',
    visits: '2 Visits / Month', 
    features: ['Fertilizing & Nutrients', 'Pruning & Grooming', 'Pest Monitoring', 'Soil Health Check'],
    target: 'Home Balconies & Small Lawns',
    color: 'border-gray-100'
  },
  { 
    id: 'premium',
    name: 'Premium Growth', 
    price: 7500, 
    priceDisplay: '₹7,500/mo',
    visits: '4 Visits / Month', 
    features: ['Everything in Essential', 'Seasonal Repotting', 'Disease Management', 'Irrigation Tuning', 'Free Expert Consult (Monthly)'],
    target: 'Villas & Large Private Gardens',
    color: 'border-green-600 ring-2 ring-green-600/20',
    badge: 'Most Popular'
  },
  { 
    id: 'elite',
    name: 'Elite Estate', 
    price: 0, // Custom quote
    priceDisplay: 'Custom Quote', 
    visits: 'Daily/Weekly Care', 
    features: ['Full-time Gardener Placement', 'Bi-weekly Lab Analysis', 'Inventory Management', 'Tech/IoT Monitoring', 'Complete Plant Replacements'],
    target: 'Resorts, Corporate Parks & Large Estates',
    color: 'border-gray-100'
  }
];

const AMC: React.FC = () => {
  useSEO(SEO_CONFIGS.amc);
  const [selectedPlan, setSelectedPlan] = useState<typeof AMC_PLANS[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [inspectionRequested, setInspectionRequested] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    issue: '',
    auditDate: ''
  });

  const handleRequestInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await customerApi.submitLead({
        type: 'inspection',
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        location: formData.location,
        issue: formData.issue,
        auditDate: formData.auditDate,
        message: 'Requesting a garden inspection'
      });
      setInspectionRequested(true);
      setShowDetails(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPlan = (plan: typeof AMC_PLANS[0]) => {
    setSelectedPlan(plan);
    setShowDetails(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await customerApi.submitLead({
        type: 'payment-notification',
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        location: formData.location,
        issue: formData.issue,
        auditDate: formData.auditDate,
        selectedPlan: selectedPlan?.name,
        planName: selectedPlan?.name,
        amount: selectedPlan?.price,
        cost: selectedPlan?.price,
        message: `Paid for ${selectedPlan?.name} via ${paymentMethod.toUpperCase()}`
      });
      setPaymentDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentDone) {
    return (
      <div className="bg-white min-h-screen py-32 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-8 shadow-xl animate-in zoom-in duration-500">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter mb-4">Payment Successful!</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-10 font-medium">Your {selectedPlan?.name} subscription is now active. Our team will contact you to schedule your first visit.</p>
        <button 
          onClick={() => { setPaymentDone(false); setShowPayment(false); setSelectedPlan(null); }}
          className="bg-igo-dark text-white px-10 py-4 rounded-xl font-bold hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl uppercase tracking-widest text-xs"
        >
          Return to Plans
        </button>
      </div>
    );
  }

  if (showDetails) {
    return (
      <div className="bg-gray-50 min-h-screen py-24">
        <div className="max-w-3xl mx-auto px-4">
          <button 
            onClick={() => { setShowDetails(false); setSelectedPlan(null); }}
            className="flex items-center gap-2 text-igo-muted font-bold uppercase text-[10px] tracking-widest mb-12 hover:text-igo-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>

          <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-100">
            <h2 className="text-4xl font-black text-igo-dark uppercase tracking-tighter mb-8 italic">
              {selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Inspection Details'}
            </h2>
            
            <form onSubmit={selectedPlan ? (e) => { e.preventDefault(); setShowDetails(false); setShowPayment(true); } : handleRequestInspection} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Full Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="Full Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Email Address</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="email@address.com" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="+91 12345 67890" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Location / City</label>
                  <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="e.g. Hyderabad" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Full Address</label>
                <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="Complete site address..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Current Garden Issues</label>
                <textarea value={formData.issue} onChange={(e) => setFormData({...formData, issue: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium h-24 resize-none" placeholder="Describe the issues you are facing..."></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Preferred Audit/Visit Date</label>
                <input required type="date" value={formData.auditDate} onChange={(e) => setFormData({...formData, auditDate: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" />
              </div>

              <button 
                disabled={isProcessing}
                type="submit"
                className="w-full bg-green-700 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-igo-dark transition-all shadow-xl"
              >
                {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : (selectedPlan ? 'Continue to Payment' : 'Submit Inspection Request')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showPayment && selectedPlan) {
    return (
      <div className="bg-gray-50 min-h-screen py-24">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => setShowPayment(false)}
            className="flex items-center gap-2 text-igo-muted font-bold uppercase text-[10px] tracking-widest mb-12 hover:text-igo-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </button>
          
          <div className="grid lg:grid-cols-2 gap-12 pt-8">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-igo-dark uppercase tracking-tighter">Complete <br/><span className="text-green-700">Subscription.</span></h2>
              
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-4">Selected Plan</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-igo-dark">{selectedPlan.name}</h3>
                    <p className="text-sm text-gray-500">{selectedPlan.visits}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-700">{selectedPlan.priceDisplay}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted ml-4">Payment Method</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'border-green-600 bg-green-50/50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                  >
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-green-700' : 'text-gray-400'}`} />
                    <span className="font-bold text-igo-dark">Card</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'upi' ? 'border-green-600 bg-green-50/50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                  >
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-green-700' : 'text-gray-400'}`} />
                    <span className="font-bold text-igo-dark">UPI</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
              {paymentMethod === 'card' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Cardholder Name</label>
                    <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Card Number</label>
                    <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Expiry</label>
                      <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">CVV</label>
                      <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="***" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-6">
                   <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl mx-auto flex flex-col items-center justify-center p-8">
                     <div className="w-full aspect-square bg-white shadow-sm rounded-xl flex items-center justify-center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IGO-Agritech-Farms" alt="UPI QR" className="w-32 h-32" />
                     </div>
                   </div>
                   <div>
                     <p className="text-sm font-black text-igo-dark">Scan to Pay via UPI</p>
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Accepting BHIM, PhonePe, GPay, Paytm</p>
                   </div>
                   <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                      <span className="relative bg-white px-4 text-[10px] font-black text-gray-300 uppercase">OR</span>
                   </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted text-left block">UPI ID / VPA</label>
                    <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium" placeholder="username@upi" />
                  </div>
                </div>
              )}

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-700 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-igo-dark transition-all shadow-xl mt-10 flex items-center justify-center gap-3"
              >
                {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : <>Add to Pay & Subscribe</>}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                <ShieldPlus className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secured 256-bit SSL Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-green-50 py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-green-700 font-bold uppercase tracking-widest text-sm mb-4">Elite Garden Services</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8">Professional Care for <span className="text-green-700 italic">Precious Spaces.</span></h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-12">Don't let your investment fade. Our AMC plans provide certified agronomists and skilled gardeners to keep your space thriving all year round.</p>
          <div className="flex justify-center">
            {inspectionRequested ? (
              <div className="bg-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-3 text-green-700 border border-green-200 animate-in fade-in slide-in-from-bottom-2 mx-auto">
                <CheckCircle className="w-5 h-5" /> Inspection Requested!
              </div>
            ) : (
              <button 
                onClick={() => setShowDetails(true)}
                className="bg-green-700 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:bg-green-800 transition-all flex items-center gap-3"
              >
                Request Garden Inspection
              </button>
            )}
          </div>
        </div>
      </section>

      {/* AMC Plans */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {AMC_PLANS.map((plan, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border bg-white flex flex-col relative transition-all hover:shadow-2xl ${plan.color} ${i === 1 ? 'scale-105 z-10 shadow-xl' : 'scale-100'}`}>
              {plan.badge && <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-700 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{plan.badge}</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-gray-500 text-sm mb-6">{plan.target}</div>
              <div className="text-4xl font-bold text-gray-900 mb-8">{plan.priceDisplay}</div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <ChevronRight className="w-4 h-4 text-green-600" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all bg-green-700 text-white hover:bg-green-800 shadow-md`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 border-t">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
            <div className="text-center">
                <Calendar className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h4 className="text-xl font-bold mb-3">Guaranteed Visits</h4>
                <p className="text-gray-500">Digital logs and attendance tracking for every maintenance session.</p>
            </div>
            <div className="text-center">
                <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h4 className="text-xl font-bold mb-3">Certified Experts</h4>
                <p className="text-gray-500">Gardeners trained in IGO Lab techniques for superior plant longevity.</p>
            </div>
            <div className="text-center">
                <ShieldPlus className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h4 className="text-xl font-bold mb-3">Replenishment Policy</h4>
                <p className="text-gray-500">If a plant dies under our watch, we replace it for free (Elite Plan).</p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default AMC;
