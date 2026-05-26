import React, { useState, useMemo } from 'react';
import { Users, Search, AlertCircle, Filter, Trash2, Mail, Phone, MapPin, Download, FileText, FileSpreadsheet, X as CloseIcon, Calendar, Package } from 'lucide-react';
import { Order } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

interface AdminCustomersProps {
  orders: Order[];
  onDeleteCustomer: (customerId: number) => void;
  onNavigateToOrders: (email: string) => void;
}

const AdminCustomers: React.FC<AdminCustomersProps> = ({ orders, onDeleteCustomer, onNavigateToOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const globalCustomers = useMemo(() => {
    const customerMap = new Map<
      string,
      {
        id: number | null;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        orderCount: number;
        totalSpent: number;
        latestOrderNumber: string;
        latestOrderDate: string;
        deletionRequested: boolean;
      }
    >();

    orders.forEach((order) => {
      const email = order.customerEmail || '';
      if (!email) return;
      const key = email.toLowerCase();
      const existing = customerMap.get(key);

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt).getTime() > new Date(existing.latestOrderDate).getTime()) {
          existing.latestOrderNumber = order.orderNumber;
          existing.latestOrderDate = order.createdAt;
        }
        if (order.deletionRequested) existing.deletionRequested = true;
        return;
      }

      customerMap.set(key, {
        id: order.customerId ?? null,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.shippingAddress,
        city: order.city,
        state: order.state,
        zipCode: order.zipCode,
        orderCount: 1,
        totalSpent: order.total,
        latestOrderNumber: order.orderNumber,
        latestOrderDate: order.createdAt,
        deletionRequested: !!order.deletionRequested,
      });
    });

    return customerMap;
  }, [orders]);

  const uniqueCustomers = useMemo(() => {
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    return Array.from(globalCustomers.values())
      .filter(customer => {
        if (customer.id === null) return false;
        if (!cleanSearchTerm) return true;
        
        return (
          (customer.name || '').toLowerCase().includes(cleanSearchTerm) ||
          (customer.email || '').toLowerCase().includes(cleanSearchTerm) ||
          (customer.phone || '').toLowerCase().includes(cleanSearchTerm)
        );
      })
      .sort((a, b) => b.orderCount - a.orderCount);
  }, [globalCustomers, searchTerm]);

  const handleExportExcel = () => {
    const dataToExport = uniqueCustomers.map(c => ({
      'Customer ID': c.id || 'Guest',
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone || 'N/A',
      'Total Orders': c.orderCount,
      'Lifetime Value (INR)': c.totalSpent,
      'Latest Order Date': new Date(c.latestOrderDate).toLocaleDateString(),
      'Address': c.address,
      'City': c.city,
      'State': c.state,
      'ZIP Code': c.zipCode
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, `IGO_Nursery_Customers_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('IGO Nursery - Customer Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Customers: ${uniqueCustomers.length}`, 14, 35);

    const tableColumn = ["Name", "Email", "Phone", "Orders", "Lifetime Value", "City"];
    const tableRows = uniqueCustomers.map(c => [
      c.name,
      c.email,
      c.phone || 'N/A',
      c.orderCount.toString(),
      `Rs. ${c.totalSpent.toLocaleString('en-IN')}`,
      c.city
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [132, 204, 22], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`IGO_Nursery_Customers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Customer Directory</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Users className="w-3 h-3 text-igo-lime" /> Platform Users & Lifetime Value
            </p>
         </div>
         <div className="flex items-center gap-3">
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
         </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">

          {/* Search */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
            <div className="flex-1 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-igo-muted" />
              <input
                type="text"
                placeholder="Search by customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-igo-lime transition-colors"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-igo-lime mb-2">
                  Customer Profiles & History
                </p>
                <h2 className="text-2xl font-black text-igo-dark">
                  {uniqueCustomers.length} Unique Customers
                </h2>
              </div>
            </div>

            {uniqueCustomers.length === 0 ? (
              <p className="text-sm text-igo-muted p-4">No customer details found for this search.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {uniqueCustomers.map((customer) => (
                  <div
                    key={customer.email}
                    className={`rounded-3xl border p-6 transition-colors ${
                      customer.deletionRequested 
                        ? 'border-red-300 bg-red-50/50 hover:border-red-600' 
                        : 'border-gray-100 bg-white shadow-sm hover:border-igo-lime hover:shadow-lg'
                    }`}
                  >
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setSelectedCustomer(customer)}>
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl shadow-sm border border-indigo-100 uppercase group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                             {customer.name.substring(0, 2)}
                          </div>
                          <div>
                             <p className="text-lg font-black text-igo-dark leading-tight group-hover:text-indigo-600 transition-colors">{customer.name}</p>
                             {customer.deletionRequested && (
                               <div className="flex items-center gap-1 mt-1 text-red-600">
                                 <AlertCircle className="w-3 h-3" />
                                 <span className="text-[8px] font-black uppercase tracking-tighter">Deletion Requested</span>
                               </div>
                             )}
                          </div>
                       </div>
                     </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs font-bold text-igo-muted">
                         <Mail className="w-4 h-4 text-gray-400" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-igo-muted">
                         <Phone className="w-4 h-4 text-gray-400" /> {customer.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-igo-muted">
                         <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> 
                         <span className="truncate" title={`${customer.address}, ${customer.city}`}>{customer.address}, {customer.city}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-igo-dark pb-3 border-b border-gray-200/50">
                        <span className="text-igo-muted">Lifetime Orders</span>
                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-200">{customer.orderCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-igo-dark pt-1">
                        <span className="text-igo-muted">Lifetime Value</span>
                        <span className="text-green-600 font-black text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-100">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onNavigateToOrders(customer.email)}
                      className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-igo-dark px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-igo-lime hover:text-igo-dark"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      View All Orders
                    </button>
                    
                    {customer.id && (
                      <button
                        onClick={() => {
                          if (window.confirm(`PERMANENTLY DELETE ACCOUNT: ${customer.email}?\n\nThis will remove their profile, notifications, and sessions. This CANNOT be undone.`)) {
                            onDeleteCustomer(customer.id as number);
                          }
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 transition-all border border-red-100 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Customer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md uppercase">
                  {selectedCustomer.name.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-igo-dark leading-tight">{selectedCustomer.name}</h2>
                  <p className="text-xs font-bold text-igo-muted mt-1 uppercase tracking-widest">Customer ID: {selectedCustomer.id || 'GUEST'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Lifetime Value</p>
                  <p className="text-2xl font-black text-green-700">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Orders</p>
                  <p className="text-2xl font-black text-indigo-700">{selectedCustomer.orderCount}</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Avg Order Value</p>
                  <p className="text-2xl font-black text-purple-700">
                    {formatCurrency(selectedCustomer.orderCount > 0 ? selectedCustomer.totalSpent / selectedCustomer.orderCount : 0)}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Contact Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Mail className="w-4 h-4 text-gray-500" /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-igo-dark">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Phone className="w-4 h-4 text-gray-500" /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-igo-dark">{selectedCustomer.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-gray-500" /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Billing & Shipping Address</p>
                      <p className="text-sm font-bold text-igo-dark">{selectedCustomer.address}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History Preview */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Order History Highlights</h3>
                  <button 
                    onClick={() => onNavigateToOrders(selectedCustomer.email)}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1"
                  >
                    View All Orders <Package className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {orders
                    .filter(o => o.customerEmail === selectedCustomer.email)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map(order => (
                      <div key={order.orderNumber} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-igo-lime transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-black text-igo-dark">
                            {order.orderNumber}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                          <span className="font-black text-igo-dark">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  {selectedCustomer.orderCount > 3 && (
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">
                      + {selectedCustomer.orderCount - 3} more orders
                    </p>
                  )}
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2.5 bg-igo-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-igo-lime hover:text-igo-dark transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
