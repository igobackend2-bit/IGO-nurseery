import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Clock,
  ArrowUpRight,
  MousePointer2,
  Calendar,
  AlertCircle,
  Cpu,
  Activity
} from 'lucide-react';

const AdminOverview: React.FC = () => {
  const stats = [
    { label: 'Monthly Revenue', value: '₹4,82,900', trend: '+12.5%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Inquiries', value: '842', trend: '+8.2%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: '156', trend: '-2.4%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Live Inventory', value: '1,248', trend: '+5.1%', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-igo-dark uppercase tracking-tighter leading-none mb-4">Command Center</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Calendar className="w-3 h-3 text-igo-lime" /> Platform Metrics Summary — Real-time Stream
            </p>
         </div>
         <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <button className="px-6 py-2 bg-igo-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Last 30 Days</button>
            <button className="px-6 py-2 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-igo-dark">Current Qtr</button>
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                     <stat.icon className="w-7 h-7" />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                     {stat.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                     {stat.trend}
                  </div>
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
               <h3 className="text-3xl font-black text-igo-dark tracking-tighter italic">{stat.value}</h3>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Performance Overview (Placeholder Chart) */}
         <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-xl font-black text-igo-dark uppercase tracking-tighter">Growth Velocity</h3>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Inquiry vs Order Volume Analytics</p>
               </div>
               <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-igo-dark" />
               </button>
            </div>
            
            {/* Mock Chart Visual */}
            <div className="flex-grow flex items-end justify-between gap-4 py-4">
               {[40, 70, 45, 90, 65, 80, 100, 50, 75, 60, 85, 95].map((h, i) => (
                  <div key={i} className="flex-grow group relative">
                     <div 
                       className="w-full bg-gray-50 group-hover:bg-igo-lime rounded-full transition-all duration-500" 
                       style={{ height: `${h}%` }}
                     ></div>
                     <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-[8px] font-black uppercase tracking-widest text-igo-dark">Month {i+1}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Alerts & Critical Items */}
         <div className="bg-igo-dark rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Cpu className="w-48 h-48" /></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-8">
                  <Activity className="w-5 h-5 text-igo-lime" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Platform Evolution</h3>
               </div>
               
               <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                   {[
                     { date: 'APR 22', title: 'Inventory Control v2.0', desc: 'Restored navigation, added "Delete/Restore" logic, and out-of-stock toggles.', status: 'DEPLOYED' },
                     { date: 'APR 22', title: 'Security Stabilization', desc: 'Hardened Admin gate-keeping and fixed blank screen routing errors.', status: 'ACTIVE' },
                     { date: 'APR 21', title: 'AI Garden Assistant', desc: 'Launched prototype for high-precision botanical design workflows.', status: 'BETA' },
                     { date: 'APR 20', title: 'Portfolio Feed', desc: 'Integrated real-time site images from Muttukadu and ECR projects.', status: 'STABLE' }
                   ].map((update, i) => (
                     <div key={i} className="group cursor-default">
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-[8px] font-black text-igo-lime uppercase tracking-widest">{update.date}</span>
                           <span className="text-[7px] font-black bg-white/10 px-2 py-0.5 rounded uppercase tracking-tighter">{update.status}</span>
                        </div>
                        <p className="text-xs font-black mb-1 group-hover:text-igo-lime transition-colors">{update.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium leading-tight">{update.desc}</p>
                        <div className="h-px bg-white/5 mt-4 group-last:hidden"></div>
                     </div>
                   ))}
                </div>
            </div>

            <div className="pt-10 relative z-10">
               <button className="w-full py-5 bg-igo-lime text-igo-dark rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl flex items-center justify-center gap-4">
                  Run Platform Diagnostic <MousePointer2 className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminOverview;
