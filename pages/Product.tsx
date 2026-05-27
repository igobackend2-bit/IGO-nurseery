import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { StoreProduct, Page } from '../types';
import { NURSERY_PRODUCTS } from '../data/nurseryProducts';
import { PLANT_SEEDS } from '../data/plantSeeds';

const PRODUCTS = NURSERY_PRODUCTS;

const getProductImagePath = (fileName: string): string => {
  if (!fileName) return '/images/placeholder.png';
  return `/images/product%20nursery/${encodeURIComponent(fileName)}`;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

interface ProductProps {
  products: StoreProduct[];
  selectedSlug?: string | null;
  onOpenProduct?: (slug: string) => void;
  onAddToCart?: (product: StoreProduct) => void;
}

const Product: React.FC<ProductProps> = ({ products = [], selectedSlug = null, onOpenProduct, onAddToCart }) => {
  let selectedProduct: any = selectedSlug
    ? (products || []).find((product) => product && product.slug === selectedSlug) ||
      (PRODUCTS || []).find((product) => product && product.slug === selectedSlug) ||
      (() => {
        const seedProd = (PLANT_SEEDS || []).find((s) => s && s.name.toLowerCase().replace(/ /g, '-') === selectedSlug);
        if (seedProd) {
          return {
            id: `seed-${selectedSlug}`,
            slug: selectedSlug,
            name: seedProd.name,
            category: seedProd.category,
            image: seedProd.image,
            price: 899,
            description: `${seedProd.name} healthy nursery plant, acclimatized and ready for home gardens.`,
            mrp: 1099,
            unit: 'Per plant'
          };
        }
        return null;
      })()
    : null;

  // Clone to avoid direct mutation of state/static data
  if (selectedProduct) {
    selectedProduct = { ...selectedProduct };
    if (!selectedProduct.mrp) {
      selectedProduct.mrp = Math.round((selectedProduct.price || 0) * 1.2);
    }
    if (!selectedProduct.unit) {
      selectedProduct.unit = 'Per plant';
    }
  }

  useEffect(() => {
    if (selectedProduct && selectedProduct.name) {
      try {
        const stored = localStorage.getItem('igo_viewed_products');
        let viewed = stored ? JSON.parse(stored) : [];
        viewed = viewed.filter((name: string) => name !== selectedProduct.name);
        viewed.unshift(selectedProduct.name);
        if (viewed.length > 5) viewed = viewed.slice(0, 5);
        localStorage.setItem('igo_viewed_products', JSON.stringify(viewed));
      } catch (e) {
        console.error('Failed to save viewed products', e);
      }
    }
  }, [selectedProduct?.name]);

  const openProductPage = (slug: string) => {
    if (onOpenProduct) {
      onOpenProduct(slug);
    }
  };

  const openCatalog = () => {
    if (onOpenProduct) {
      (onOpenProduct as any)(Page.Product); 
    } else {
      window.location.hash = 'product';
    }
  };

  if (selectedSlug && !selectedProduct) {
    return (
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black tracking-tight mb-4">Product not found</h1>
          <p className="text-igo-muted mb-8">The product page you requested is unavailable.</p>
          <button
            onClick={openCatalog}
            className="bg-igo-dark text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest"
          >
            Back to Product List
          </button>
        </div>
      </section>
    );
  }

  if (selectedProduct) {
    const savings = selectedProduct.mrp - selectedProduct.price;
    const relatedProducts = (products || []).filter((item) => item && item.slug && item.slug !== selectedProduct.slug).slice(0, 3);
    
    const handleAddCurrentProductToCart = () => {
      if (!onAddToCart || selectedProduct.outOfStock) return;
      onAddToCart(selectedProduct);
    };

    return (
      <div className="animate-in fade-in duration-500">
        <section className="bg-igo-dark text-white py-18">
          <div className="max-w-7xl mx-auto px-4">
            <button
              onClick={openCatalog}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-black text-igo-lime mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Product List
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">{selectedProduct.name}</h1>
                <p className="text-gray-300 text-lg mt-6 max-w-3xl">{selectedProduct.description}</p>
              </div>
              {selectedProduct.outOfStock && (
                <div className="bg-red-500/20 border border-red-500/50 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                   <AlertCircle className="w-6 h-6 text-red-500" />
                   <span className="text-sm font-black uppercase tracking-widest text-red-500">Currently Out of Stock</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
            <div className={`bg-white border border-gray-100 rounded-3xl p-5 shadow-sm ${selectedProduct.outOfStock ? 'grayscale-[0.5]' : ''}`}>
              <img
                src={selectedProduct.image || getProductImagePath((selectedProduct as any).imageFile)}
                alt={selectedProduct.name}
                className="w-full h-[420px] object-cover rounded-2xl"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-8">
                <div className="text-xs uppercase tracking-[0.2em] font-black text-igo-lime mb-3">{selectedProduct.category}</div>
                <div className={`text-4xl font-black ${selectedProduct.outOfStock ? 'text-gray-400' : 'text-igo-dark'}`}>{formatCurrency(selectedProduct.price)}</div>
                <div className="mt-2 text-sm text-igo-muted">
                  MRP <span className="line-through">{formatCurrency(selectedProduct.mrp)}</span> • You save {formatCurrency(savings)}
                </div>
                <div className="mt-3 text-sm font-semibold text-igo-dark">Unit: {selectedProduct.unit}</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-8">
                <h2 className="text-xl font-black mb-4">Availability Intelligence</h2>
                {selectedProduct.outOfStock ? (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-xs font-bold text-red-800 leading-relaxed">
                      This item is currently unavailable in our main nursery stock. Our horticultural team is working on replenishing this species.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-xs font-bold text-green-800 leading-relaxed">
                      In Stock: High-health specimen verified by IGO Lab. Ready for immediate dispatch from our regional hub.
                    </p>
                  </div>
                )}
              </div>

              <button
                disabled={selectedProduct.outOfStock}
                onClick={handleAddCurrentProductToCart}
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest inline-flex items-center justify-center gap-3 shadow-xl transition-all ${
                  selectedProduct.outOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-igo-dark text-white hover:bg-igo-charcoal active:scale-95'
                }`}
              >
                {selectedProduct.outOfStock ? (
                  <>Not Available</>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Collection
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-black mb-6">More Products</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => openProductPage(item.slug)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-lg transition-all"
                >
                  <img src={item.image || getProductImagePath((item as any).imageFile)} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                  <h4 className="font-black text-igo-dark mb-1">{item.name}</h4>
                  <div className="text-sm text-igo-muted">{formatCurrency(item.price)}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <section className="bg-igo-dark text-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
            <Package className="w-4 h-4 text-igo-lime" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold">Product Page</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl leading-[0.95]">
            Nursery Products With Dedicated Detail Pages.
          </h1>
          <p className="text-gray-400 text-lg mt-8 max-w-2xl">
            Open any product to view its own page with image, price, and pricing breakdown.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-igo-dark">All Products</h2>
              <p className="text-igo-muted mt-2">Click any item to open its own product detail page.</p>
            </div>
            <div className="text-xs font-black uppercase tracking-[0.25em] text-igo-lime bg-igo-dark px-4 py-2 rounded-full">
              {PRODUCTS.length} Products
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {PRODUCTS.map((product, index) => (
              <div key={product.slug} className="group [perspective:1200px]">
                <div className="h-full rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-500 transform-gpu [transform:rotateX(7deg)_rotateY(-6deg)] group-hover:[transform:rotateX(0deg)_rotateY(0deg)_translateY(-8px)] group-hover:shadow-2xl">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getProductImagePath(product.imageFile)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-igo-lime">{product.category}</span>
                      <span className="text-[10px] font-black text-igo-muted">#{index + 1}</span>
                    </div>
                    <h3 className="text-base font-black text-igo-dark leading-snug min-h-[3rem]">{product.name}</h3>
                    <div className="text-lg font-black text-igo-dark mt-2">{formatCurrency(product.price)}</div>
                    <div className="text-xs text-igo-muted">{product.unit}</div>

                    <button
                      onClick={() => openProductPage(product.slug)}
                      className="mt-4 w-full bg-igo-dark text-white py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-igo-charcoal transition-colors inline-flex items-center justify-center gap-2"
                    >
                      View Product Page <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Product;
