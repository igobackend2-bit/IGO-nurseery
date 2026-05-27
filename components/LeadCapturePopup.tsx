import React, { useState, useEffect } from 'react';
import { X, Mail, User, Phone, Sparkles } from 'lucide-react';
import { customerApi } from '../services/customerApi';

const LeadCapturePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Check if user has already dismissed or submitted the popup in this session/browser
    const dismissed = localStorage.getItem('igo_lead_popup_dismissed');
    if (dismissed === 'true') {
      setHasDismissed(true);
      return;
    }

    // Show popup after a delay (e.g., 5 seconds)
    // The user requested "for 2 mintues", so we could also set an auto-close or a 2-min delay.
    // We will use a 5-second delay so it's actually visible to the user during browsing.
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        setIsVisible(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [hasDismissed]);

  // Auto-close after 2 minutes (120000ms) if not interacted with, as requested "for 2 mintues"
  useEffect(() => {
    let autoCloseTimer: NodeJS.Timeout;
    if (isVisible) {
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 120000);
    }
    return () => clearTimeout(autoCloseTimer);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setHasDismissed(true);
    localStorage.setItem('igo_lead_popup_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    
    let reasonData: any = { products: [], pages: [], timeSpent: '0 mins' };
    try {
      const storedProducts = localStorage.getItem('igo_viewed_products');
      if (storedProducts) {
        reasonData.products = JSON.parse(storedProducts);
      }
      
      const visitedPages = sessionStorage.getItem('igo_visited_pages');
      if (visitedPages) {
        reasonData.pages = JSON.parse(visitedPages);
      }
      
      const sessionStart = sessionStorage.getItem('igo_session_start');
      if (sessionStart) {
        const minutes = Math.round((Date.now() - parseInt(sessionStart)) / 60000);
        reasonData.timeSpent = `${minutes < 1 ? '< 1' : minutes} mins`;
      }
    } catch (e) {}

    const reasonText = JSON.stringify(reasonData);

    // Save to CRM as a general inquiry
    await customerApi.submitLead({
      type: 'general-inquiry',
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      reason: reasonText,
      status: 'new'
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Hide popup after success message
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  if (!isVisible || hasDismissed) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={handleClose}
      />
      
      {/* Popup Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-500 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center">
             <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                <Sparkles className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-igo-dark uppercase tracking-tighter mb-2">Welcome to IGO!</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You've successfully joined our collective.</p>
          </div>
        ) : (
          <>
            <div className="p-10 text-center border-b border-gray-50 bg-gray-50/50">
               <h3 className="text-3xl font-black text-igo-dark uppercase tracking-tighter mb-2">Join the Collective</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Get exclusive access to premium agricultural insights and offers.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Full Name *</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     required
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-igo-dark outline-none focus:border-igo-lime focus:ring-1 focus:ring-igo-lime transition-all"
                     placeholder="John Doe"
                   />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Email Address *</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="email" 
                     required
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-igo-dark outline-none focus:border-igo-lime focus:ring-1 focus:ring-igo-lime transition-all"
                     placeholder="john@example.com"
                   />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Phone Number</label>
                <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="tel" 
                     required
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-igo-dark outline-none focus:border-igo-lime focus:ring-1 focus:ring-igo-lime transition-all"
                     placeholder="+91 98765 43210"
                   />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-igo-lime text-igo-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-igo-dark hover:text-white transition-all shadow-lg flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Joining...' : 'Subscribe Now'}
              </button>
              
              <button 
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
              >
                No Thanks, I'll browse
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadCapturePopup;
