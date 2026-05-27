import React, { useState } from 'react';
import { Microscope, Database, Thermometer, Droplets, Zap, ChevronRight, Activity, Cpu, CheckCircle, Loader2 } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

const Lab: React.FC = () => {
  useSEO(SEO_CONFIGS.lab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    issue: '',
    auditDate: '',
    plan: 'Soil Analysis (Standard)'
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const planCosts: Record<string, number> = {
        'Soil Analysis (Standard)': 2000,
        'Ecosystem Audit (Premium)': 5000,
        'Full Digital-Twin Setup (Elite)': 12000
      };

      await customerApi.submitLead({
        type: 'lab-audit',
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        location: formData.location,
        issue: formData.issue,
        auditDate: formData.auditDate,
        planName: formData.plan,
        selectedPlan: formData.plan,
        cost: planCosts[formData.plan] || 0,
        message: `Lab audit requested for ${formData.plan}`
      });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        location: '',
        issue: '',
        auditDate: '',
        plan: 'Soil Analysis (Standard)'
      });
    } catch (error) {
      console.error('Lab audit request failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Lab Header */}
      <section className="bg-igo-dark text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" alt="Tech" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-10">
            <div className="flex-grow space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-igo-lime rounded text-igo-dark font-black text-[10px] uppercase">Agri-OS Internal v4.0</div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">Precision <br/> <span className="text-igo-lime">Monitoring.</span></h1>
            </div>
            <div className="max-w-md pb-4">
              <p className="text-lg text-gray-400 font-medium">The IGO Lab is the nerve center of our operations. Here, we translate complex biological data into thriving gardens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Dashboard */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 mb-32">
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-8 md:p-16 border border-gray-100">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { icon: <Thermometer className="w-8 h-8"/>, label: 'Polyhouse Temp', value: '28.4°C', trend: '+0.2°', status: 'Optimal' },
              { icon: <Droplets className="w-8 h-8"/>, label: 'RH% Level', value: '72%', trend: 'Stable', status: 'Balanced' },
              { icon: <Zap className="w-8 h-8"/>, label: 'PAR Photosynthesis', value: '450', trend: '-12', status: 'Peak' },
              { icon: <Activity className="w-8 h-8"/>, label: 'Stomatal Index', value: 'High', trend: 'N/A', status: 'Active' }
            ].map((card, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-igo-lime">{card.icon}</div>
                  <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded">{card.status}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black tracking-tighter text-igo-dark">{card.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-igo-muted tracking-widest">{card.label}</span>
                    <span className={`text-[10px] font-bold ${card.trend.includes('+') ? 'text-green-500' : 'text-gray-400'}`}>{card.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Focus Areas */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-32 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-igo-lime/10 rounded-full blur-3xl"></div>
            <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] relative z-10 shadow-2xl" alt="Lab Work" />
            <div className="absolute -bottom-10 -right-10 bg-igo-dark p-10 rounded-[2.5rem] shadow-2xl z-20 text-white space-y-4 max-w-xs">
              <Cpu className="text-igo-lime w-12 h-12" />
              <h4 className="text-xl font-black uppercase tracking-tighter leading-tight">IoT Sensor Network Integration</h4>
              <p className="text-xs text-gray-400 font-medium">We deploy hardware across every garden we build for remote health monitoring.</p>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-4xl md:text-5xl font-black text-igo-dark tracking-tighter uppercase leading-none">Why Science <br/>Matters to your <br/><span className="text-igo-lime">Greenery.</span></h2>
            
            <div className="space-y-10">
              {[
                { title: 'Soil Microbiome R&D', desc: 'We engineer custom substrates using beneficial fungi and bacteria to reduce chemical fertilizer dependency.' },
                { title: 'Climate Acclimatization', desc: 'Every exotic plant species undergoes a 12-week stress test to adapt to Indian coastal humidity levels.' },
                { title: 'Pathogen Early-Warning', desc: 'Automated imaging systems detect pest signatures invisible to the human eye, enabling preventive care.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group cursor-default">
                  <div className="text-4xl font-black text-igo-lime/20 group-hover:text-igo-lime transition-colors">0{i+1}</div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tighter text-igo-dark">{item.title}</h4>
                    <p className="text-igo-muted font-medium text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Lab CTA */}
      <section className="py-32 bg-gray-50 mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <Microscope className="w-16 h-16 text-igo-dark mx-auto" />
          <h2 className="text-4xl font-black uppercase tracking-tighter">Request a Soil & Lab Audit</h2>
          <p className="text-igo-muted text-lg font-medium">Planning a major landscape project? Our lab can provide detailed site analysis and plant palette verification before you break ground.</p>
          
          {submitted ? (
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-igo-lime inline-flex flex-col items-center gap-6 animate-in zoom-in duration-300 mx-auto">
              <CheckCircle className="w-16 h-16 text-igo-lime" />
              <div className="text-center">
                <p className="text-igo-dark font-black uppercase text-xl tracking-tighter mb-2">Audit Request Sent!</p>
                <p className="text-sm text-igo-muted font-bold uppercase tracking-widest max-w-xs mx-auto">Our research team is reviewing your site data and will contact you within 12 hours.</p>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-igo-lime font-black uppercase text-[10px] tracking-widest border-b-2 border-igo-lime pb-1"
              >
                New Audit Request
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl text-left max-w-3xl mx-auto border border-gray-50">
              <form onSubmit={handleConnect} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium" 
                      placeholder="Dr. Alexander" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Research Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium" 
                      placeholder="research@domain.com" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium" 
                      placeholder="+91 98765 43210" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Audit Location</label>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium" 
                      placeholder="City/Area" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Site Address</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium" 
                    placeholder="Full location for physical audit..." 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Audit Type</label>
                    <select 
                      value={formData.plan}
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium appearance-none" 
                    >
                      <option>Soil Analysis (Standard)</option>
                      <option>Ecosystem Audit (Premium)</option>
                      <option>Full Digital-Twin Setup (Elite)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Preferred Audit Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.auditDate}
                      onChange={(e) => setFormData({...formData, auditDate: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Current Issues / Research Goal</label>
                  <textarea 
                    value={formData.issue}
                    onChange={(e) => setFormData({...formData, issue: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-igo-lime transition-all outline-none text-sm font-medium h-24 resize-none" 
                    placeholder="Describe specific botanical or environmental issues..."
                  ></textarea>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-igo-dark text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-igo-lime hover:text-igo-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                >
                  {isSubmitting ? (
                    <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : (
                    'Initiate IGO Lab Audit'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Lab;
