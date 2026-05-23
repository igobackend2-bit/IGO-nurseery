import React, { useEffect, useState } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationPopupProps {
  message: string;
  type?: string;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 8000); // Show for 8 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'shipped':
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-igo-lime" />;
      case 'cancelled':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <Info className="w-6 h-6 text-igo-lime" />;
    }
  };

  return (
    <div
      className={`fixed top-24 right-4 z-[9999] max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 flex items-start gap-4 ring-1 ring-black/5 backdrop-blur-sm bg-white/95">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <h4 className="text-xs font-black text-igo-muted uppercase tracking-widest mb-1">
            Order Update
          </h4>
          <p className="text-sm font-bold text-igo-dark leading-snug">
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-igo-muted" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;
