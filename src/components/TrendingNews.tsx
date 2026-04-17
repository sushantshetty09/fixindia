import { motion } from 'framer-motion';
import { ChevronRight, Newspaper } from 'lucide-react';
import type { NewsArticle } from '../types';

interface TrendingNewsProps {
  news: NewsArticle[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TrendingNews({ news, isOpen, onClose }: TrendingNewsProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, { offset, velocity }) => {
          if (offset.x < -50 || velocity.x < -500) onClose();
        }}
        className="fixed top-0 bottom-0 left-0 w-[85vw] max-w-sm bg-[var(--color-brand-bg)] border-r border-white/10 z-50 flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 bg-black/40 flex items-center justify-between pt-safe">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00D1FF]/20 flex items-center justify-center border border-[#00D1FF]/30">
              <Newspaper size={18} className="text-[#00D1FF]" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white uppercase tracking-widest">Trending</h2>
              <p className="text-[10px] text-white/50 uppercase tracking-[2px] font-bold">City-Wide News</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors pointer-events-auto"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {news.map(item => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2 text-[10px] font-bold uppercase tracking-widest">
                <span className={item.isTragic ? 'text-[var(--color-danger-red)]' : 'text-[#00D1FF]'}>
                  {item.source}
                </span>
                <span className="text-white/40">{item.date}</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-2 leading-snug">
                {item.title}
              </h3>
              {item.snippet && (
                <p className="text-xs text-white/50 leading-relaxed">
                  {item.snippet}
                </p>
              )}
            </a>
          ))}
        </div>
      </motion.div>
    </>
  );
}
