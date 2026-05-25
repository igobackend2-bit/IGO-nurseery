import React, { useState } from 'react';
import { Package, Search, Filter, Edit2, Trash2, X, ImagePlus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StoreProduct } from '../types';
import { productApi } from '../services/productApi';

interface AdminProductsProps {
  products: StoreProduct[];
  onUpdateProducts: (products: StoreProduct[]) => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, onUpdateProducts }) => {
  const [filter, setFilter] = useState<'all' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [editForm, setEditForm] = useState<Partial<StoreProduct>>({});

  const filteredProducts = products.filter(p => {
    const matchesFilter = filter === 'all' ? !p.isArchived : p.isArchived;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEditClick = (product: StoreProduct) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, price: product.price, description: product.description, category: product.category, image: product.image, stock: product.stock || 0, outOfStock: product.outOfStock });
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

  const toggleArchive = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStatus = !product.isArchived;

    if (!newStatus && window.confirm('Are you sure you want to remove this product from the website? It will be archived.')) {
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, isArchived: newStatus } : p
      );
      onUpdateProducts(updatedProducts);
      await productApi.updateProduct(productId, { isArchived: newStatus });
    } else if (newStatus) {
       // Restoring
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, isArchived: newStatus } : p
      );
      onUpdateProducts(updatedProducts);
      await productApi.updateProduct(productId, { isArchived: newStatus });
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Products</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Package className="w-3 h-3 text-igo-lime" /> Catalog Management & Display
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-igo-muted" />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-igo-lime transition-all w-full shadow-sm"
              />
            </div>
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-igo-dark text-white' : 'text-gray-400 hover:text-igo-dark'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilter('archived')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'archived' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-igo-dark'}`}
              >
                Archived
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {filteredProducts.map(product => {
            const isOutOfStock = product.outOfStock || (product.stock !== undefined && product.stock <= 0);
            return (
               <div key={product.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                  <div className="h-48 bg-gray-50 relative overflow-hidden">
                     <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     {product.isArchived && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                           <span className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Archived</span>
                        </div>
                     )}
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</span>
                        <div className="text-right">
                           <span className="text-xl font-black text-green-700 tracking-tighter">₹{product.price}</span>
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">PER ITEM</span>
                        </div>
                     </div>
                     <h3 className="text-2xl font-black text-igo-dark uppercase tracking-tighter mb-4">{product.name}</h3>
                     <p className="text-xs text-gray-500 font-medium mb-6 line-clamp-2">{product.description}</p>
                     
                     <div className="mt-auto space-y-4">
                        <button 
                           onClick={() => handleEditClick(product)}
                           className="w-full py-3 bg-gray-50 text-igo-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors flex justify-center items-center gap-2 border border-gray-100 shadow-sm"
                        >
                           <Edit2 className="w-3 h-3" /> EDIT FULL DETAILS
                        </button>

                        <div className="pt-4 border-t border-gray-100">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Status</span>
                              <span className="text-[10px] font-black text-igo-dark uppercase tracking-widest flex items-center gap-1">
                                 <Package className="w-3 h-3 text-gray-400" /> {product.stock || 0} Units Available
                              </span>
                           </div>
                           <div className="flex gap-2">
                              <div className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${!isOutOfStock ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-300 border-transparent'}`}>
                                 <CheckCircle2 className="w-3 h-3" /> IN STOCK
                              </div>
                              <div className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isOutOfStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-300 border-transparent'}`}>
                                 <AlertCircle className="w-3 h-3" /> OUT OF STOCK
                              </div>
                           </div>
                        </div>

                        <button 
                           onClick={() => toggleArchive(product.id)}
                           className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${product.isArchived ? 'bg-igo-lime text-igo-dark hover:bg-white border border-igo-lime hover:border-transparent' : 'bg-[#1a2332] text-white hover:bg-red-600 shadow-lg'}`}
                        >
                           {product.isArchived ? 'RESTORE TO WEBSITE' : <><X className="w-3 h-3" /> REMOVE FROM WEBSITE</>}
                        </button>
                     </div>
                  </div>
               </div>
            )
         })}
      </div>
      
      {filteredProducts.length === 0 && (
         <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Package className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-igo-dark uppercase tracking-tighter mb-2">No Products Found</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Try adjusting your search filters</p>
         </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-black uppercase text-igo-dark mb-6">Edit Product Details</h3>
            
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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Upload Image</label>
                  <label className="w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center gap-2 cursor-pointer hover:border-igo-lime transition-all">
                    <ImagePlus className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                      {editForm.image?.startsWith('data:image') ? 'Image selected' : 'Choose file'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setEditForm({ ...editForm, image: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }} 
                    />
                  </label>
                </div>
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
                  className="flex-1 bg-igo-lime text-igo-dark py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
