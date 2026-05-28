import React, { useState } from 'react';
import { Package, AlertCircle, CheckCircle2, ShoppingCart, Tag, Filter, Trash2, X, Edit2, ImagePlus, Save, Minus, Plus, FileSpreadsheet, FileText } from 'lucide-react';
import { StoreProduct } from '../types';
import { productApi } from '../services/productApi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminInventoryProps {
  products: StoreProduct[];
  onUpdateProducts: (products: StoreProduct[]) => void;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onUpdateProducts }) => {
  const [filter, setFilter] = useState<'all' | 'out' | 'archived'>('all');
  const [inlineStock, setInlineStock] = useState<Record<string, number>>({});

  const handleInlineStockChange = (productId: string, val: number) => {
    setInlineStock(prev => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleInlineStockSave = async (productId: string) => {
    const newStock = inlineStock[productId];
    if (newStock === undefined) return;
    const newOutOfStock = newStock <= 0;
    
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, stock: newStock, outOfStock: newOutOfStock } : p
    );
    onUpdateProducts(updatedProducts);
    await productApi.updateProduct(productId, { stock: newStock, outOfStock: newOutOfStock });
    
    // Clear from inline state once saved
    setInlineStock(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const toggleForceOutOfStock = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStatus = !product.outOfStock;

    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, outOfStock: newStatus } : p
    );
    onUpdateProducts(updatedProducts);
    await productApi.updateProduct(productId, { outOfStock: newStatus });
  };

  const refillAllStock = async () => {
    if (window.confirm('This will refill all unarchived products to 100 stock. Continue?')) {
      const updatedProducts = products.map(p => {
        if (!p.isArchived) {
          return { ...p, stock: 100, outOfStock: false };
        }
        return p;
      });
      onUpdateProducts(updatedProducts);
      
      for (const p of updatedProducts) {
        if (!p.isArchived) {
          await productApi.updateProduct(p.id, { stock: 100, outOfStock: false });
        }
      }
    }
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

  const handleExportExcel = () => {
    const dataToExport = filteredProducts.map(p => ({
      'Product ID': p.id,
      'Name': p.name,
      'Category': p.category,
      'Current Stock': p.stock || 0,
      'Status': p.isArchived ? 'Archived' : (p.outOfStock || (p.stock !== undefined && p.stock <= 0) ? 'Out of Stock' : (p.stock !== undefined && p.stock < 20 ? 'Low Stock' : 'In Stock')),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `IGO_Nursery_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('IGO Nursery - Inventory Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Items: ${filteredProducts.length}`, 14, 35);

    const tableColumn = ["Name", "Category", "Current Stock", "Status"];
    const tableRows = filteredProducts.map(p => [
      p.name,
      p.category,
      (p.stock || 0).toString(),
      p.isArchived ? 'Archived' : (p.outOfStock || (p.stock !== undefined && p.stock <= 0) ? 'Out of Stock' : (p.stock !== undefined && p.stock < 20 ? 'Low Stock' : 'In Stock'))
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [132, 204, 22], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`IGO_Nursery_Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Inventory Control</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Package className="w-3 h-3 text-igo-lime" /> Real-time Stock Availability & Catalog Management
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
           <button
             onClick={handleExportExcel}
             className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-green-500 text-green-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-green-50 transition-all"
           >
             <FileSpreadsheet className="w-4 h-4" /> Export Excel
           </button>
           <button
             onClick={handleExportPDF}
             className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-red-500 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-red-50 transition-all"
           >
             <FileText className="w-4 h-4" /> Export PDF
           </button>
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
           <button 
             onClick={refillAllStock}
             className="px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-green-700 transition-all border border-green-700 flex items-center gap-2"
             title="Refill all active products to 100 stock"
           >
             <Package className="w-3 h-3" /> Refill All (100)
           </button>
           <button 
             onClick={() => window.location.href = '/add-product'}
             className="px-6 py-2 bg-igo-lime text-igo-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all flex items-center gap-2"
           >
             <Plus className="w-3 h-3" /> Add Product
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
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest">Product</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest">Category</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest text-center">Current Stock Level</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest text-center">Status</th>
                <th className="p-8 text-[10px] font-black text-igo-muted uppercase tracking-widest text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockVal = inlineStock[product.id] !== undefined ? inlineStock[product.id] : (product.stock || 0);
                const isDirty = inlineStock[product.id] !== undefined && inlineStock[product.id] !== (product.stock || 0);
                return (
                <tr key={product.id} className="border-b border-gray-50 last:border-none group hover:bg-gray-50/50 transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-gray-100 shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-igo-dark tracking-tight leading-none">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{product.category}</p>
                  </td>
                  <td className="p-8">
                     <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleInlineStockChange(product.id, stockVal - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-igo-dark transition-colors shadow-sm"
                        >
                           <Minus className="w-3 h-3" />
                        </button>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-igo-lime">
                           <input 
                             type="number"
                             value={stockVal}
                             onChange={(e) => handleInlineStockChange(product.id, parseInt(e.target.value) || 0)}
                             className="w-16 px-2 py-2 text-center text-sm font-black text-igo-dark bg-transparent border-none focus:outline-none focus:ring-0"
                           />
                           <span className="pr-3 text-[10px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">Qty</span>
                        </div>
                        <button 
                          onClick={() => handleInlineStockChange(product.id, stockVal + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-igo-dark transition-colors shadow-sm mr-4"
                        >
                           <Plus className="w-3 h-3" />
                        </button>
                        
                        {isDirty ? (
                          <button 
                            onClick={() => handleInlineStockSave(product.id)}
                            className="w-10 h-10 flex items-center justify-center bg-igo-lime text-igo-dark rounded-xl shadow-lg hover:bg-black hover:text-white transition-all animate-in zoom-in duration-300"
                            title="Save new stock level"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-gray-300">
                             <Save className="w-4 h-4 opacity-50" />
                          </div>
                        )}
                     </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col items-center gap-2">
                      {product.isArchived ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl border border-gray-200">
                          <X className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Archived</span>
                        </div>
                      ) : product.outOfStock || (product.stock !== undefined && product.stock <= 0) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                        </div>
                      ) : (product.stock !== undefined && product.stock < 20) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Low Stock ({product.stock})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">In Stock ({product.stock || 0})</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!product.isArchived ? (
                        <>
                          <button
                            onClick={() => toggleForceOutOfStock(product.id)}
                            className={`p-3 rounded-xl transition-all shadow-sm border ${product.outOfStock ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600'}`}
                            title={product.outOfStock ? "Remove Force Out of Stock" : "Force Out of Stock Manually"}
                          >
                            <AlertCircle className="w-4 h-4" />
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
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
