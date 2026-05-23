import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Terminal, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search,
  ExternalLink,
  Bell
} from 'lucide-react';

interface LogEntry {
  id: string | number;
  type: 'email' | 'inbox' | 'lead-update' | 'system';
  title: string;
  message: string;
  timestamp: string;
  recipient: string;
  status?: string;
}

const AdminNotifications: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'email' | 'inbox' | 'lead-update'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = () => {
    try {
      const getSafeItem = (key: string) => {
        try {
          return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
          return [];
        }
      };

      const emails = getSafeItem('igo_simulated_emails');
      const leadNotes = getSafeItem('igo_notifications');
      const leads = getSafeItem('igo_leads');
      
      const combined: LogEntry[] = [
        ...emails.map((e: any) => ({
          id: `email-${e.id}`,
          type: 'email' as const,
          title: `EMAIL SENT: ${e.subject}`,
          message: e.body,
          timestamp: e.timestamp,
          recipient: e.to,
          status: 'delivered'
        })),
        ...leadNotes.map((n: any) => ({
          id: `note-${n.id}`,
          type: 'inbox' as const,
          title: `INBOX PUSH: ${n.title}`,
          message: n.message,
          timestamp: n.createdAt,
          recipient: n.customerEmail,
          status: 'visible'
        })),
        ...leads.filter((l: any) => l.status === 'new').map((l: any) => ({
          id: `lead-${l.id}`,
          type: 'lead-update' as const,
          title: `REPLY RECEIVED: ${l.customerName}`,
          message: l.chatHistory?.[l.chatHistory.length - 1]?.message || 'New inquiry',
          timestamp: l.chatHistory?.[l.chatHistory.length - 1]?.timestamp || l.createdAt,
          recipient: 'Admin',
          status: 'priority'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(combined);
    } catch (error) {
      console.error('Failed to load operational logs:', error);
      setLogs([]);
    }
  };

  useEffect(() => {
    loadLogs();
    const handleStorage = () => loadLogs();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesFilter = filter === 'all' || l.type === filter;
    const matchesSearch = 
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Operational Hub</h1>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3 text-igo-lime" /> System Activity Log — Real-time Communication Stream
             </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Filter logs..." 
                  className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-igo-lime transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                {(['all', 'email', 'inbox', 'lead-update'] as const).map(f => (
                   <button 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-igo-dark text-white' : 'text-gray-400 hover:text-igo-dark'}`}
                   >
                     {f.replace('-', ' ')}
                   </button>
                ))}
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {filteredLogs.length > 0 ? (
           filteredLogs.map((log) => (
             <div key={log.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                   log.type === 'email' ? 'bg-blue-50 text-blue-600' : 
                   log.type === 'inbox' ? 'bg-green-50 text-green-600' :
                   log.type === 'lead-update' ? 'bg-orange-50 text-orange-600' :
                   'bg-gray-50 text-gray-600'
                }`}>
                   {log.type === 'email' && <Mail className="w-6 h-6" />}
                   {log.type === 'inbox' && <Bell className="w-6 h-6" />}
                   {log.type === 'lead-update' && <MessageSquare className="w-6 h-6" />}
                </div>

                <div className="flex-grow min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                      <p className="text-[10px] font-black text-igo-muted uppercase tracking-[0.2em]">{log.type.replace('-', ' ')}</p>
                      <div className="h-1 w-1 rounded-full bg-gray-200" />
                      <p className="text-[10px] font-bold text-igo-lime uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                   </div>
                   <h4 className="text-sm font-black text-igo-dark uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                      {log.title}
                   </h4>
                   <p className="text-[10px] font-bold text-gray-400 line-clamp-1 mt-1 italic tracking-widest">{log.message}</p>
                </div>

                <div className="text-right shrink-0">
                   <p className="text-[10px] font-black text-igo-dark uppercase tracking-widest mb-1 italic italic">{log.recipient}</p>
                   <span className="px-2 py-1 bg-gray-50 text-[8px] font-black rounded text-gray-500 uppercase tracking-[0.2em]">{log.status}</span>
                </div>

                <button className="p-3 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                   <ExternalLink className="w-4 h-4 text-igo-dark" />
                </button>
             </div>
           ))
         ) : (
           <div className="py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <Activity className="w-12 h-12 text-gray-100 mb-4" />
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic italic">No matching operational logs</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default AdminNotifications;
