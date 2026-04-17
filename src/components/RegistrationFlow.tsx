import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, EyeOff, ArrowRight, Shield, Briefcase, AtSign, Link2 } from 'lucide-react';

interface RegistrationFlowProps {
  onComplete: () => void;
}

export default function RegistrationFlow({ onComplete }: RegistrationFlowProps) {
  const [step, setStep] = useState<'choice' | 'details'>('choice');
  const [formData, setFormData] = useState({
    jobTitle: '',
    facebook: '',
    instagram: '',
    linkedin: ''
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#00D1FF]/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00D1FF]/10 via-black to-black" />
      
      <AnimatePresence mode="wait">
        {step === 'choice' && (
          <motion.div 
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center p-6 relative z-10 w-full max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,209,255,0.2)] mb-8">
              <Shield size={32} className="text-[#00D1FF]" />
            </div>

            <h1 className="text-3xl font-black uppercase tracking-widest text-center mb-2">Claim Your Identity</h1>
            <p className="text-center text-white/50 mb-12 text-sm leading-relaxed px-4">
              Hold the city accountable. You can act as an invisible guardian, or step into the spotlight and build your civic reputation.
            </p>

            <div className="w-full space-y-4">
              <button 
                onClick={() => setStep('details')}
                className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/90 transition-colors p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(0,209,255,0.3)] text-black cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                  <User size={18} />
                  Register & Showcase
                </div>
                <span className="text-[10px] font-bold opacity-70 tracking-widest uppercase">Earn points & climb the leaderboards</span>
              </button>

              <button 
                onClick={onComplete}
                className="w-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-white/80">
                  <EyeOff size={18} className="text-white/50" />
                  Stay Anonymous
                </div>
                <span className="text-[10px] lowercase tracking-widest text-white/40">Your identity will never be exposed</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col p-6 relative z-10 w-full max-w-md mx-auto"
          >
            <h1 className="text-2xl font-black uppercase tracking-widest mb-1">Build Your Profile</h1>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-8 font-bold">All fields are 100% Optional</p>

            <div className="space-y-4 w-full">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#00D1FF] tracking-widest ml-1 mb-1 block">Your Profession / Role</label>
                <div className="flex bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-[#00D1FF]/50 transition-colors">
                  <Briefcase size={18} className="text-white/30 mr-3 shrink-0" />
                  <input 
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/20" 
                    placeholder="e.g. Urban Planner, Student..." 
                    value={formData.jobTitle} 
                    onChange={e => setFormData({...formData, jobTitle: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#00D1FF] tracking-widest ml-1 mb-1 block">Social Links (Boosts Trust)</label>
                <div className="space-y-2">
                  <div className="flex bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-[#00D1FF]/50 transition-colors">
                    <AtSign size={18} className="text-white/30 mr-3 shrink-0" />
                    <input 
                      className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/20" 
                      placeholder="Instagram URL or Handle" 
                      value={formData.instagram} 
                      onChange={e => setFormData({...formData, instagram: e.target.value})} 
                    />
                  </div>
                  <div className="flex bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-[#00D1FF]/50 transition-colors">
                    <Link2 size={18} className="text-white/30 mr-3 shrink-0" />
                    <input 
                      className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/20" 
                      placeholder="Facebook Profile URL" 
                      value={formData.facebook} 
                      onChange={e => setFormData({...formData, facebook: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={onComplete}
              className="w-full mt-10 bg-[#FF9933] hover:bg-[#FF9933]/90 transition-colors p-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,153,51,0.3)] text-black font-black uppercase tracking-widest"
            >
              Enter FixIndia.org <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
