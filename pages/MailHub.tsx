import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  Star, 
  Archive, 
  Clock, 
  ChevronRight, 
  Inbox, 
  Send, 
  AlertCircle,
  X
} from 'lucide-react';
import { customerApi } from '../services/customerApi';

interface SimulatedEmail {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  isRead: boolean;
  timestamp: string;
  leadId?: string;
}

const MailHub: React.FC = () => {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEmails = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('igo_simulated_emails') || '[]');
      setEmails(Array.isArray(stored) ? stored : []);
    } catch (e) {
      console.error('Failed to parse simulated emails:', e);
      setEmails([]);
    }
  };

  useEffect(() => {
    loadEmails();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'igo_simulated_emails') loadEmails();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filteredEmails = emails.filter(e => 
    e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markRead = (id: number) => {
    const updated = emails.map(e => e.id === id ? { ...e, isRead: true } : e);
    localStorage.setItem('igo_simulated_emails', JSON.stringify(updated));
    setEmails(updated);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-indigo-900 tracking-tight leading-none">MailHub <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded ml-2 uppercase tracking-widest font-black">Simulation Mode</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Simulated Email Verification Layer</p>
          </div>
        </div>

        <div className="flex-grow max-w-2xl px-12">
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
             <input 
               type="text" 
               placeholder="Search simulated mailbox..." 
               className="w-full bg-[#F1F3F4] px-12 py-3 rounded-2xl text-sm font-medium border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="text-right mr-2">
              <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Gokul R</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Dev</p>
           </div>
           <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-indigo-900">G</div>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-gray-100 p-4 space-y-2 hidden md:block">
           <button className="w-full bg-indigo-600 text-white p-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all mb-8">
              <Send className="w-4 h-4" /> Compose
           </button>

           {[
             { label: 'Inbox', icon: Inbox, badge: emails.filter(e => !e.isRead).length, active: true },
             { label: 'Starred', icon: Star, badge: 0 },
             { label: 'Snoozed', icon: Clock, badge: 0 },
             { label: 'Sent', icon: Send, badge: 0 },
             { label: 'Spam', icon: AlertCircle, badge: 0 },
             { label: 'Trash', icon: Trash2, badge: 0 },
           ].map((item, i) => (
             <button key={i} className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${item.active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                   <item.icon className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {item.badge > 0 && <span className="text-[10px] font-black">{item.badge}</span>}
             </button>
           ))}
        </aside>

        {/* List Panel */}
        <main className="flex-grow overflow-y-auto">
           {filteredEmails.length > 0 ? (
             <div className="divide-y divide-gray-50 bg-white">
                {filteredEmails.map(email => (
                  <div 
                    key={email.id}
                    onClick={() => { setSelectedEmail(email); markRead(email.id); }}
                    className={`flex items-center gap-6 p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 ${email.isRead ? 'border-transparent' : 'border-indigo-600 bg-indigo-50/10'}`}
                  >
                     <div className="flex items-center gap-4 shrink-0">
                        <Star className="w-4 h-4 text-gray-300 hover:text-yellow-400" />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${email.isRead ? 'bg-gray-300' : 'bg-indigo-600'}`}>
                           {email.from.charAt(0)}
                        </div>
                     </div>
                     
                     <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <p className={`text-sm tracking-tight truncate ${email.isRead ? 'text-gray-500' : 'font-black text-indigo-950'}`}>
                              {email.from}
                           </p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                        <h4 className={`text-xs tracking-tight truncate ${email.isRead ? 'text-gray-400' : 'font-bold text-gray-700'}`}>
                           {email.subject}
                        </h4>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{email.body}</p>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Mail className="w-20 h-20 opacity-10 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest opacity-20 italic italic italic">Virtual Mailbox Empty</p>
             </div>
           )}
        </main>

        {/* Detail Panel */}
        {selectedEmail && (
          <aside className="w-1/2 bg-white border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="h-16 border-b border-gray-50 flex items-center px-6 justify-between bg-gray-50/20">
                <div className="flex gap-4">
                  <Archive className="w-4 h-4 text-gray-500 cursor-not-allowed opacity-30" />
                  <AlertCircle className="w-4 h-4 text-gray-500 cursor-not-allowed opacity-30" />
                  <Trash2 className="w-4 h-4 text-gray-500 cursor-not-allowed opacity-30" />
                </div>
                <button onClick={() => setSelectedEmail(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
             </div>

             <div className="p-10 overflow-y-auto flex-grow space-y-10">
                <div>
                   <h2 className="text-2xl font-black text-indigo-950 tracking-tight mb-6">{selectedEmail.subject}</h2>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-xl">
                         {selectedEmail.from.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-black text-indigo-900">{selectedEmail.from}</p>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <span>to {selectedEmail.to}</span>
                            <ChevronRight className="w-3 h-3" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-gray-100 min-h-[300px]">
                   <p className="text-sm font-medium leading-relaxed text-indigo-900/80 whitespace-pre-wrap">
                      {selectedEmail.body}
                   </p>
                </div>

                <div className="pt-10 flex gap-4">
                    <button 
                      onClick={() => {
                        const reply = prompt("Enter your reply to IGO Admin:");
                        if (reply && selectedEmail.leadId) {
                          // @ts-ignore
                          customerApi.addMessageToLead(selectedEmail.leadId, 'customer', reply)
                            .then(() => {
                              alert("Message sent to Admin Inquiry Pool.");
                              // @ts-ignore
                              customerApi._dispatchEmail('admin@igonursery.local', `Reply to: ${selectedEmail.subject}`, reply, selectedEmail.leadId);
                            });
                        } else if (!selectedEmail.leadId) {
                          alert("This is an automated system notification and does not support direct replies. Please use our website hub.");
                        }
                      }}
                      className="px-8 py-3 bg-indigo-600 border-2 border-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-lg"
                    >
                      Reply to Admin
                    </button>
                    <button className="px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-indigo-600 hover:text-indigo-600 transition-all">Forward</button>
                </div>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MailHub;
