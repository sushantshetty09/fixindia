import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Zap, MapPin, TrendingUp, ShieldCheck, Leaf } from 'lucide-react';

interface Neighborhood {
  id: string;
  name: string;
  score: number;
  rank: number;
  resolutionSpeed: string;
  mla: {
    name: string;
    score: number;
  };
  lifestyle: {
    greenery: number;
    walkability: number;
    safety: number;
  };
  image: string;
}

const MOCK_BEST: Neighborhood[] = [
  {
    id: '1',
    name: 'Indiranagar',
    score: 94,
    rank: 1,
    resolutionSpeed: '1.2 days',
    mla: { name: 'S. Kumar', score: 96 },
    lifestyle: { greenery: 92, walkability: 98, safety: 91 },
    image: 'https://images.unsplash.com/photo-1590490360182-ed3345ec769d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Koramangala',
    score: 91,
    rank: 2,
    resolutionSpeed: '2.5 days',
    mla: { name: 'R. Reddy', score: 90 },
    lifestyle: { greenery: 88, walkability: 95, safety: 89 },
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Jayanagar',
    score: 88,
    rank: 3,
    resolutionSpeed: '3.1 days',
    mla: { name: 'V. Prasad', score: 85 },
    lifestyle: { greenery: 96, walkability: 92, safety: 94 },
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400'
  }
];

const MOCK_WORST: Neighborhood[] = [
  {
    id: 'w1',
    name: 'Bellandur',
    score: 42,
    rank: 152,
    resolutionSpeed: '12.4 days',
    mla: { name: 'K. Venu', score: 35 },
    lifestyle: { greenery: 45, walkability: 38, safety: 55 },
    image: 'https://images.unsplash.com/photo-1610413346904-80720469b276?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'w2',
    name: 'Silk Board',
    score: 38,
    rank: 164,
    resolutionSpeed: '15.8 days',
    mla: { name: 'M. Reddy', score: 28 },
    lifestyle: { greenery: 30, walkability: 25, safety: 40 },
    image: 'https://images.unsplash.com/photo-1590059002624-9189b787593c?auto=format&fit=crop&q=80&w=400'
  }
];

export default function LiveabilityDashboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [view, setView] = useState<'prosperity' | 'distress'>('prosperity');
  const [filter, setFilter] = useState<'score' | 'speed'>('score');

  const data = view === 'prosperity' ? MOCK_BEST : MOCK_WORST;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%', opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[70] bg-[var(--color-brand-bg)] backdrop-blur-3xl overflow-y-auto pointer-events-auto flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[var(--color-brand-bg)]/80 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center justify-between z-10 pt-safe">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className={`font-bold text-xl uppercase tracking-widest transition-colors ${view === 'prosperity' ? 'text-[#00D1FF]' : 'text-[var(--color-danger-red)]'}`}>
              {view === 'prosperity' ? 'Valuable Spots' : 'Distressed Zones'}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">City Liveability Index • 2026 Edition</p>
          </div>
        </div>
      </div>

      <div className="p-6 pb-24">
        {/* Toggle View */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
          <button 
            onClick={() => setView('prosperity')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all ${view === 'prosperity' ? 'bg-white/10 text-[#00FF41] shadow-xl' : 'text-white/40'}`}
          >
            Prosperity best
          </button>
          <button 
            onClick={() => setView('distress')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all ${view === 'distress' ? 'bg-white/10 text-[var(--color-danger-red)] shadow-xl' : 'text-white/40'}`}
          >
            Distress worst
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setFilter('score')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'score' ? (view === 'prosperity' ? 'bg-[#00D1FF] text-black' : 'bg-[var(--color-danger-red)] text-white') : 'bg-white/5 text-white/60'}`}
          >
            {view === 'prosperity' ? 'Highest Ranking' : 'Critical Failure'}
          </button>
          <button 
            onClick={() => setFilter('speed')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'speed' ? (view === 'prosperity' ? 'bg-[#00D1FF] text-black' : 'bg-[var(--color-danger-red)] text-white') : 'bg-white/5 text-white/60'}`}
          >
             {view === 'prosperity' ? 'Fastest Resolution' : 'Lowest Velocity'}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((spot) => (
            <motion.div 
              key={spot.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white/5 border rounded-[2.5rem] overflow-hidden group shadow-2xl transition-colors ${view === 'prosperity' ? 'border-white/10' : 'border-[var(--color-danger-red)]/30'}`}
            >
              {/* Image Section */}
              <div className="h-48 relative overflow-hidden">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1.5 ${view === 'prosperity' ? 'bg-black/60 border-white/10' : 'bg-[var(--color-danger-red)]/20 border-[var(--color-danger-red)]/40'}`}>
                  <Star size={12} className={view === 'prosperity' ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[var(--color-danger-red)] fill-[var(--color-danger-red)]'} />
                  <span className="text-xs font-bold text-white tracking-widest">{spot.score}</span>
                </div>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-black text-white">{spot.name}</h3>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${view === 'prosperity' ? 'text-white/60' : 'text-[var(--color-danger-red)]/70'}`}>
                    <MapPin size={10} /> Ranked #{spot.rank} in City
                  </div>
                </div>
              </div>

              {/* Data Section */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                      <Zap size={12} className={view === 'prosperity' ? 'text-[#00FF41]' : 'text-[var(--color-danger-red)]'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Res. Speed</span>
                    </div>
                    <span className={`text-lg font-black ${view === 'prosperity' ? 'text-[#00FF41]' : 'text-[var(--color-danger-red)]'}`}>{spot.resolutionSpeed}</span>
                  </div>
                  <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                      <TrendingUp size={12} className="text-[#FFBF00]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">MLA Score</span>
                    </div>
                    <span className="text-lg font-black text-[#FFBF00]">{spot.mla.score}%</span>
                  </div>
                </div>

                {/* Lifestyle Bars */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[2px] text-white/30 border-b border-white/5 pb-2">Lifestyle Pillars</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Leaf size={10} className="text-[#00FF41]" /> Greenery</span>
                        <span className="text-white/40">{spot.lifestyle.greenery}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${spot.lifestyle.greenery}%` }} className={`h-full ${view === 'prosperity' ? 'bg-[#00FF41]' : 'bg-[var(--color-danger-red)]/40'}`} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Zap size={10} className="text-[#00D1FF]" /> Walkability</span>
                        <span className="text-white/40">{spot.lifestyle.walkability}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${spot.lifestyle.walkability}%` }} className={`h-full ${view === 'prosperity' ? 'bg-[#00D1FF]' : 'bg-[var(--color-danger-red)]/40'}`} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-[#FFBF00]" /> Safety</span>
                        <span className="text-white/40">{spot.lifestyle.safety}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${spot.lifestyle.safety}%` }} className={`h-full ${view === 'prosperity' ? 'bg-[#FFBF00]' : 'bg-[var(--color-danger-red)]/40'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-[10px] text-white/50">
                      MLA
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Responsible MLA</span>
                      <span className="block text-xs font-bold text-white">{spot.mla.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
