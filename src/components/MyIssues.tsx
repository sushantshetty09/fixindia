import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, AlertCircle, Clock } from 'lucide-react';
import type { Issue } from '../types';

interface MyIssuesProps {
  isOpen: boolean;
  onClose: () => void;
  myIssues: Issue[];
}

export default function MyIssues({ isOpen, onClose, myIssues }: MyIssuesProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-[var(--color-brand-bg)] backdrop-blur-3xl overflow-y-auto pointer-events-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[var(--color-brand-bg)]/80 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center gap-4 z-10 pt-safe">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-xl uppercase tracking-widest text-[#00D1FF]">My Reports</h1>
      </div>

      <div className="p-6 pb-20">
        {myIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <AlertCircle size={48} className="mb-4" />
            <span className="font-bold tracking-widest uppercase">No Reports Found</span>
          </div>
        ) : (
          <div className="space-y-4">
            {myIssues.map((issue) => (
              <div key={issue.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-lg">{issue.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    issue.status === 'open' ? 'bg-[#FFBF00]/20 text-[#FFBF00]' : 
                    issue.status === 'resolved' ? 'bg-[var(--color-cyber-green)]/20 text-[var(--color-cyber-green)]' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs font-medium text-white/50">
                  <span className="bg-black/40 px-3 py-1 rounded-full">{issue.category === 'Other' ? issue.customCategory : issue.category}</span>
                  <span className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full">
                    <MapPin size={10} /> {issue.ward}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5">
                  <Clock size={12} className="text-white/30" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Reported: {issue.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
