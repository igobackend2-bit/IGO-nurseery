import React from 'react';
import { Package, AlertCircle, CheckCircle2, ShoppingCart, Tag, Filter, Trash2, X } from 'lucide-react';
import { StoreProduct } from '../types';

interface AdminInventoryProps {
  products: StoreProduct[];
  onUpdateProducts: (products: StoreProduct[]) => void;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onUpdateProducts }) => {
  const [filter, setFilter] = React.useState<'all' | 'out' | 'archived'>('all');

  const toggleStock = (productId: string) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, outOfStock: !p.outOfStock } : p
    );
    onUpdateProducts(updatedProducts);
  };

  const toggleArchive = (productId: string) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, isArchived: !p.isArchived } : p
    );
    onUpdateProducts(updatedProducts);
  };

  const deletePermanently = (productId: string) => {
    if (window.confirm('PERMANENT DELETION: This will remove the asset from all database records. Proceed?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      onUpdateProducts(updatedProducts);
    }
  };

  const restoreAll = () => {
    const updatedProducts = products.map(p => ({ ...p, isArchived: false }));
    onUpdateProducts(updatedProducts);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const forceResetCatalog = () => {
    if (window.confirm('EMERGENCY ACTION: This will wipe all local inventory modifications and restore the factory master list. Continue?')) {
      localStorage.removeItem('igo_products');
      window.location.reload();
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'archived') return p.isArchived;
    if (filter === 'out') return p.outOfStock && !p.isArchived;
    return !p.isArchived;
  });

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Inventory Control</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Package className="w-3 h-3 text-igo-lime" /> Real-time Stock Availability & Catalog Management
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-igo-dark text-white' : 'text-gray-400 hover:text-igo-dark'}`}
              >
                All Assets
              </button>
              <button 
                onClick={() => setFilter('out')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'out' ? 'bg-igo-dark text-white' : 'text-gray-400 hover:text-igo-dark'}`}
              >
                Out of Stock
              </button>
              <button 
                onClick={() => setFilter('archived')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'archived' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-igo-dark'}`}
              >
                Archived
                {products.some(p => p.isArchived) && (
                  <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[8px]">
                    {products.filter(p => p.isArchived).length}
                  </span>
                )}
              </button>
           </div>
           {filter === 'archived' && products.some(p => p.isArchived) && (
              <button 
                onClick={restoreAll}
                className="px-6 py-2 bg-igo-lime text-igo-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all animate-in fade-in"
              >
                Restore All Assets
              </button>
           )}
           <button 
             onClick={forceResetCatalog}
             className="px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
             title="Restore Factory Default Catalog"
           >
             Reset Catalog
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
           <h2 className="text-xs font-black text-igo-dark uppercase tracking-[0.2em]">Master Inventory List</h2>
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <Filter className="w-3 h-3" /> {filteredProducts.length} Items Displayed
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest">Product Intelligence</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest text-center">Valuation</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest text-center">Status Stream</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest text-right">Execution</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 last:border-none group hover:bg-gray-50/50 transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-gray-100 shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-igo-dark tracking-tight leading-none mb-1">{product.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center font-black text-igo-dark italic">₹{product.price}</td>
                  <td className="p-8">
                    <div className="flex justify-center">
                      {product.isArchived ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl border border-gray-200">
                          <X className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Archived</span>
                        </div>
                      ) : product.outOfStock ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active Stock</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!product.isArchived ? (
                        <>
                          <button
                            onClick={() => toggleStock(product.id)}
                            className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 ${
                              product.outOfStock
                                ? 'bg-igo-lime text-igo-dark hover:shadow-lg hover:shadow-igo-lime/20'
                                : 'bg-igo-dark text-white hover:bg-gray-800'
                            }`}
                          >
                            {product.outOfStock ? 'Restock' : 'Out of Stock'}
                          </button>
                          <button
                            onClick={() => toggleArchive(product.id)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                            title="Delete (Move to Trash)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleArchive(product.id)}
                            className="px-6 py-3 bg-igo-lime text-igo-dark rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-md hover:shadow-lg hover:bg-white transition-all"
                          >
                            Restore to Store
                          </button>
                          <button
                            onClick={() => deletePermanently(product.id)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                            title="Purge Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
