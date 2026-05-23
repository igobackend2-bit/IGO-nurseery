import React from 'react';
import { Package, AlertCircle, CheckCircle2, ShoppingCart, Tag, Filter, Trash2, X, Edit2 } from 'lucide-react';
import { StoreProduct } from '../types';
import { productApi } from '../services/productApi';

interface AdminInventoryProps {
  products: StoreProduct[];
  onUpdateProducts: (products: StoreProduct[]) => void;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onUpdateProducts }) => {
  const [filter, setFilter] = React.useState<'all' | 'out' | 'archived'>('all');
  const [editingProduct, setEditingProduct] = React.useState<StoreProduct | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<StoreProduct>>({});

  const handleEditClick = (product: StoreProduct) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, price: product.price, description: product.description, category: product.category, image: product.image });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const success = await productApi.updateProduct(editingProduct.id, editForm);
    if (!success) {
      alert('Failed to update product in database.');
      return;
    }
    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? { ...p, ...editForm } : p
    );
    onUpdateProducts(updatedProducts);
    setEditingProduct(null);
  };

  const toggleStock = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStatus = !product.outOfStock;
    
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, outOfStock: newStatus } : p
    );
    onUpdateProducts(updatedProducts);
    await productApi.updateProduct(productId, { outOfStock: newStatus });
  };

  const toggleArchive = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStatus = !product.isArchived;

    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, isArchived: newStatus } : p
    );
    onUpdateProducts(updatedProducts);
    await productApi.updateProduct(productId, { isArchived: newStatus });
  };

  const deletePermanently = async (productId: string) => {
    if (window.confirm('PERMANENT DELETION: This will remove the asset from all database records. Proceed?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      onUpdateProducts(updatedProducts);
      await productApi.deleteProduct(productId);
    }
  };

  const restoreAll = async () => {
    const archived = products.filter(p => p.isArchived);
    const updatedProducts = products.map(p => ({ ...p, isArchived: false }));
    onUpdateProducts(updatedProducts);
    
    for (const p of archived) {
      await productApi.updateProduct(p.id, { isArchived: false });
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const forceResetCatalog = async () => {
    if (window.confirm('EMERGENCY ACTION: This will wipe all inventory modifications and restore the factory master list. Continue?')) {
      await productApi.seedInitialProducts();
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
                Restore All ({products.filter(p => p.isArchived).length})
              </button>
           )}
           <button 
             onClick={forceResetCatalog}
             className="px-6 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-800 transition-all border border-gray-800"
             title="Wipe database and restore all factory default products"
           >
             Restore Master Catalog
           </button>
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
                            onClick={() => handleEditClick(product)}
                            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-igo-dark hover:text-white transition-all shadow-sm border border-gray-200"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
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

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-black uppercase text-igo-dark mb-6">Edit Asset</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Name</label>
                <input 
                  type="text" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-igo-dark"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editForm.price || 0} 
                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-igo-dark"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Category</label>
                  <input 
                    type="text" 
                    value={editForm.category || ''} 
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-igo-dark"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={editForm.image || ''} 
                  onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Description</label>
                <textarea 
                  value={editForm.description || ''} 
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 bg-igo-lime text-igo-dark py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
