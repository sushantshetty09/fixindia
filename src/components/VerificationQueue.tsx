import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, X, MapPin, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import type { Issue } from '../types';

interface VerificationQueueProps {
  isOpen: boolean;
  onClose: () => void;
  pendingIssues: Issue[];
  onVerify: (id: string, isValid: boolean) => void;
}

export default function VerificationQueue({ isOpen, onClose, pendingIssues, onVerify }: VerificationQueueProps) {
  const [direction, setDirection] = useState(0);

  if (!isOpen) return null;

  const currentIssue = pendingIssues[0];

  const handleVote = (isValid: boolean) => {
    setDirection(isValid ? 1 : -1);
    setTimeout(() => {
      onVerify(currentIssue.id, isValid);
      setDirection(0);
    }, 300);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#111] backdrop-blur-3xl pointer-events-auto flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#111]/80 backdrop-blur-xl px-6 py-6 flex items-center gap-4 z-10 pt-safe">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-xl uppercase tracking-widest text-[#00FF41]">Neighbor Verification</h1>
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Help secure the integrity of the map</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative">
        <AnimatePresence mode="wait">
          {currentIssue ? (
            <motion.div
              key={currentIssue.id}
              initial={{ opacity: 0, scale: 0.9, x: direction === 0 ? 0 : (direction > 0 ? -100 : 100) }}
              animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: direction > 0 ? 300 : -300, rotate: direction > 0 ? 10 : -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF41]/50 to-transparent opacity-50" />
              
              <div className="w-12 h-12 bg-[#00FF41]/10 rounded-full flex items-center justify-center mb-6 border border-[#00FF41]/20">
                <AlertTriangle size={24} className="text-[#00FF41]" />
              </div>

              <h2 className="text-2xl font-bold mb-2">{currentIssue.title}</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  {currentIssue.category === 'Other' ? currentIssue.customCategory : currentIssue.category}
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <MapPin size={12} /> 0.4km away
                </span>
              </div>

              <div className="h-48 bg-black/40 rounded-2xl mb-8 flex flex-col items-center justify-center border border-white/5 overflow-hidden relative">
                {/* Mock Image Placeholder */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-luminosity" />
                <div className="relative z-10 flex flex-col items-center">
                  <Camera size={32} className="text-white/30 mb-2" />
                  <span className="text-xs uppercase tracking-widest font-bold text-white/30">Encrypted Evidence #912</span>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <button 
                  onClick={() => handleVote(false)}
                  className="flex-1 bg-white/5 hover:bg-[var(--color-danger-red)]/20 transition-colors border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 text-white/50 hover:text-[var(--color-danger-red)] hover:border-[var(--color-danger-red)]/50"
                >
                  <X size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Fake Notice</span>
                </button>
                <button 
                  onClick={() => handleVote(true)}
                  className="flex-1 bg-[#00FF41]/10 hover:bg-[#00FF41]/20 transition-colors border border-[#00FF41]/30 p-4 rounded-2xl flex flex-col items-center gap-2 text-[#00FF41]"
                >
                  <Check size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verify Exists</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-[#00FF41]/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-[#00FF41]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Area Secured</h2>
              <p className="text-white/50 max-w-[250px]">There are no pending civic reports in your immediate vicinity. Great job keeping the map accurate.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
