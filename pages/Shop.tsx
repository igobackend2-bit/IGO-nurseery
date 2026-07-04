import React, { useMemo, useState } from 'react';
import { Search, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, AlertCircle, Heart } from 'lucide-react';
import { Product, StoreProduct } from '../types';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';
import { useWishlist } from '../hooks/useWishlist';

// Plant data imported from centralised file below

import { PLANT_SEEDS } from '../data/plantSeeds';

const CATEGORY_PROFILE: Record<
  string,
  { basePrice: number; maintenance: Product['maintenance']; light: Product['light'] }
> = {
  Indoor: { basePrice: 899, maintenance: 'Medium', light: 'Indirect' },
  Outdoor: { basePrice: 799, maintenance: 'Medium', light: 'Direct' },
  Herbs: { basePrice: 249, maintenance: 'Low', light: 'Direct' },
  Creepers: { basePrice: 449, maintenance: 'Medium', light: 'Direct' },
  Vegetables: { basePrice: 349, maintenance: 'Medium', light: 'Direct' },
  Fruits: { basePrice: 699, maintenance: 'Medium', light: 'Direct' },
  'Cactus & Succulent': { basePrice: 499, maintenance: 'Low', light: 'Direct' },
};

const DEFAULT_PROFILE = CATEGORY_PROFILE.Outdoor;

const MOCK_PRODUCTS: Product[] = PLANT_SEEDS.map((plant, index) => {
  const profile = CATEGORY_PROFILE[plant.category] ?? DEFAULT_PROFILE;
  return {
    id: String(index + 1),
    name: plant.name,
    category: plant.category,
    image: plant.image,
    price: profile.basePrice + (index % 4) * 60,
    maintenance: profile.maintenance,
    light: profile.light,
    description:
      plant.name +
      ' healthy nursery plant, acclimatized and ready for home gardens and balcony spaces.',
  };
});

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

interface ShopProps {
  products: StoreProduct[];
  addToCart: (product: StoreProduct) => void;
  onOpenProduct?: (slug: string) => void;
}

const Shop: React.FC<ShopProps> = ({ products, addToCart, onOpenProduct }) => {
  // SEO: Unique title, meta description, and canonical for /store page
  useSEO(SEO_CONFIGS.store);

  const { isInWishlist, toggleWishlist } = useWishlist();

  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Outdoor',
    'Indoor',
    'Herbs',
    'Creepers',
    'Vegetables',
    'Fruits',
    'Cactus & Succulent',
    'Tools',
    'Support',
    'Growing Media',
    'Infrastructure',
    'Containers'
  ];

  const filteredProducts = (products || []).filter((product) => {
    if (!product || product.isArchived) return false;
    
    const categoryMatch = filter === 'All' || product.category === filter;
    const query = searchQuery.trim().toLowerCase();
    const searchMatch = query.length === 0 || (product.name && product.name.toLowerCase().includes(query));
    return categoryMatch && searchMatch;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* SEO H1 — visually styled but semantically correct for Google */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-igo-dark tracking-tight">
            Buy Plants Online India — {(products || []).filter(p => !p.isArchived).length}+ Premium Nursery Plants
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Polyhouse-grown at Muttukadu, Chennai · Free pan-India delivery · 99.2% health guarantee</p>
          {/* Breadcrumb navigation */}
          <nav aria-label="Breadcrumb" className="mt-2">
            <ol className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <li><a href="/" className="hover:text-igo-lime transition-colors no-underline">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-igo-dark font-bold">Shop Plants</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="border-b bg-gray-50/50 sticky top-20 z-40 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={
                  'px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ' +
                  (filter === category
                    ? 'bg-green-700 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:border-green-200 border border-gray-100')
                }
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative flex-grow md:w-72 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search plants..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-sm text-gray-500 mb-6">Showing {filteredProducts.length} plants</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.outOfStock || (product.stock !== undefined && product.stock <= 0);
            const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock < 20;
            const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');

            return (
            // SEO: Using <a href> instead of <div onClick> so Google can crawl product pages
            <a
              key={product.id}
              href={`/product/${productSlug}`}
              onClick={(e) => { e.preventDefault(); onOpenProduct && onOpenProduct(productSlug); }}
              className={`group cursor-pointer block no-underline ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/product-fallback.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> Out of Stock
                      </p>
                    </div>
                  </div>
                )}
                
                {!isOutOfStock && isLowStock && (
                  <div className="absolute bottom-4 left-4 z-10">
                     <span className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Low Stock ({product.stock})
                     </span>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Premium Quality
                  </span>
                </div>

                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-4 right-4 p-2.5 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-colors z-20"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                
                <button
                  disabled={isOutOfStock}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!isOutOfStock) addToCart(product);
                  }}
                  className={`absolute bottom-4 right-4 p-4 rounded-2xl shadow-xl transition-all duration-300 z-10 ${
                    isOutOfStock 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-start gap-3">
                  <h3 className={`text-lg font-bold leading-tight ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>{product.name}</h3>
                  {!isOutOfStock && (
                    <div className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-current mr-1" /> 4.9
                    </div>
                  )}
                </div>
                <p className={`text-xs font-semibold ${isOutOfStock ? 'text-gray-300' : 'text-green-700'}`}>{product.category}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className={`text-lg font-bold pt-2 ${isOutOfStock ? 'text-gray-300 line-through' : 'text-green-700'}`}>
                  {formatCurrency(product.price)}
                </div>
              </div>
            </a>
          )})}
        </div>
      </div>

      <section className="bg-gray-50 border-t mt-20 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-green-600 mb-4" />
            <h4 className="font-bold text-xl mb-2">Health Guaranteed</h4>
            <p className="text-gray-500 text-sm">Every plant is checked by IGO Lab experts before dispatch.</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="w-12 h-12 text-green-600 mb-4" />
            <h4 className="font-bold text-xl mb-2">Safe Pan-India Delivery</h4>
            <p className="text-gray-500 text-sm">Special protective packaging ensures zero leaf damage.</p>
          </div>
          <div className="flex flex-col items-center">
            <RotateCcw className="w-12 h-12 text-green-600 mb-4" />
            <h4 className="font-bold text-xl mb-2">15-Day Free Returns</h4>
            <p className="text-gray-500 text-sm">Not happy with the health? We'll replace it, no questions asked.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
