import React from 'react';
import { ShieldCheck, FileText, Truck, ArrowLeft, ChevronRight } from 'lucide-react';

interface InfoPageProps {
  type: 'privacy' | 'terms' | 'shipping';
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ type, onBack }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-12 h-12 text-igo-lime" />,
      sections: [
        {
          heading: '1. Intelligence Data Collection',
          body: 'We collect data through our AI Garden Assistant, including your environmental conditions (light, humidity), garden budget, and aesthetic preferences. This data is used solely to refine your personalized plant recommendations.'
        },
        {
          heading: '2. Transactional & CRM Information',
          body: 'When you place an order or submit a Service Inquiry (Consultation, Lab Audit, etc.), we collect your name, email, phone number, and physical address. This is necessary for logistics and high-touch service delivery.'
        },
        {
          heading: '3. Data Security',
          body: 'IGO Agritechfarms utilizes industrial-grade encryption for all user profiles and transaction logs. We do not store full credit card details; payment references are handled through secure gateways.'
        }
      ]
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="w-12 h-12 text-igo-lime" />,
      sections: [
        {
          heading: '1. AI Assistant Disclaimer',
          body: 'The AI Garden Assistant provides botanical suggestions based on user input. While highly accurate, these are recommendations and not absolute guarantees of plant performance in varying micro-climates.'
        },
        {
          heading: '2. Service Engagement',
          body: 'Bookings for Landscape Design, Lab Audits, and AMC services are subject to site feasibility. IGO reserves the right to adjust service quotes based on actual site dimensions and soil conditions discovered during inspection.'
        },
        {
          heading: '3. Live Asset Policy',
          body: 'As we deal with living biological assets (plants), returns are only accepted if damage is reported within 24 hours of delivery. Once planted or repotted by the customer, IGO is not responsible for growth outcomes.'
        }
      ]
    },
    shipping: {
      title: 'Shipping & Delivery Info',
      icon: <Truck className="w-12 h-12 text-igo-lime" />,
      sections: [
        {
          heading: '1. Specialized Plant Logistics',
          body: 'We use the "IGO Bio-Shell" packaging system for all live plants. This ensures 360-degree protection and moisture retention for up to 7 days during transit.'
        },
        {
          heading: '2. Delivery Timelines',
          body: 'Nursery tools and seeds ship within 48 hours. Live plants are shipped Monday-Wednesday only to avoid weekend storage in courier hubs, ensuring maximum freshness upon arrival.'
        },
        {
          heading: '3. Shipping Zones',
          body: 'We currently serve major metropolitan areas and tier-1 cities across India. Remote locations may require additional "Green Handling" surcharges due to extended transit times.'
        }
      ]
    }
  }[type];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 selection:bg-igo-lime selection:text-igo-dark">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-igo-dark transition-all mb-12 group"
        >
          <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-igo-dark transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to IGO Terminal</span>
        </button>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-[2rem] w-fit shadow-inner">
                {content.icon}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-igo-dark tracking-tighter uppercase leading-[0.85] shadow-text">
                {content.title.split(' ')[0]}<br />
                <span className="text-igo-lime">{content.title.split(' ').slice(1).join(' ')}</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Protocol v4.2.0</p>
              <p className="text-[10px] font-black text-igo-muted uppercase tracking-[0.3em]">Last Updated: April 2024</p>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-16 border-t border-gray-100 pt-16">
            <aside className="space-y-6">
              <p className="text-xs font-bold text-gray-400 leading-relaxed italic">
                "Our commitment to high-tech greenery extends to the security and clarity of our user engagement protocols."
              </p>
              <div className="h-px bg-gray-100 w-12" />
              <div className="flex items-center gap-2 text-[10px] font-black text-igo-dark uppercase tracking-widest">
                <ChevronRight className="w-3 h-3 text-igo-lime" /> IGO Compliance Team
              </div>
            </aside>

            <div className="space-y-16">
              {content.sections.map((section, idx) => (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xs font-black text-igo-dark uppercase tracking-[0.2em] flex items-center gap-4">
                    <span className="w-6 h-6 rounded-lg bg-igo-dark text-white flex items-center justify-center text-[10px]">{idx + 1}</span>
                    {section.heading}
                  </h2>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {section.body}
                  </p>
                </section>
              ))}

              <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 mt-20">
                <h3 className="text-xs font-black text-igo-dark uppercase tracking-widest mb-4">Direct Inquiry</h3>
                <p className="text-sm text-gray-400 mb-6 font-medium">For complex legal queries or data deletion requests, contact our Compliance Hub directly.</p>
                <a href="mailto:compliance@igonursery.com" className="inline-flex items-center gap-3 text-igo-dark font-black uppercase text-[10px] tracking-widest hover:text-igo-lime transition-colors">
                  compliance@igonursery.com <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
