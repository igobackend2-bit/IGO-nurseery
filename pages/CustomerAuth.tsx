import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle2, ChevronRight, ArrowLeft, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { customerApi } from '../services/customerApi';

interface CustomerAuthProps {
  onLogin: (session: any) => void;
  onSignup: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

const CustomerAuth: React.FC<CustomerAuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    phone: '',
    token: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Detect Reset Token
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setMode('reset');
      setFormData(prev => ({ ...prev, token }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();

      if (mode === 'login') {
        const loginRes = await customerApi.login({ email, password });
        if (loginRes.needsVerification) {
          setMode('verify');
          setSuccess('Security verification required. Please check your email for the code.');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          onLogin(loginRes);
        }
      } else if (mode === 'signup') {
        const signupRes = await customerApi.signup({ 
          name: formData.name.trim(), 
          email, 
          password, 
          phone: formData.phone.trim() 
        });
        if (signupRes.needsVerification) {
          setMode('verify');
          setSuccess('Signup initiated! Verification code sent to your email.');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const session = await customerApi.login({ email, password });
          onLogin(session);
        }
      } else if (mode === 'verify') {
        const session = await customerApi.verifyOtp({ email, otp: formData.otp.trim() });
        if (session && session.token) {
          setSuccess('Access verified! Entering your dashboard...');
          setTimeout(() => onLogin(session), 1000);
        } else {
          setSuccess('Account verified successfully!');
          setTimeout(() => {
            setMode('login');
            setSuccess(null);
            setFormData(prev => ({ ...prev, otp: '' }));
          }, 1500);
        }
      } else if (mode === 'forgot') {
        await customerApi.forgotPassword(email);
        setSuccess('If an account exists, a reset link has been sent to your email.');
      } else if (mode === 'reset') {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await customerApi.resetPassword({ token: formData.token, newPassword: formData.newPassword.trim() });
        setSuccess('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setMode('login');
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/IGOAgriTechfarms/' },
    { name: 'Twitter', icon: Twitter, url: 'https://x.com/igoagritechfarm' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/igoagritechfarms/' },
    { name: 'Youtube', icon: Youtube, url: 'https://www.youtube.com/@IGOAgriTechfarms' },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row bg-cover bg-center font-sans tracking-tight"
      style={{ backgroundImage: "url('/images/branding/login-bg-v3.png')" }}
    >
      {/* Left Overlay for maximum readability */}
      <div className="absolute inset-0 bg-black/50 md:bg-gradient-to-r md:from-black/90 md:via-black/40 md:to-transparent z-0" />

      {/* Left Branding Section */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center p-12 lg:p-24 lg:pt-32">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black text-white leading-tight animate-in fade-in slide-in-from-left-8 duration-700 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            Future<br />
            of<br />
            Farming<br />
            Starts Here
          </h1>
          <p className="max-w-md text-white/90 text-sm md:text-base leading-relaxed font-medium animate-in fade-in slide-in-from-left-6 duration-700 delay-150">
            Experience innovation through smart monitoring, intelligent alerts, and advanced agricultural systems.
          </p>
          
          <div className="flex gap-6 pt-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
            {socialLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
              >
                <link.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center p-12 lg:p-24 bg-black/20 backdrop-blur-sm border-l border-white/10">
        <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <h2 className="text-4xl font-bold text-white mb-10">
            {mode === 'login' && 'Sign in'}
            {mode === 'signup' && 'Create Profile'}
            {mode === 'verify' && 'Security Code'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'New Password'}
          </h2>

          {success ? (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-12 h-12 text-orange-500" />
              <p className="text-white font-bold text-center text-sm">{success}</p>
              {mode === 'forgot' && (
                <button 
                  onClick={() => { setMode('login'); setSuccess(null); }}
                  className="text-xs font-bold text-orange-500 underline uppercase tracking-widest mt-2"
                >
                  Back to Login
                </button>
              )}
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white block">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                )}

                {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white block">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}

                {(mode === 'login' || mode === 'signup') && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white block">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                )}

                {mode === 'verify' && (
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-white block">OTP Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="w-full px-4 py-4 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-center text-3xl tracking-[0.5em]"
                      placeholder="000000"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                )}

                {mode === 'reset' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white block">New Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white block">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white block">Phone</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                      placeholder="Enter phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="rememberMe" 
                      className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-white/80 cursor-pointer">Remember Me</label>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 text-red-200 rounded-sm text-xs font-bold text-center border border-red-500/30">
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-[#e44d26] hover:bg-[#c94421] text-white text-sm font-bold rounded-sm transition-all shadow-lg active:scale-95 uppercase tracking-wider"
                >
                  {isLoading ? 'Processing...' : (
                    mode === 'login' ? 'Sign in now' : 
                    mode === 'signup' ? 'Join Now' : 
                    mode === 'verify' ? 'Verify Code' :
                    mode === 'forgot' ? 'Send Link' : 'Reset'
                  )}
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => { setMode(mode === 'login' ? 'forgot' : 'login'); setError(null); }}
                    className="text-xs text-white/60 hover:text-white transition-colors underline"
                  >
                    {mode === 'login' ? 'Lost your password?' : 'Back to Login'}
                  </button>
                </div>
              </div>

              <div className="text-center pt-6">
                {mode === 'login' && (
                  <p className="text-xs text-white/80">
                    Not a member yet? <button type="button" onClick={() => setMode('signup')} className="text-orange-500 font-bold hover:underline">Join Now!</button>
                  </p>
                )}
                {mode === 'signup' && (
                  <p className="text-xs text-white/80">
                    Already have an account? <button type="button" onClick={() => setMode('login')} className="text-orange-500 font-bold hover:underline">Sign In</button>
                  </p>
                )}
              </div>

              <div className="pt-8 text-center border-t border-white/10">
                <p className="text-[10px] text-white/40 leading-relaxed">
                  By clicking on "Sign in now" you agree to<br />
                  <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> | <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
