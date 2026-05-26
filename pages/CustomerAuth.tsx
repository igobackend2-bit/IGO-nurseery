import React, { useState, useRef } from 'react';
import { User, Mail, Lock, CheckCircle2, ChevronRight, ArrowLeft, Twitter, Facebook, Instagram, Youtube, RefreshCw, AlertTriangle } from 'lucide-react';
import { customerApi } from '../services/customerApi';

interface CustomerAuthProps {
  onLogin: (session: any) => void;
  onSignup: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

// Map raw Supabase/API errors → friendly user messages
const friendlyError = (msg: string, mode: AuthMode): string => {
  const m = msg.toLowerCase();
  if (m.includes('email rate limit') || m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts. A verification code was already sent — please check your inbox (and spam folder), or wait a few minutes before trying again.';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Please sign in instead.';
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Incorrect email or password. Please try again.';
  if (m.includes('email not confirmed'))
    return 'Your email is not yet verified. Please check your inbox for the OTP code.';
  if (m.includes('password') && m.includes('least'))
    return 'Password must be at least 6 characters long.';
  if (m.includes('unable to validate') || m.includes('network') || m.includes('failed to fetch'))
    return 'Connection issue. Please check your internet and try again.';
  if (m.includes('otp') || m.includes('token') || m.includes('invalid') && m.includes('code'))
    return 'The OTP code is incorrect or has expired. Please request a new one.';
  return msg;
};

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
  const [rateLimited, setRateLimited] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
    setRateLimited(false);

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
        try {
          await customerApi.signup({
            name: formData.name.trim(),
            email,
            password,
            phone: formData.phone.trim()
          });
          setMode('verify');
          setSuccess('Account created! A 6-digit verification code has been sent to your email.');
          setTimeout(() => setSuccess(null), 4000);
          startResendCooldown(60);
        } catch (signupErr: any) {
          const raw: string = signupErr.message || '';
          const isRateLimit = raw.toLowerCase().includes('rate limit') || raw.toLowerCase().includes('too many');
          const isAlreadyExists = raw.toLowerCase().includes('already registered') || raw.toLowerCase().includes('already been registered');

          if (isRateLimit) {
            // Email was likely sent already — move them to verify screen
            setRateLimited(true);
            setMode('verify');
            setError('A verification code was already sent to your email. Please enter it below. If you didn\'t receive it, wait 60 seconds then try again.');
            startResendCooldown(60);
          } else if (isAlreadyExists) {
            setError('This email is already registered. Please sign in or reset your password.');
          } else {
            setError(friendlyError(raw, 'signup'));
          }
        }
      } else if (mode === 'verify') {
        const session = await customerApi.verifyOtp({ email, otp: formData.otp.trim() });
        if (session && session.token) {
          setSuccess('✅ Email verified! Taking you to your dashboard...');
          setRateLimited(false);
          setTimeout(() => onLogin(session), 1200);
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
      setError(friendlyError(err.message || 'Authentication failed', mode));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), name: formData.name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not resend code.');
      setSuccess('A new verification code has been sent to your email.');
      setTimeout(() => setSuccess(null), 4000);
      startResendCooldown(60);
    } catch (err: any) {
      setError(friendlyError(err.message || 'Could not resend code.', 'verify'));
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
                    {rateLimited && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-200 leading-relaxed">
                          A code was already sent to <strong>{formData.email}</strong>. Check your inbox and spam folder. You can resend after the cooldown.
                        </p>
                      </div>
                    )}
                    <label className="text-sm font-semibold text-white block">
                      Enter the 6-digit code sent to <span className="text-orange-400">{formData.email || 'your email'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="w-full px-4 py-4 bg-white text-black rounded-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-center text-3xl tracking-[0.5em]"
                      placeholder="000000"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    />
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className={`flex items-center gap-2 text-xs font-semibold transition-colors ${resendCooldown > 0 ? 'text-white/30 cursor-not-allowed' : 'text-orange-400 hover:text-orange-300 cursor-pointer'}`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                    </button>
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
                <div className="flex items-start gap-3 p-4 bg-red-500/20 text-red-200 rounded-sm border border-red-500/30">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
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
                  <div className="space-y-2">
                    <p className="text-xs text-white/80">
                      Already have an account? <button type="button" onClick={() => setMode('login')} className="text-orange-500 font-bold hover:underline">Sign In</button>
                    </p>
                    <p className="text-xs text-white/60">
                      Already received a code? <button type="button" onClick={() => setMode('verify')} className="text-orange-400 font-bold hover:underline">Enter it here</button>
                    </p>
                  </div>
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
