import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  Microscope,
  CreditCard,
  User,
  ArrowUpRight,
  MoreVertical,
  MapPin,
  AlertCircle,
  X,
  IndianRupee,
  Activity,
  FileText,
  Send,
  XCircle,
  ShieldAlert,
  Inbox,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, Page } from '../types';
import { customerApi } from '../services/customerApi';
import { sendLeadUpdateEmail } from '../services/orderEmailService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminLeadsProps {
  onNavigate?: (page: Page, param?: string) => void;
  leadId?: string | null;
  initialFilter?: 'all' | 'consultation' | 'inspection' | 'lab-audit' | 'payment-notification' | 'deletion-request' | 'general-inquiry';
  isVisitorMode?: boolean;
}

const AdminLeads: React.FC<AdminLeadsProps> = ({ onNavigate, leadId, initialFilter, isVisitorMode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'consultation' | 'inspection' | 'lab-audit' | 'payment-notification' | 'deletion-request' | 'general-inquiry'>(isVisitorMode ? 'general-inquiry' : (initialFilter || 'all'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, Lead['status']>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadLeads = async () => {
    const leadsData = await customerApi.getLeads();
    setLeads(leadsData);
    
    if (selectedLead) {
      const updated = leadsData.find((l: Lead) => l.id === selectedLead.id);
      if (updated) setSelectedLead(updated);
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    if (onNavigate) {
      // Clear the leadId from the URL to prevent the useEffect from re-triggering the selected lead
      onNavigate(Page.AdminLeads);
    }
  };

  // Failsafe: Support Escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedLead?.chatHistory]);

  // Handle deep-linking from notifications
  useEffect(() => {
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setSelectedLead(lead);
      }
    }
  }, [leadId, leads.length]);

  const filteredLeads = leads.filter(lead => {
    if (isVisitorMode) {
      if (lead.type !== 'general-inquiry') return false;
    } else {
      if (lead.type === 'general-inquiry') return false;
    }

    const matchesFilter = filter === 'all' || lead.type === filter;
    const matchesSearch = 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.projectType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': 
      case 'approved':
      case 'accepting': return 'bg-green-100 text-green-700 border-green-200';
      case 'contacted':
      case 'alternate-days': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'new': return 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLeadIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Building className="w-5 h-5 text-blue-500" />;
      case 'inspection': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'lab-audit': return <Microscope className="w-5 h-5 text-orange-500" />;
      case 'payment-notification': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'deletion-request': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default: return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleUpdateStatus = async (id: string, status: Lead['status'], decisionNote?: string) => {
    const lead = leads.find(l => l.id === id);
    await customerApi.updateLead(id, { status, adminDecision: decisionNote });
    
    // 1. Send Email Notification
    if (lead) {
      try {
        await sendLeadUpdateEmail(lead, status, decisionNote);
        console.log(`✅ Email sent to ${lead.customerEmail} for status ${status}`);
      } catch (e) {
        console.error('Failed to send lead update email', e);
      }
    }

    // 2. Add System Message in Box
    const message = decisionNote || `Your request status has been updated to ${status.toUpperCase()}.`;
    await customerApi.addMessageToLead(id, 'admin', `SYSTEM UPDATE: ${message}\n\nOur team is reviewing your requirements.`);
    
    loadLeads();
  };

  const handleSendMessage = async () => {
    if (!selectedLead || !adminMessage.trim()) return;
    const messageToSend = adminMessage;
    await customerApi.addMessageToLead(selectedLead.id, 'admin', messageToSend);
    setAdminMessage('');
    loadLeads();

    // Send email notification to customer
    try {
      await sendLeadUpdateEmail(selectedLead, selectedLead.status, `Message from IGO Admin: ${messageToSend}`);
      console.log(`✅ Message email sent to ${selectedLead.customerEmail}`);
    } catch (e) {
      console.error('Failed to send message email', e);
    }
  };

  const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this lead?')) {
      await customerApi.deleteLead(id);
      loadLeads();
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    consultations: leads.filter(l => l.type === 'consultation').length,
    deletions: leads.filter(l => l.type === 'deletion-request').length,
  };

  const handleExportExcel = () => {
    const dataToExport = filteredLeads.map(l => ({
      'Lead ID': l.id,
      'Type': l.type,
      'Customer Name': l.customerName,
      'Email': l.customerEmail,
      'Phone': l.customerPhone || 'N/A',
      'Status': l.status,
      'Issue/Reason': l.issue || l.reason || 'N/A',
      'Date': new Date(l.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, `IGO_Nursery_Leads_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('IGO Nursery - Leads Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Leads: ${filteredLeads.length}`, 14, 35);

    const tableColumn = ["Type", "Name", "Email", "Phone", "Status", "Date"];
    const tableRows = filteredLeads.map(l => [
      l.type.toUpperCase(),
      l.customerName,
      l.customerEmail,
      l.customerPhone || 'N/A',
      l.status.toUpperCase(),
      new Date(l.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [132, 204, 22], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`IGO_Nursery_Leads_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-10 space-y-10 font-sans animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">{isVisitorMode ? 'Popup & Visitor Leads' : 'Inquiry Pool'}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Inbox className="w-3 h-3 text-igo-lime" /> Relationship Management & Customer Success
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

        {/* Main Content Area */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden mb-20">
          {/* Toolbar */}
          <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {!isVisitorMode ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {['all', 'consultation', 'inspection', 'lab-audit', 'payment-notification', 'deletion-request'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilter(t as any)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === t ? 'bg-igo-dark text-white shadow-xl' : 'bg-gray-50 text-igo-muted hover:bg-gray-100'}`}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap bg-igo-dark text-white shadow-xl">
                  GENERAL INQUIRY (POPUP ONLY)
                </span>
              </div>
            )}
            
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-igo-muted" />
              <input 
                type="text" 
                placeholder="Search name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-igo-lime transition-all w-full shadow-inner"
              />
            </div>
          </div>

          {/* Leads List */}
          <div className="overflow-x-auto">
            {isVisitorMode ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time & Pages Viewed</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Interest</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeads.map(lead => {
                    let reasonData = { products: [], pages: [], timeSpent: '0 mins' };
                    try {
                      reasonData = JSON.parse(lead.reason || '{}');
                    } catch(e) {}
                    return (
                    <tr key={lead.id} className="group hover:bg-[#fcfdfd] transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                       <td className="px-8 py-6">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm font-black text-igo-dark tracking-tight">{lead.customerName}</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-igo-muted italic">
                                <Mail className="w-3 h-3 text-igo-lime" /> {lead.customerEmail}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-igo-muted italic">
                                <Phone className="w-3 h-3 text-igo-lime" /> {lead.customerPhone}
                            </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                           <div className="mb-2">
                               <p className="text-[9px] text-igo-muted font-bold tracking-widest uppercase mb-0.5">Time Spent Before Popup</p>
                               <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100 bg-indigo-50 text-indigo-700">{reasonData.timeSpent || 'Unknown'}</span>
                           </div>
                           <div>
                               <p className="text-[9px] text-igo-muted font-bold tracking-widest uppercase mb-0.5">Pages Visited</p>
                               <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {(reasonData.pages || []).map((p: string, i: number) => (
                                      <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{p}</span>
                                  ))}
                                  {(!reasonData.pages || reasonData.pages.length === 0) && (
                                      <span className="text-[9px] text-gray-400 italic">No tracking data</span>
                                  )}
                               </div>
                           </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="max-w-xs">
                               <div className="flex flex-wrap gap-1">
                                  {(reasonData.products || []).map((p: string, i: number) => (
                                      <span key={i} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{p}</span>
                                  ))}
                                  {(!reasonData.products || reasonData.products.length === 0) && (
                                      <span className="text-[10px] text-gray-400 italic">No specific product viewed</span>
                                  )}
                               </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                                 onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                                 className="p-3 bg-igo-dark text-white rounded-xl hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl flex items-center justify-center gap-2"
                                 title="View Full Details"
                             >
                                 <MessageSquare className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Hub Portal</span>
                             </button>
                             <button 
                                 onClick={(e) => handleDeleteLead(lead.id, e)}
                                 className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                                 title="Delete Lead"
                             >
                                 <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                             </button>
                          </div>
                       </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type & ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason / Goal</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Schedule Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="group hover:bg-[#fcfdfd] transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-2xl bg-gray-50 shadow-sm`}>
                            {getLeadIcon(lead.type)}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-igo-dark uppercase tracking-widest leading-none mb-1">{lead.type.replace('-', ' ')}</span>
                            <span className="text-[9px] font-bold text-gray-300 font-mono tracking-tighter italic">#{lead.id.substring(lead.id.length - 8).toUpperCase()}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-black text-igo-dark tracking-tight">{lead.customerName}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-igo-muted italic">
                            <Mail className="w-3 h-3 text-igo-lime" /> {lead.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-l border-gray-50">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${lead.selectedPlan ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                          {lead.selectedPlan || 'Trial Audit'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="max-w-xs">
                          {(() => {
                              const reasonStr = lead.issue || lead.reason || 'General inquiry';
                              if (reasonStr.includes('(Interested in:')) {
                                  const parts = reasonStr.split('(Interested in:');
                                  const products = parts[1].replace(')', '').trim();
                                  return (
                                     <div className="mb-2">
                                        <p className="text-[9px] text-igo-muted font-bold tracking-widest uppercase mb-0.5">Product Interest</p>
                                        <p className="text-xs text-indigo-600 font-black tracking-tight line-clamp-2">{products}</p>
                                     </div>
                                  );
                              }
                              return <p className="text-xs text-igo-dark font-black tracking-tight mb-2 line-clamp-2">{reasonStr}</p>;
                          })()}
                          <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                               {lead.status}
                             </span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center">
                         <span className="text-[10px] font-black text-igo-dark uppercase tracking-widest mb-1 italic">{lead.auditDate || 'TBD'}</span>
                         <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded leading-none">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Pending'}
                         </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center gap-2">
                             <select
                                title="Change lead status"
                                onClick={(e) => e.stopPropagation()}
                                value={pendingStatuses[lead.id] || lead.status}
                                onChange={(e) => setPendingStatuses(prev => ({ ...prev, [lead.id]: e.target.value as Lead['status'] }))}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border transition-all ${
                                   pendingStatuses[lead.id] && pendingStatuses[lead.id] !== lead.status
                                      ? 'border-igo-lime ring-1 ring-igo-lime bg-igo-lime/5'
                                      : 'border-gray-100 bg-gray-50'
                                }`}
                             >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="pending">Pending</option>
                                <option value="accepting">Accepting</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="resolved">Resolved</option>
                             </select>

                             {pendingStatuses[lead.id] && pendingStatuses[lead.id] !== lead.status && (
                                <button 
                                   onClick={() => {
                                      handleUpdateStatus(lead.id, pendingStatuses[lead.id]);
                                      setPendingStatuses(prev => {
                                         const next = { ...prev };
                                         delete next[lead.id];
                                         return next;
                                      });
                                   }}
                                   className="px-3 py-2 bg-igo-dark text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
                                >
                                   <CheckCircle2 className="w-3 h-3" /> Save
                                </button>
                             )}
                          </div>

                          <button 
                             onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                             className="p-3 bg-igo-dark text-white rounded-xl hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl flex items-center justify-center gap-2 ml-2"
                          >
                             <MessageSquare className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Hub Portal</span>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {filteredLeads.length === 0 && (
            <div className="py-24 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Inbox className="w-10 h-10 text-gray-200" />
               </div>
               <h3 className="text-xl font-black text-igo-dark uppercase tracking-tighter mb-2">Workspace Empty</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No inquiries matching current parameters</p>
            </div>
          )}
        </div>

      {/* Enhanced Conversation Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-igo-dark/80 backdrop-blur-md animate-in fade-in duration-300" onClick={handleCloseModal}></div>
            


            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            {getLeadIcon(selectedLead.type)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-igo-muted uppercase tracking-[0.3em]">{selectedLead.type.replace('-', ' ')}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(selectedLead.status)}`}>{selectedLead.status}</span>
                            </div>
                            <h3 className="text-3xl font-black text-igo-dark uppercase tracking-tighter">{selectedLead.customerName}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={handleCloseModal}
                        className="p-3 bg-white border-2 border-gray-100 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer shadow-sm group"
                        title="Close (Esc)"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex-grow flex overflow-hidden">
                    {/* Left Panel: Details */}
                    <div className="w-1/3 border-r border-gray-100 p-8 overflow-y-auto bg-gray-50/30">
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 underline decoration-igo-lime decoration-2 underline-offset-4">Requester Details</label>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm font-bold text-igo-dark">
                                        <Mail className="w-4 h-4 text-igo-lime" /> {selectedLead.customerEmail}
                                    </div>
                                    {selectedLead.customerPhone && (
                                        <div className="flex items-center gap-3 text-sm font-bold text-igo-dark">
                                            <Phone className="w-4 h-4 text-igo-lime" /> {selectedLead.customerPhone}
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 text-sm font-bold text-igo-muted">
                                        <MapPin className="w-4 h-4 text-igo-lime mt-1" />
                                        <span>{selectedLead.address || 'Address not provided'}<br/>{selectedLead.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                {(() => {
                                   const reasonStr = selectedLead.issue || selectedLead.reason || 'No specific details provided';
                                   if (reasonStr.startsWith('{')) {
                                      try {
                                          const data = JSON.parse(reasonStr);
                                          return (
                                              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                                                 <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-indigo-500" /> Visitor Engagement Metrics
                                                 </label>
                                                 <div className="space-y-5">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-igo-muted uppercase tracking-widest block mb-1">Time Spent</span>
                                                        <span className="text-sm font-black text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm border border-indigo-50">{data.timeSpent || 'Unknown'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-igo-muted uppercase tracking-widest block mb-2">Pages Visited</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(data.pages || []).map((p: string, i: number) => (
                                                                <span key={i} className="text-[10px] font-black tracking-widest uppercase text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-xl">{p}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-igo-muted uppercase tracking-widest block mb-2">Product Interest</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(data.products || []).map((p: string, i: number) => (
                                                                <span key={i} className="text-xs font-black tracking-tight text-white bg-indigo-500 px-3 py-1.5 rounded-xl shadow-sm">{p}</span>
                                                            ))}
                                                            {(!data.products || data.products.length === 0) && (
                                                                <span className="text-[10px] text-indigo-400 italic font-bold">No specific products viewed</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                 </div>
                                              </div>
                                          );
                                      } catch (e) {}
                                   }

                                   if (reasonStr.includes('(Interested in:')) {
                                      const parts = reasonStr.split('(Interested in:');
                                      return (
                                         <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                                             <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-indigo-500" /> Detected Browsing Interest
                                             </label>
                                             <p className="text-xl font-black text-igo-dark leading-snug">
                                                 <span className="text-indigo-600">{parts[1].replace(')', '').trim()}</span>
                                             </p>
                                             <p className="text-[10px] text-igo-muted font-bold mt-4 uppercase tracking-widest border-t border-indigo-100/50 pt-3">
                                                 Source: {parts[0].trim()}
                                             </p>
                                         </div>
                                      );
                                   }
                                   return (
                                      <>
                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 underline decoration-igo-lime decoration-2 underline-offset-4">Initial Requirement</label>
                                         <p className="text-sm font-bold text-igo-dark italic leading-relaxed">
                                             "{reasonStr}"
                                         </p>
                                      </>
                                   );
                                })()}
                            </div>

                            {/* Action Buttons for Decisions */}
                            {['new', 'contacted'].includes(selectedLead.status) && (
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 underline decoration-igo-lime decoration-2 underline-offset-4">Proactive Decisions</label>
                                    <div className="grid gap-4">
                                        <div className="flex flex-col gap-2">
                                            <select 
                                                value={pendingStatuses[selectedLead.id] || selectedLead.status}
                                                onChange={(e) => setPendingStatuses(prev => ({ ...prev, [selectedLead.id]: e.target.value as Lead['status'] }))}
                                                className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest px-4"
                                            >
                                                <option value="new">New Inquiry</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="pending">Pending</option>
                                                <option value="accepting">Accepting</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="resolved">Resolved</option>
                                            </select>

                                            {(pendingStatuses[selectedLead.id] && pendingStatuses[selectedLead.id] !== selectedLead.status) && (
                                                <button 
                                                    onClick={() => {
                                                        handleUpdateStatus(selectedLead.id, pendingStatuses[selectedLead.id]);
                                                        setPendingStatuses(prev => {
                                                            const next = { ...prev };
                                                            delete next[selectedLead.id];
                                                            return next;
                                                        });
                                                    }}
                                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-top-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Confirm & Save Status
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Chat Thread */}
                    <div className="flex-grow flex flex-col bg-white">
                        <div className="flex-grow p-8 overflow-y-auto space-y-6">
                            {(selectedLead.chatHistory || []).map((chat, idx) => (
                                <div key={idx} className={`flex ${chat.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-5 rounded-3xl ${
                                        chat.sender === 'admin' 
                                            ? 'bg-igo-dark text-white rounded-tr-none' 
                                            : 'bg-gray-100 text-igo-dark rounded-tl-none'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                                {chat.sender === 'admin' ? 'IGO Admin' : 'Customer'}
                                            </span>
                                            <span className="text-[8px] opacity-40">{new Date(chat.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-8 border-t border-gray-100 bg-gray-50/20">
                            <div className="flex gap-4">
                                <textarea 
                                    rows={1}
                                    placeholder="Type your message to the customer..."
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                    className="flex-grow bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-igo-lime transition-all resize-none shadow-sm"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    className="p-4 bg-igo-dark text-white rounded-2xl hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="mt-3 text-[9px] text-igo-muted font-bold uppercase tracking-widest text-center">
                                Tip: Start your message with system guidelines for professional agricultural communication.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
