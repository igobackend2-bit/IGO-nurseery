
import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Page } from '../types';

interface FooterProps {
  setCurrentPage: (p: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const handleNav = (p: Page) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(p);
  };

  return (
    <footer className="bg-gray-950 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Brand Info - Logo Match */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={handleNav(Page.Home)}>
              <img
                src="/images/branding/igo-logo.jpg"
                alt="IGO Agritechfarms"
                className="h-16 w-auto rounded-lg border border-white/20 shadow-sm object-contain bg-white"
              />
            </div>
            <p className="text-gray-400 font-light leading-relaxed">
              Pioneering high-tech greenery solutions for modern living. From precision-grown indoor plants to large-scale resort landscapes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-igo-lime hover:text-igo-dark transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-igo-lime hover:text-igo-dark transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-igo-lime hover:text-igo-dark transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-igo-lime hover:text-igo-dark transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-igo-lime uppercase tracking-widest text-xs">Navigation</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button onClick={handleNav(Page.Shop)} className="hover:text-igo-lime transition-colors text-left">Shop Plants</button></li>
              <li><button onClick={handleNav(Page.Product)} className="hover:text-igo-lime transition-colors text-left">Product Page</button></li>
              <li><button onClick={handleNav(Page.Cart)} className="hover:text-igo-lime transition-colors text-left">Cart</button></li>
              <li><button onClick={handleNav(Page.Landscape)} className="hover:text-igo-lime transition-colors text-left">Landscape Design</button></li>
              <li><button onClick={handleNav(Page.AMC)} className="hover:text-igo-lime transition-colors text-left">Garden Care (AMC)</button></li>
              <li><button onClick={handleNav(Page.Lab)} className="hover:text-igo-lime transition-colors text-left">IGO R&D Lab</button></li>
              <li><button onClick={handleNav(Page.Knowledge)} className="hover:text-igo-lime transition-colors text-left">Knowledge Hub</button></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-igo-lime uppercase tracking-widest text-xs">Campus Visit</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-igo-lime mt-1" />
                <span>ECR, Muttukadu, Chennai, Tamil Nadu 603112</span>
              </li>
              <li>
                <div className="font-bold text-white mb-1">Mon - Sat</div>
                <div className="text-sm">09:00 AM - 06:00 PM</div>
              </li>
              <li>
                <div className="font-bold text-white mb-1">Sunday</div>
                <div className="text-sm">10:00 AM - 04:00 PM</div>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-igo-lime uppercase tracking-widest text-xs">Get in Touch</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3 hover:text-igo-lime transition-colors cursor-pointer">
                <Mail className="w-5 h-5 text-igo-lime" />
                <span>hello@igonursery.com</span>
              </li>
              <li className="flex items-center gap-3 hover:text-igo-lime transition-colors cursor-pointer">
                <Phone className="w-5 h-5 text-igo-lime" />
                <span>+91 98400 00000</span>
              </li>
              <li className="mt-8">
                <div className="bg-white/5 p-6 rounded-2xl">
                  <h5 className="font-bold text-white mb-2 text-sm">Join the IGO Collective</h5>
                  <div className="flex gap-2">
                    <input type="email" placeholder="Email" className="bg-transparent border border-white/20 px-4 py-2 rounded-lg text-sm flex-grow focus:outline-none focus:border-igo-lime" />
                    <button className="bg-igo-lime text-igo-dark px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">Join</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
          <div>© 2026 IGO AGRI TECHFARMS PVT LTD. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-8">
            <button onClick={handleNav(Page.PrivacyPolicy)} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={handleNav(Page.TermsOfService)} className="hover:text-white transition-colors">Terms of Service</button>
            <button onClick={handleNav(Page.ShippingInfo)} className="hover:text-white transition-colors">Shipping Info</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
