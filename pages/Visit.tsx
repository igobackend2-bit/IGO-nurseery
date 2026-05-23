
import React from 'react';
/* Added Pickaxe to the imports from lucide-react */
import { MapPin, Clock, Calendar, ShieldCheck, Camera, Coffee, Car, Pickaxe } from 'lucide-react';

const Visit: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center overflow-hidden bg-igo-dark">
        <img 
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=2000" 
            alt="Campus" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-white">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">Step into <br/><span className="text-igo-lime">The Farm.</span></h1>
            <p className="text-xl max-w-xl font-medium opacity-90">Experience India's most advanced plant research facility in Muttukadu, Chennai.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-20">
            {/* Booking Form */}
            <div className="space-y-12">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-igo-dark tracking-tighter uppercase">Plan Your Visit</h2>
                    <p className="text-igo-muted">Walk through our 25-acre facility, explore the IGO Lab, and consult with our plant experts.</p>
                </div>

                <form className="space-y-6 bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Full Name</label>
                            <input type="text" className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-igo-lime" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Email</label>
                            <input type="email" className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-igo-lime" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Preferred Date</label>
                            <input type="date" className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-igo-lime" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-igo-muted">Visit Type</label>
                            <select className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-igo-lime">
                                <option>General Farm Tour</option>
                                <option>Landscape Consultation</option>
                                <option>Architectural Collaboration</option>
                            </select>
                        </div>
                    </div>

                    <button className="w-full bg-igo-dark text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-igo-lime hover:text-igo-dark transition-all shadow-xl">Confirm Request</button>
                    <p className="text-[10px] text-center text-igo-muted uppercase font-bold tracking-widest">A member of our team will contact you for verification.</p>
                </form>
            </div>

            {/* Campus Info */}
            <div className="space-y-16">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-igo-lime/10 p-4 rounded-2xl w-fit"><MapPin className="text-igo-dark" /></div>
                        <h4 className="font-black uppercase tracking-tighter text-igo-dark">Location</h4>
                        <p className="text-sm text-igo-muted leading-relaxed">ECR Road, Muttukadu, <br/>Chennai, Tamil Nadu 603112</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-igo-lime/10 p-4 rounded-2xl w-fit"><Clock className="text-igo-dark" /></div>
                        <h4 className="font-black uppercase tracking-tighter text-igo-dark">Open Hours</h4>
                        <p className="text-sm text-igo-muted leading-relaxed">Mon - Sat: 9 AM - 6 PM <br/>Sun: 10 AM - 4 PM</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-lg font-black uppercase tracking-widest text-igo-dark border-b-2 border-igo-lime pb-2 inline-block">Campus Amenities</h4>
                    <ul className="space-y-4">
                        {[
                            { icon: <ShieldCheck className="w-5 h-5" />, text: 'Authorized Entry & Security' },
                            { icon: <Camera className="w-5 h-5" />, text: 'Photography Friendly Zones' },
                            { icon: <Coffee className="w-5 h-5" />, text: 'Refined Visitor Lounge' },
                            { icon: <Car className="w-5 h-5" />, text: 'Complimentary On-site Parking' }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-igo-muted font-medium">
                                <div className="text-igo-lime">{item.icon}</div>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-igo-dark text-white p-10 rounded-[3rem] relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="text-igo-lime font-black uppercase text-[10px] tracking-widest">Expert Advice</div>
                        <h4 className="text-2xl font-black tracking-tighter uppercase">Book a Studio Expert</h4>
                        <p className="text-gray-400 text-sm">Want to discuss a landscape project? Mark 'Landscape Consultation' in the form to ensure a senior designer is present during your visit.</p>
                    </div>
                    <Pickaxe className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10 rotate-12" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Visit;
