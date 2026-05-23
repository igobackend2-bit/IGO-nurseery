
import React, { useState } from 'react';
import { Page } from '../types';
import { ShoppingCart, Menu, Search, Zap, X, ChevronRight, Package, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  cartCount: number;
  isAdmin: boolean;
  onToggleAdminMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, cartCount, isAdmin, onToggleAdminMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Store', page: Page.Shop },
    { name: 'Product', page: Page.Product },
    { name: 'Landscape Studio', page: Page.Landscape },
    { name: 'AMC Care', page: Page.AMC },
    { name: 'Tech Lab', page: Page.Lab },
    { name: 'Knowledge', page: Page.Knowledge },
  ];

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Brand Identity - Exact Logo Match */}
            <div 
              className="flex items-center gap-3 cursor-pointer group py-2"
              onClick={() => handleNav(Page.Home)}
            >
              <img
                src="/images/branding/igo-logo.jpg"
                alt="IGO Agritechfarms"
                className="h-14 w-auto rounded-lg border border-gray-100 shadow-sm object-contain bg-white"
              />
            </div>

            {/* Precision Nav (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-10">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNav(item.page)}
                  className={`text-xs uppercase tracking-widest font-bold transition-all hover:text-igo-lime relative py-2 ${
                    currentPage === item.page ? 'text-igo-lime after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-igo-lime' : 'text-igo-muted'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Utility Stack */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center mr-4 pr-4 border-r border-gray-100">
                <div className="flex items-center gap-2 text-[10px] font-black text-igo-muted uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-igo-lime animate-ping"></div>
                  Live Lab: <span className="text-igo-dark">28.4°C</span>
                </div>
              </div>
              
              <button 
                aria-label="Search products"
                className="p-2.5 text-igo-dark hover:bg-gray-50 rounded-xl transition-colors hidden md:block"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => handleNav(Page.Assistant)}
                className="bg-igo-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-igo-charcoal transition-all shadow-lg hidden md:flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-igo-lime" />
                AI Assistant
              </button>



              <div className="relative ml-2">
                <button
                  onClick={() => handleNav(Page.Cart)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    currentPage === Page.Cart
                      ? 'bg-igo-dark text-white'
                      : 'text-igo-dark hover:bg-gray-50'
                  }`}
                  aria-label="Open shopping cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-igo-lime text-igo-dark text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
              
              <button 
                onClick={() => setIsMenuOpen(true)} 
                aria-label="Open navigation menu"
                className="lg:hidden p-2.5 text-igo-dark bg-gray-50 rounded-xl ml-2"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-igo-dark/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl transition-transform duration-500 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
             <img
                src="/images/branding/igo-logo.jpg"
                alt="IGO Agritechfarms"
                className="h-14 w-auto rounded-lg border border-gray-100 shadow-sm object-contain bg-white"
             />
             <button 
                onClick={() => setIsMenuOpen(false)} 
                aria-label="Close navigation menu"
                className="p-2 bg-gray-100 rounded-full"
             >
                <X className="w-6 h-6" />
             </button>
          </div>

          <nav className="flex-grow space-y-2">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold text-igo-dark hover:bg-igo-lime hover:text-white transition-all group"
              >
                <span className="uppercase tracking-widest text-sm">{item.name}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            

            
            <button 
              onClick={() => handleNav(Page.Assistant)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-igo-dark text-white font-bold mt-4 shadow-xl"
            >
              <Zap className="w-4 h-4 text-igo-lime" />
              <span className="uppercase tracking-widest text-sm">Garden Assistant</span>
            </button>
          </nav>

          <div className="border-t pt-8 space-y-4">
            {isAdmin && (
              <button
                onClick={() => {
                  onToggleAdminMode();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all bg-red-100 text-red-800 hover:bg-red-200"
              >
                🔐 Sign Out
              </button>
            )}
            
            <div className="text-[10px] font-black text-igo-muted uppercase tracking-[0.2em] mb-4">Muttukadu Headquarters</div>
            <p className="text-sm text-gray-500 mb-6">ECR Road, Muttukadu, Chennai 603112</p>
            <button 
                onClick={() => handleNav(Page.Visit)}
                className="text-igo-dark font-black uppercase text-xs tracking-widest border-b-2 border-igo-lime pb-1"
            >
                Book Campus Visit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
