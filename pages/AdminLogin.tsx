import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  defaultEmail: string;
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ defaultEmail, onLogin }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const isLoggedIn = await onLogin(email, password);
    setIsSubmitting(false);

    if (!isLoggedIn) {
      setError('Invalid admin credentials.');
      return;
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/branding/admin-login-bg.png')" }}
    >
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white/10 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-700">
        {/* Left Side: Brand Info */}
        <div className="p-12 md:p-16 flex flex-col justify-between bg-gradient-to-br from-igo-dark/90 to-igo-dark/40 text-white border-r border-white/10">
          <div>
            <div className="mb-8">
               <img src="/images/branding/igo-agritechfarms-logo.png" alt="Logo" className="h-16 brightness-0 invert" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
              ADMIN <br/> <span className="text-igo-lime">ECOSYSTEM.</span>
            </h1>
            <p className="text-gray-300 text-lg font-medium leading-relaxed max-w-sm">
              Secure enterprise access for IGO Nursery regional managers and agronomists.
            </p>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-igo-lime group-hover:text-igo-dark transition-all">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">256-bit AES Encrypted</p>
             </div>
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-igo-lime group-hover:text-igo-dark transition-all">
                   <Lock className="w-5 h-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Zero Trust Protocol</p>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 md:p-16 bg-white/95 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-igo-dark uppercase tracking-tighter mb-2">Management Login</h2>
            <p className="text-[10px] font-black text-gray-400 border-l-2 border-igo-lime pl-3 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted ml-1">Admin Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-igo-lime outline-none transition-all"
                     placeholder="admin@igo.local"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted ml-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-igo-lime outline-none transition-all"
                     placeholder="••••••••"
                   />
                </div>
             </div>

             {error && (
               <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4" /> {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={isSubmitting}
               className="w-full bg-igo-dark text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl active:scale-[0.98] mt-4"
             >
               {isSubmitting ? 'Verifying Credentials...' : 'Open Secure Dashboard'}
             </button>
          </form>

          <p className="mt-12 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
            By logging in, you agree to IGO Agritech Farms internal data security policies and privacy compliance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
