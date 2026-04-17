import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, FileText, HeartHandshake, Bug, CheckCircle, BarChart3 } from 'lucide-react';

export type PageType = 'privacy' | 'terms' | 'donate' | 'help' | 'verify' | 'liveability' | null;

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageType) => void;
}

export default function NavigationMenu({ isOpen, onClose, onNavigate }: NavigationMenuProps) {
  const menuItems = [
    { id: 'liveability', label: 'Valuable Spots', icon: <BarChart3 size={18} className="text-[#00D1FF]" /> },
    { id: 'verify', label: 'Verify Local Issues', icon: <CheckCircle size={18} className="text-[#00FF41]" /> },
    { id: 'donate', label: 'Support & Donate', icon: <HeartHandshake size={18} className="text-[#FFD700]" /> },
    { id: 'help', label: 'Report Platform Bug', icon: <Bug size={18} className="text-[#00D1FF]" /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <ShieldAlert size={18} className="text-[#00FF41]" /> },
    { id: 'terms', label: 'Terms of Service', icon: <FileText size={18} className="text-white/60" /> },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-24 right-4 w-64 bg-[var(--color-brand-bg)] border border-[var(--color-fluid-border)] backdrop-blur-3xl rounded-3xl overflow-hidden z-50 shadow-[0_20px_40px_rgba(0,0,0,0.8)] pointer-events-auto"
          >
            <div className="p-4 relative flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white/50 uppercase tracking-widest text-xs ml-2 mt-2">More Options</h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors mt-1">
                  <X size={16} className="text-white/50" />
                </button>
              </div>
              
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as PageType);
                    onClose();
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 transition-transform p-4 rounded-xl flex items-center gap-3 active:scale-95"
                >
                  {item.icon}
                  <span className="font-bold text-sm text-white/90">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
