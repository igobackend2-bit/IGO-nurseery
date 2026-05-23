import React from 'react';
import { ArrowRight, Zap, Microscope, ShieldCheck, MapPin, ExternalLink, Pickaxe, Cpu, Leaf, Activity } from 'lucide-react';
import { Page } from '../types';

interface HomeProps {
  onNavigate?: (page: Page, param?: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const handleNavigate = (page: Page, param?: string) => {
    if (onNavigate) {
      onNavigate(page, param);
    } else {
      window.location.hash = page;
    }
  };

  const [activeLegal, setActiveLegal] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const legal = params.get('legal');
    if (legal) setActiveLegal(legal);
  }, []);

  const closeModal = () => {
    setActiveLegal(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="animate-in fade-in duration-1000">
      {/* Legal Modal */}
      {activeLegal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-igo-dark/80 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
             <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h2 className="text-3xl font-black text-igo-dark uppercase tracking-tighter italic">
                         {activeLegal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                      </h2>
                      <p className="text-[10px] font-black text-igo-muted uppercase tracking-widest mt-1">Official Document — IGO Legal Hub</p>
                   </div>
                   <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Zap className="w-6 h-6 text-igo-dark rotate-45" />
                   </button>
                </div>
                
                <div className="space-y-6 text-sm text-gray-600 leading-relaxed font-medium">
                   {activeLegal === 'terms' ? (
                      <>
                         <p className="font-bold text-igo-dark">1. Acceptance of Terms</p>
                         <p>By accessing and using IGO Nursery, you agree to be bound by these Terms and Conditions. Our services are provided as-is, focused on botanical retail and agricultural technology.</p>
                         
                         <p className="font-bold text-igo-dark">2. Botanical Variability</p>
                         <p>As biological entities, plants vary in shape, size, and exact color. While we guarantee health and species accuracy, the physical specimen may differ slightly from catalog images.</p>
                         
                         <p className="font-bold text-igo-dark">3. Health Guarantee</p>
                         <p>We provide a 15-day survival guarantee for all plants shipped. This guarantee is void if plants are neglected, underwatered, or exposed to extreme conditions contrary to our care guides.</p>
                         
                         <p className="font-bold text-igo-dark">4. Intellectual Property</p>
                         <p>The "IGO" brand, our Lab R&D data, and garden assistant algorithms are the exclusive property of Igoagritechfarms.</p>
                      </>
                   ) : (
                      <>
                         <p className="font-bold text-igo-dark">1. Data Sovereignty</p>
                         <p>We collect your name, email, and shipping coordinates solely for order fulfillment and personalized garden advice. Your data remains your property.</p>
                         
                         <p className="font-bold text-igo-dark">2. AI Garden Assistance</p>
                         <p>Our Garden Assistant processes your inputs to generate advice. This data is anonymized to improve our horticultural models and never sold to third parties.</p>
                         
                         <p className="font-bold text-igo-dark">3. Security Standards</p>
                         <p>All transactions and profile data are protected via industry-standard encryption. We use secure gateways for payment processing.</p>
                         
                         <p className="font-bold text-igo-dark">4. Communication</p>
                         <p>You will receive operational emails regarding your orders and inquiries. You may opt-out of marketing communications at any time.</p>
                      </>
                   )}
                </div>
                
                <div className="mt-10 pt-10 border-t border-gray-100">
                   <button onClick={closeModal} className="w-full py-4 bg-igo-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-igo-lime hover:text-igo-dark transition-all">I Understand</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Precision Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-x-hidden overflow-y-visible bg-igo-dark">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=2000"
            alt="Advanced polyhouse facility at IGO Nursery — precision AgriTech greenhouse"
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-igo-dark via-transparent to-igo-dark/40"></div>
          {/* Animated Tech Grid Overlay */}
          <div className="absolute inset-0 opacity-10 grid-pattern-lg"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <div className="w-2 h-2 bg-igo-lime rounded-full animate-ping"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-igo-lime">Muttukadu Lab Online</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                <span className="sr-only">Premium Nursery Plants &amp; AgriTech Greenery — IGO Nursery: </span>NATURE <br />
                <span className="text-gradient">ENGINEERED.</span>
              </h1>
              
              <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-lg">
                IGO is not just a nursery. We are an AgriTech farm using IoT data and precision trials to grow the healthiest plant palette in India.
              </p>

              <div className="lg:hidden inline-flex items-center gap-3 glass px-4 py-3 rounded-2xl shadow-2xl border-l-4 border-blue-500">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <ShieldCheck className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-igo-dark">99.2%</div>
                  <div className="text-[10px] text-igo-muted uppercase font-black tracking-widest">Health Guarantee</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-6">
                <button onClick={() => handleNavigate(Page.Assistant)} className="bg-igo-lime text-igo-dark px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(132,204,22,0.3)]">
                  Start Garden Assistant
                  <Zap className="w-4 h-4 fill-current" />
                </button>
                <button onClick={() => handleNavigate(Page.Shop)} className="bg-white/10 border border-white/20 text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white/20 transition-all">
                  Shop Plants
                </button>
              </div>
            </div>

            {/* Visual Dashboard Side */}
            <div className="hidden lg:block relative z-20">
              <div className="relative w-full max-w-[34rem] ml-auto aspect-square float">
                {/* Floating Tech Modules */}
                <div className="absolute top-10 left-2 xl:-left-4 glass p-5 rounded-3xl shadow-2xl z-30 flex items-center gap-4 border-l-4 border-igo-lime">
                  <div className="bg-igo-dark p-3 rounded-2xl">
                    <Cpu className="text-igo-lime w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-igo-dark">28.4°C</div>
                    <div className="text-[10px] text-igo-muted uppercase font-black tracking-widest">Core Lab Temp</div>
                  </div>
                </div>

                <div className="absolute bottom-14 right-2 xl:right-0 glass p-5 rounded-3xl shadow-2xl z-40 flex items-center gap-4 border-l-4 border-blue-500">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <ShieldCheck className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-igo-dark">99.2%</div>
                    <div className="text-[10px] text-igo-muted uppercase font-black tracking-widest">Health Guarantee</div>
                  </div>
                </div>

                {/* Hero Main Image Circle */}
                <div className="w-[80%] h-[80%] mx-auto rounded-full border-[20px] border-white/5 overflow-hidden p-4">
                  <img 
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800"
                    className="w-full h-full object-cover rounded-full"
                    alt="Premium nursery plant grown at IGO Nursery — healthy and lab-certified"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Projects Scroller */}
      <section className="bg-gray-50 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-12 flex justify-between items-end">
            <div>
                <p className="text-sm uppercase tracking-[0.4em] font-black text-igo-lime mb-2">Portfolio Feed</p>
                <h2 className="text-4xl font-black text-igo-dark tracking-tighter">Live from our Sites.</h2>
            </div>
            <button onClick={() => handleNavigate(Page.Landscape)} className="text-xs font-black uppercase tracking-widest text-igo-muted hover:text-igo-dark transition-colors border-b-2 border-transparent hover:border-igo-dark pb-1">View All Case Studies</button>
        </div>

        <div className="flex gap-8 overflow-x-auto px-4 lg:px-[calc((100vw-80rem)/2)] no-scrollbar pb-10">
            {[
                { title: 'ECR Ocean Villa', status: 'Planting Phase', area: '12,000 sq.ft', img: '/images/sites/ECR Ocean Villa.jpg' },
                { title: 'The Palms Resort', status: 'AMC Active', area: '4.5 Acres', img: '/images/sites/The Palms Resort.jpg' },
                { title: 'Zen Corporate HQ', status: 'Interior Bio-Design', area: '25,000 sq.ft', img: '/images/sites/Zen Corporate HQ.jpg' },
                { title: 'Muttukadu Heights', status: 'Vertical Greenery', area: '3,200 sq.ft', img: '/images/sites/muttukadu-heights.png' }
            ].map((proj, i) => (
                <div key={i} className="flex-shrink-0 w-80 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
                    <div className="h-48 relative overflow-hidden">
                        <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-igo-dark/80 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">{proj.status}</div>
                    </div>
                    <div className="p-6">
                        <div className="text-[10px] font-bold text-igo-lime uppercase tracking-widest mb-1">{proj.area}</div>
                        <h4 className="text-lg font-black text-igo-dark">{proj.title}</h4>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Industrial Segment Cards */}
      <section className="py-32 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 mb-20">
          <p className="text-sm uppercase tracking-[0.4em] font-black text-igo-lime">The IGO Collective</p>
          <h2 className="text-4xl md:text-5xl font-black text-igo-dark tracking-tighter">Full-Stack Greenery Services.</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {[
            { 
              title: 'D2C Retail Store', 
              tagline: 'Precision Grown',
              desc: 'Premium polyhouse-grown plants delivered across India with our zero-damage packaging guarantee.', 
              icon: <Leaf className="w-10 h-10" />,
              link: '#product',
              img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800',
              accent: 'bg-igo-lime'
            },
            { 
              title: 'Landscape Studio', 
              tagline: 'Architectural Scale',
              desc: 'From villa sanctuaries to resort estates. We handle everything from soil R&D to final execution.', 
              icon: <Pickaxe className="w-10 h-10 rotate-45" />,
              link: '#landscape',
              img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
              accent: 'bg-igo-dark'
            },
            { 
              title: 'AMC Program', 
              tagline: 'Smart Garden Care',
              desc: 'Annual maintenance contracts managed by lab-certified agronomists. We track health so you don\'t have to.', 
              icon: <Zap className="w-10 h-10" />,
              link: '#amc',
              img: '/images/services/amc-program.png',
              accent: 'bg-white border-2 border-igo-dark'
            }
          ].map((card, idx) => (
            <div key={idx} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-gray-100 flex flex-col h-full">
              <div className="h-64 overflow-hidden relative">
                <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-6 left-6 px-4 py-1 rounded-full bg-igo-dark/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">{card.tagline}</div>
              </div>
              <div className="p-10 flex-grow flex flex-col justify-between">
                <div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${card.accent} ${idx === 1 ? 'text-igo-lime' : idx === 0 ? 'text-igo-dark' : 'text-igo-dark'}`}>
                    {card.icon}
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tighter">{card.title}</h3>
                  <p className="text-igo-muted font-medium leading-relaxed mb-8">{card.desc}</p>
                </div>
                <button onClick={() => handleNavigate(card.link.includes('product') ? Page.Product : card.link.includes('landscape') ? Page.Landscape : Page.AMC)} className="inline-flex items-center text-igo-dark font-black uppercase text-xs tracking-widest hover:gap-4 transition-all text-left">
                  Explore Service <ArrowRight className="ml-3 w-4 h-4 text-igo-lime" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Page Section */}
      <section className="pb-24 max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-igo-dark to-igo-charcoal rounded-[2.5rem] p-10 md:p-14 text-white grid lg:grid-cols-2 gap-10 items-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 grid-pattern-md"></div>
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-[0.3em] font-black text-igo-lime mb-4">New Section</div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-5">Product Page is Live.</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-xl">
              Explore curated collections, planting essentials, and landscape-ready material in one dedicated product experience.
            </p>
            <button
              onClick={() => handleNavigate(Page.Product)}
              className="bg-igo-lime text-igo-dark px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors inline-flex items-center gap-3"
            >
              Open Product Page <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative z-10">
            <img
              src="/images/indoor/monstera.png"
              alt="Monstera indoor plant — featured from IGO Nursery product collection"
              className="w-full h-[320px] md:h-[380px] object-cover rounded-3xl border border-white/10"
            />
          </div>
        </div>
      </section>

      {/* Tech Lab Spotlight */}
      <section className="bg-igo-dark py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 text-igo-lime">
                <Microscope className="w-6 h-6" />
                <span className="uppercase font-black tracking-widest text-xs">IGO Lab R&D Division</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                We Build <span className="text-igo-lime">Biologically Superior</span> Gardens.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed font-light">
                Every plant that leaves our Muttukadu campus has passed through our AgriTech lab. We monitor soil pH, moisture tension, and UV stress to ensure your garden doesn't just look good—it thrives.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-4xl font-black text-white">14+</div>
                  <div className="text-xs font-bold text-igo-muted uppercase tracking-widest">Active Trials</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-black text-white">25 Acres</div>
                  <div className="text-xs font-bold text-igo-muted uppercase tracking-widest">High-Tech Campus</div>
                </div>
              </div>

              <button onClick={() => handleNavigate(Page.Lab)} className="text-igo-lime font-black uppercase text-xs tracking-[0.3em] flex items-center gap-4 hover:gap-6 transition-all">
                Enter The Lab <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600" className="rounded-3xl w-full h-full object-cover" alt="IGO Nursery AgriTech lab — soil and plant research facility" />
                <img src="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=600" className="rounded-3xl w-full h-full object-cover mt-12" alt="Precision agriculture trials at IGO Nursery Muttukadu campus" />
              </div>
              {/* Telemetry Box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-igo-lime rounded-full p-1 shadow-[0_0_80px_rgba(132,204,22,0.4)] animate-pulse flex items-center justify-center">
                 <div className="bg-igo-dark w-full h-full rounded-full flex flex-col items-center justify-center text-center p-4">
                    <Pickaxe className="text-igo-lime w-8 h-8 mb-2 rotate-45" />
                    <span className="text-[10px] text-white font-black uppercase leading-tight">IGO-OS <br/> v2.4 Active</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Standard Trust */}
      <section className="py-24 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
                { label: 'Plant Deliveries', value: '150,000+' },
                { label: 'Studio Projects', value: '450+' },
                { label: 'Team Size', value: '85 Experts' },
                { label: 'Client Satisfaction', value: '99.8%' },
            ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                    <div className="text-4xl md:text-5xl font-black text-igo-dark mb-2 transition-transform group-hover:scale-110 group-hover:text-igo-lime">{stat.value}</div>
                    <div className="text-[10px] text-igo-muted font-black uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
            ))}
        </div>
      </section>

      {/* Call to Action: Project Capture */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to Build Your <br/><span className="italic font-serif">Living Legacy?</span></h2>
            <p className="text-igo-muted text-xl max-w-2xl mx-auto font-medium">Whether you need an office plant or a resort masterplan, IGO combines art and science to create spaces that breathe.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button onClick={() => handleNavigate(Page.Assistant)} className="bg-igo-dark text-white px-12 py-6 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-igo-charcoal shadow-2xl transition-all">Start Project Wizard</button>
                <button onClick={() => handleNavigate(Page.Visit)} className="bg-gray-100 text-igo-dark px-12 py-6 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-gray-200 transition-all">Visit Our Campus</button>
            </div>
        </div>
      </section>

      {/* Footer / Legal */}
      <footer className="bg-igo-dark py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="text-white font-black text-2xl tracking-tighter uppercase">IGO <span className="text-igo-lime">NURSERY</span></div>
              <p className="text-gray-500 text-xs font-medium max-w-sm">© 2026 Igoagritechfarms. All rights reserved. Engineering the future of Indian agriculture.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <button 
                onClick={() => handleNavigate(Page.Home, '?legal=terms')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-igo-lime transition-colors"
              >
                Terms & Conditions
              </button>
              <button 
                onClick={() => handleNavigate(Page.Home, '?legal=privacy')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-igo-lime transition-colors"
              >
                Privacy Policy
              </button>
              <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-igo-lime transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
