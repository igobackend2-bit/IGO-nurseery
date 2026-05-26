import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, Filter, CheckCircle, Package, Clock, Mail, Eye, Trash2, AlertCircle, X, FileSpreadsheet, FileText } from 'lucide-react';
import { Order, Page } from '../types';
import { sendOrderConfirmationEmail } from '../services/orderEmailService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminOrdersProps {
  orders: Order[];
  onBack: () => void;
  onOpenOrder: (orderNumber: string) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onDeleteCustomer: (customerId: number) => void;
  onNavigate?: (page: any) => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onBack,
  onOpenOrder,
  onUpdateStatus,
  onDeleteCustomer,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount-high' | 'above-avg'>('date');
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, any>>({});
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'cx'>('orders');
  const avgOrderValue = useMemo(() => orders.length > 0 ? orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length : 0, [orders]);

  const filteredOrders = useMemo(() => {
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    let result = orders.filter((order) => {
      const matchesSearch =
        (order.orderNumber || '').toLowerCase().includes(cleanSearchTerm) ||
        (order.customerName || '').toLowerCase().includes(cleanSearchTerm) ||
        (order.customerEmail || '').toLowerCase().includes(cleanSearchTerm) ||
        (order.customerPhone || '').toLowerCase().includes(cleanSearchTerm);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesAboveAvg = sortBy !== 'above-avg' || order.total >= avgOrderValue;

      return matchesSearch && matchesStatus && matchesAboveAvg;
    });

    if (sortBy === 'amount-high') {
      result = [...result].sort((a, b) => (b.total || 0) - (a.total || 0));
    } else {
      result = [...result].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
    }

    return result;
  }, [orders, searchTerm, statusFilter, sortBy, avgOrderValue]);




  const stats = useMemo(() => {
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0,
      statuses: {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
    };
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'picked': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'packed': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'shipped': return 'bg-green-100 text-green-800 border border-green-200';
      case 'delivered': return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'processing':
        return 'bg-orange-100 text-orange-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleResendEmail = async (order: Order) => {
    setResendingEmail(order.id);
    try {
      const emailResult = await sendOrderConfirmationEmail({
        to: order.customerEmail,
        subject: `Order Confirmation Resent #${order.orderNumber}`,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        customerName: order.customerName,
        estimatedDelivery: order.estimatedDelivery,
        total: order.total,
        items: order.items.map(item => ({ name: item.product.name, quantity: item.quantity, price: item.product.price })),
      });
      console.log(`Email resend handled for ${order.customerEmail}: ${emailResult.message}`);
      
      setResendSuccess(order.id);
      setTimeout(() => setResendSuccess(null), 3000);
      console.log(`✅ Email resent to ${order.customerEmail}`);
    } catch (error) {
      console.error('❌ Error resending email:', error);
    } finally {
      setResendingEmail(null);
    }
  };

  return (
    <div className="p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Operations Stream</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Package className="w-3 h-3 text-igo-lime" /> Real-time Logistics & Order Fulfilment
            </p>
         </div>
         <div className="flex items-center gap-3">
           <button
             onClick={() => {
               const dataToExport = filteredOrders.map(o => ({
                 'Order ID': o.orderNumber,
                 'Date': new Date(o.createdAt).toLocaleDateString(),
                 'Month': new Date(o.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }),
                 'Customer Name': o.customerName,
                 'Email': o.customerEmail,
                 'Phone': o.customerPhone,
                 'Total (INR)': o.total,
                 'Status': o.status,
                 'Payment Method': o.paymentMethod,
                 'Items Count': o.items.reduce((sum, i) => sum + i.quantity, 0),
               }));
               const worksheet = XLSX.utils.json_to_sheet(dataToExport);
               const workbook = XLSX.utils.book_new();
               XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
               XLSX.writeFile(workbook, `IGO_Nursery_Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
             }}
             className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-green-500 text-green-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-green-50 transition-all"
           >
             <FileSpreadsheet className="w-4 h-4" /> Export Excel
           </button>
           <button
             onClick={() => {
               const doc = new jsPDF();
               doc.setFont('helvetica', 'bold');
               doc.setFontSize(20);
               doc.text('IGO Nursery - Orders Report', 14, 22);
               
               doc.setFontSize(10);
               doc.setFont('helvetica', 'normal');
               doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
               doc.text(`Total Orders: ${filteredOrders.length}`, 14, 35);

               const tableColumn = ["Order ID", "Date", "Customer", "Amount", "Status"];
               const tableRows = filteredOrders.map(o => [
                 o.orderNumber,
                 new Date(o.createdAt).toLocaleDateString(),
                 o.customerName,
                 `Rs. ${o.total.toLocaleString('en-IN')}`,
                 o.status.toUpperCase()
               ]);

               autoTable(doc, {
                 head: [tableColumn],
                 body: tableRows,
                 startY: 40,
                 theme: 'grid',
                 styles: { fontSize: 8, cellPadding: 3 },
                 headStyles: { fillColor: [132, 204, 22], textColor: [255, 255, 255], fontStyle: 'bold' }
               });

               doc.save(`IGO_Nursery_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
             }}
             className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-red-500 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-red-50 transition-all"
           >
             <FileText className="w-4 h-4" /> Export PDF
           </button>
         </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Stats — click any card to filter the table below */}
          <div className="grid md:grid-cols-5 gap-4 mb-12">
            {/* Total Orders — reset all, show everything */}
            <div
              onClick={() => { setStatusFilter('all'); setSortBy('date'); setSearchTerm(''); setTimeout(() => document.getElementById('orders-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                statusFilter === 'all' && sortBy === 'date' ? 'border-igo-lime shadow-igo-lime/20 scale-[1.02]' : 'border-gray-100 hover:border-igo-lime/50'
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-igo-muted mb-2 group-hover:text-igo-dark transition-colors">Total Orders</p>
              <p className="text-3xl font-black text-igo-dark">{stats.totalOrders}</p>
              {statusFilter === 'all' && sortBy === 'date' && <p className="text-[8px] font-black text-igo-lime uppercase tracking-widest mt-2">● All Orders</p>}
            </div>

            {/* Total Revenue — sort by highest amount */}
            <div
              onClick={() => { setStatusFilter('all'); setSortBy('amount-high'); setSearchTerm(''); setTimeout(() => document.getElementById('orders-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                sortBy === 'amount-high' ? 'border-green-400 shadow-green-100 scale-[1.02]' : 'border-gray-100 hover:border-green-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${sortBy === 'amount-high' ? 'text-green-700' : 'text-igo-muted'}`}>Total Revenue</p>
              <p className="text-2xl font-black text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              {sortBy === 'amount-high'
                ? <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mt-2">● Sorted: Highest First</p>
                : <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2">Click to sort by revenue ↓</p>}
            </div>

            {/* Avg Order Value — show only above-average orders */}
            <div
              onClick={() => { setStatusFilter('all'); setSortBy('above-avg'); setSearchTerm(''); setTimeout(() => document.getElementById('orders-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                sortBy === 'above-avg' ? 'border-purple-400 shadow-purple-100 scale-[1.02]' : 'border-gray-100 hover:border-purple-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${sortBy === 'above-avg' ? 'text-purple-700' : 'text-igo-muted'}`}>Avg Order Value</p>
              <p className={`text-2xl font-black ${sortBy === 'above-avg' ? 'text-purple-700' : 'text-igo-dark'}`}>{formatCurrency(stats.avgOrderValue)}</p>
              {sortBy === 'above-avg'
                ? <p className="text-[8px] font-black text-purple-500 uppercase tracking-widest mt-2">● Above Avg Only</p>
                : <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2">Click to filter above avg</p>}
            </div>

            {/* Shipped */}
            <div
              onClick={() => { setStatusFilter('shipped'); setSearchTerm(''); setTimeout(() => document.getElementById('orders-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                statusFilter === 'shipped' ? 'border-blue-400 shadow-blue-100 scale-[1.02]' : 'border-gray-100 hover:border-blue-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${statusFilter === 'shipped' ? 'text-blue-700' : 'text-blue-500'}`}>Shipped</p>
              <p className="text-3xl font-black text-blue-600">{stats.statuses.shipped}</p>
              {statusFilter === 'shipped' && <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-2">● Filtered</p>}
            </div>

            {/* Delivered */}
            <div
              onClick={() => { setStatusFilter('delivered'); setSearchTerm(''); setTimeout(() => document.getElementById('orders-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                statusFilter === 'delivered' ? 'border-green-400 shadow-green-100 scale-[1.02]' : 'border-gray-100 hover:border-green-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${statusFilter === 'delivered' ? 'text-green-700' : 'text-green-500'}`}>Delivered</p>
              <p className="text-3xl font-black text-green-600">{stats.statuses.delivered}</p>
              {statusFilter === 'delivered' && <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-2">● Filtered</p>}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-igo-muted" />
                <input
                  type="text"
                  placeholder="Search by order #, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-igo-lime transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-igo-muted" />
                <select
                  title="Filter orders by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-igo-lime transition-colors text-sm font-black"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="picked">Picked</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter / Sort Banner */}
          {(statusFilter !== 'all' || sortBy !== 'date') && (
            <div id="orders-table" className="flex items-center justify-between bg-igo-lime/10 border border-igo-lime/30 rounded-2xl px-6 py-3 mb-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-igo-lime animate-pulse" />
                <p className="text-sm font-black text-igo-dark uppercase tracking-widest">
                  {sortBy === 'amount-high' && 'Sorted by: Highest Revenue — '}
                  {sortBy === 'above-avg' && `Showing: Above Avg (≥${formatCurrency(avgOrderValue)}) — `}
                  {statusFilter !== 'all' && <React.Fragment><span className="text-igo-lime">{statusFilter.toUpperCase()}</span>{' '}</React.Fragment>}
                  <span className="text-gray-500 font-bold normal-case">({filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''})</span>
                </p>
              </div>
              <button
                onClick={() => { setStatusFilter('all'); setSortBy('date'); }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-igo-muted hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            </div>
          )}

          {/* Orders Table */}
          <div id={statusFilter === 'all' ? 'orders-table' : ''} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-igo-dark mb-2">No Orders Found</h3>
                {statusFilter !== 'all' ? (
                  <div className="space-y-3">
                    <p className="text-igo-muted">There are no <span className="font-black text-igo-dark">{statusFilter}</span> orders yet.</p>
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-igo-lime text-igo-dark rounded-xl font-black text-xs uppercase tracking-widest hover:bg-igo-dark hover:text-white transition-all"
                    >
                      <X className="w-3 h-3" /> Show All Orders
                    </button>
                  </div>
                ) : (
                  <p className="text-igo-muted">Try adjusting your search or filters</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-igo-muted">Order #</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-igo-muted">Customer</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-igo-muted">Email</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-igo-muted">Items</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-igo-muted">Amount</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-igo-muted">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-igo-muted">Date</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-igo-muted">Status</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-igo-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-black text-igo-dark font-mono text-sm">{order.orderNumber}</div>
                          <div className="text-[10px] text-igo-muted font-black uppercase tracking-widest mt-1">{order.trackingNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-igo-dark text-sm">{order.customerName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-igo-muted">{order.customerEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-igo-dark">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-black text-green-600">{formatCurrency(order.total)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-igo-muted">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              title="Change order status"
                              value={pendingStatuses[order.id] || order.status}
                              onChange={(event) =>
                                setPendingStatuses(prev => ({
                                  ...prev,
                                  [order.id]: event.target.value as Order['status']
                                }))
                              }
                              className={`rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider outline-none transition-all ${
                                pendingStatuses[order.id] && pendingStatuses[order.id] !== order.status
                                  ? 'border-igo-lime ring-1 ring-igo-lime bg-igo-lime/5 text-igo-dark'
                                  : 'border-gray-200 bg-white text-igo-dark'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="picked">Picked</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {pendingStatuses[order.id] && pendingStatuses[order.id] !== order.status && (
                              <button
                                onClick={() => {
                                  onUpdateStatus(order.id, pendingStatuses[order.id]);
                                  setPendingStatuses(prev => {
                                    const next = { ...prev };
                                    delete next[order.id];
                                    return next;
                                  });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-igo-dark text-white rounded-xl hover:bg-green-600 transition-all shadow-xl font-black text-[10px] uppercase tracking-widest animate-in zoom-in duration-300"
                                title="Confirm and Save Status Change"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Save Changes
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-igo-dark transition-colors hover:border-igo-dark"
                              title="View order details"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleResendEmail(order)}
                              disabled={resendingEmail === order.id}
                              className={`px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 justify-center ${
                                resendSuccess === order.id
                                  ? 'bg-green-100 text-green-700'
                                  : resendingEmail === order.id
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-igo-lime text-igo-dark hover:bg-opacity-90'
                              }`}
                              title="Resend order confirmation email"
                            >
                              {resendSuccess === order.id ? (
                                <>
                                  <CheckCircle className="w-4 h-4" /> Sent
                                </>
                              ) : resendingEmail === order.id ? (
                                <>
                                  <Clock className="w-4 h-4 animate-spin" /> Sending
                                </>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4" /> Resend
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="mt-6 text-center text-sm text-igo-muted font-medium">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </section>

      {/* Order View Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-igo-dark/60 backdrop-blur-sm" onClick={() => setViewingOrder(null)}></div>
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-igo-dark">Order #{viewingOrder.orderNumber}</h3>
                <p className="text-xs font-black text-igo-muted uppercase tracking-widest">{new Date(viewingOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-igo-lime mb-3">Customer Information</h4>
                  <p className="font-bold text-igo-dark text-lg">{viewingOrder.customerName}</p>
                  <p className="text-sm text-igo-muted">{viewingOrder.customerEmail}</p>
                  <p className="text-sm text-igo-muted">{viewingOrder.customerPhone}</p>
                </div>
                
                {/* Shipping Details */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-igo-lime mb-3">Shipping Address</h4>
                  <p className="text-sm text-igo-dark font-medium leading-relaxed">
                    {viewingOrder.shippingAddress}<br/>
                    {viewingOrder.city}, {viewingOrder.state} {viewingOrder.zipCode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-igo-lime mb-3">Order Items</h4>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-[10px] text-igo-muted">Product</th>
                        <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-[10px] text-igo-muted">Qty</th>
                        <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[10px] text-igo-muted">Price</th>
                        <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[10px] text-igo-muted">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {viewingOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-bold text-igo-dark">{item.product.name}</td>
                          <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-igo-muted">{formatCurrency(item.product.price)}</td>
                          <td className="px-4 py-3 text-right font-black text-igo-dark">{formatCurrency(item.product.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 ml-auto md:w-1/2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-igo-muted font-bold"><span>Subtotal</span><span>{formatCurrency(viewingOrder.subtotal)}</span></div>
                  <div className="flex justify-between text-igo-muted font-bold"><span>Tax</span><span>{formatCurrency(viewingOrder.tax)}</span></div>
                  <div className="flex justify-between text-igo-muted font-bold"><span>Delivery</span><span>{formatCurrency(viewingOrder.deliveryCharge)}</span></div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center mt-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-igo-dark">Grand Total</span>
                    <span className="text-xl font-black text-green-600">{formatCurrency(viewingOrder.total)}</span>
                  </div>
                </div>
              </div>

            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button onClick={() => setViewingOrder(null)} className="w-full py-4 bg-igo-dark text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
