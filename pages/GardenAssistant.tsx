
import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2, Sparkles, Sprout, Home, Building2, MapPin, Sun, Wind, Wallet, ListChecks } from 'lucide-react';

const GardenAssistant: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: '',
    location: '',
    environment: '',
    budget: '',
    interests: [] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2500));
    
    const generatedResults = {
        plants: [
            { name: 'Monstera Deliciosa', reason: 'Perfect for your indirect light setting.' },
            { name: 'Fiddle Leaf Fig', reason: 'Adds vertical architectural interest.' },
            { name: 'Areca Palm', reason: 'Great air purifier for Chennai climate.' }
        ],
        estimate: '₹12,000 - ₹18,000',
        timeline: '2-3 Weeks Execution'
    };
    
    setResults(generatedResults);

    const { customerApi } = await import('../services/customerApi');
    await customerApi.submitLead({
      customerName: 'AI Generated Profile',
      customerEmail: 'assistant@igo.tech',
      customerPhone: '',
      type: 'consultation',
      location: formData.location,
      reason: `AI DESIGN REQUEST: ${formData.userType} project for ${formData.environment} environment. Interested in ${formData.interests.join(', ')}.`,
      issue: `AI DESIGN REQUEST: ${formData.userType} project for ${formData.environment} environment. Interested in ${formData.interests.join(', ')}.`,
      selectedPlan: formData.budget,
      message: `I've used the AI Assistant to generate a blueprint for my ${formData.userType} in ${formData.location}. My environment is ${formData.environment} and my budget is ${formData.budget}.\n\nSYSTEM: AI Blueprint captured. Summary: ${generatedResults.plants.map((p: any) => p.name).join(', ')}. Estimate: ${generatedResults.estimate}.`
    });

    setIsGenerating(false);
    setStep(6);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Home className="text-green-600" /> Who are we designing for?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Home Gardener', 'Villa Owner', 'Resort/Hotel', 'Architect', 'Corporate Office', 'Urban Farm'].map(type => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, userType: type })}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${formData.userType === type ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                >
                  <span className="font-bold">{type}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="text-green-600" /> Where is your property?
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="City/Region (e.g., ECR, Chennai)" 
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <div className="flex gap-4">
                {['Coastal', 'Inland', 'Highland'].map(zone => (
                  <button 
                    key={zone}
                    onClick={() => setFormData({ ...formData, location: zone })}
                    className={`flex-1 p-4 rounded-xl border text-sm font-bold ${formData.location.includes(zone) ? 'bg-green-700 text-white' : 'bg-white'}`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
          return (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sun className="text-green-600" /> Environmental factors
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { id: 'sun', label: 'Direct Sunlight (6+ hours)', icon: <Sun /> },
                  { id: 'shade', label: 'Mostly Shade', icon: <Wind /> },
                  { id: 'balcony', label: 'Covered Balcony', icon: <Building2 /> },
                  { id: 'indoor', label: 'Indoor / Air Conditioned', icon: <Home /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, environment: item.id })}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${formData.environment === item.id ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                  >
                    <div className="text-green-600">{item.icon}</div>
                    <span className="font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
      case 4:
          return (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Wallet className="text-green-600" /> Budget Expectations
              </h3>
              <div className="grid gap-3">
                {['Minimalist (Under ₹25k)', 'Standard (₹25k - ₹1L)', 'Premium (₹1L - ₹5L)', 'Estate Level (₹5L+)'].map(b => (
                  <button
                    key={b}
                    onClick={() => setFormData({ ...formData, budget: b })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.budget === b ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                  >
                    <span className="font-bold">{b}</span>
                  </button>
                ))}
              </div>
            </div>
          );
      case 5:
          return (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <ListChecks className="text-green-600" /> Feature Interests
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['Lawn Area', 'Vertical Garden', 'Water Feature', 'Kitchen Garden', 'Aromatic Plants', 'Privacy Hedge'].map(feat => (
                  <label key={feat} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={formData.interests.includes(feat)}
                      onChange={(e) => {
                        const newInterests = e.target.checked 
                          ? [...formData.interests, feat]
                          : formData.interests.filter(i => i !== feat);
                        setFormData({ ...formData, interests: newInterests });
                      }}
                    />
                    <span className="text-sm font-medium">{feat}</span>
                  </label>
                ))}
              </div>
            </div>
          );
      case 6:
          return (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold inline-block uppercase">Analysis Complete</div>
                    <h3 className="text-3xl font-bold">Your Garden Blueprint</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="font-bold text-xl border-b pb-2">Recommended Palette</h4>
                        <div className="space-y-4">
                            {results.plants.map((p: any, i: number) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="bg-green-50 p-2 rounded-lg"><Sprout className="text-green-600 w-5 h-5" /></div>
                                    <div>
                                        <div className="font-bold">{p.name}</div>
                                        <div className="text-xs text-gray-500">{p.reason}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 text-white p-8 rounded-3xl space-y-6">
                        <h4 className="font-bold text-xl border-b border-white/10 pb-2 text-green-400">Project Snapshot</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs uppercase text-gray-500 font-bold tracking-widest">Estimated Cost</div>
                                <div className="text-2xl font-bold">{results.estimate}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase text-gray-500 font-bold tracking-widest">Timeline</div>
                                <div className="text-2xl font-bold">{results.timeline}</div>
                            </div>
                            <div className="pt-4 flex flex-col gap-3">
                                <button className="w-full bg-green-600 py-3 rounded-xl font-bold hover:bg-green-700 transition-all">Request Expert Consultation</button>
                                <button className="w-full bg-white/10 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">Add Plants to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Wizard Header */}
          <div className="bg-green-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-32 h-32" /></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Garden Assistant</h2>
              <p className="text-green-100 text-sm font-light">Tell us about your space, and our AgriTech system will design the perfect ecosystem for you.</p>
              
              {/* Progress Bar */}
              {step < 6 && (
                <div className="mt-8 flex items-center gap-2">
                    {[1,2,3,4,5].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/20'}`}></div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8 md:p-12">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">Applying Lab Insights...</h3>
                    <p className="text-gray-500">Cross-referencing climate data with your preferences.</p>
                </div>
              </div>
            ) : (
              <>
                {renderStep()}
                
                {step < 6 && (
                  <div className="mt-12 pt-8 border-t flex justify-between items-center">
                    <button 
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-gray-400 font-bold hover:text-gray-900 flex items-center gap-2 disabled:opacity-0"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    
                    {step === 5 ? (
                      <button 
                        onClick={handleComplete}
                        className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition-all flex items-center gap-2"
                      >
                        Generate Blueprint <Check className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={nextStep}
                        className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition-all flex items-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenAssistant;
