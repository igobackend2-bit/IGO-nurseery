
import React from 'react';
import { Home, Search } from 'lucide-react';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface NotFoundProps {
  onNavigateHome: (e: React.MouseEvent) => void;
  onNavigateShop: (e: React.MouseEvent) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome, onNavigateShop }) => {
  useSEO(SEO_CONFIGS.notFound);

  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-24">
      <div className="max-w-lg w-full text-center">
        <p className="text-igo-lime font-black text-sm uppercase tracking-[0.3em] mb-4">Error 404</p>
        <h1 className="text-5xl md:text-6xl font-black text-igo-dark tracking-tighter uppercase mb-6">
          Page Not Found
        </h1>
        <p className="text-igo-muted text-base leading-relaxed mb-10">
          The page you&#x2019;re looking for doesn&#x2019;t exist, may have moved, or the link may be broken.
          Let&#x2019;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center gap-2 bg-igo-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl no-underline"
          >
            <Home className="w-4 h-4" /> Back to Home
          </a>
          <a
            href="/store"
            onClick={onNavigateShop}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-igo-dark px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all no-underline"
          >
            <Search className="w-4 h-4" /> Shop Plants
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
