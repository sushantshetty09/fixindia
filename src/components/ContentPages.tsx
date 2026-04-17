import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, ShieldCheck, HeartHandshake, Bug } from 'lucide-react';
import type { PageType } from './NavigationMenu';

interface ContentPagesProps {
  pageType: PageType;
  onClose: () => void;
}

export default function ContentPages({ pageType, onClose }: ContentPagesProps) {
  if (!pageType) return null;

  const renderContent = () => {
    switch (pageType) {
      case 'privacy':
        return (
          <div className="space-y-6 text-white/70 text-sm leading-relaxed pb-20">
            <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 p-6 rounded-3xl flex flex-col items-center mb-8">
              <ShieldCheck size={48} className="text-[#FF9933] mb-4" />
              <h2 className="text-[#FF9933] font-bold text-xl uppercase tracking-widest text-center">Data Integrity</h2>
              <p className="text-center mt-2 text-[#FF9933]/70">Your citizen reports are fully encrypted and securely passed to regional nodes.</p>
            </div>
            <h3 className="text-white font-bold text-lg">1. Information Collection</h3>
            <p>FixIndia.org collects minimal geographic telemetry, user-submitted media (photos), and metadata associated with civic infrastructure reports. We do not stealth-track your location unless actively uploading a report.</p>
            <h3 className="text-white font-bold text-lg mt-6">2. Third-Party Sharing</h3>
            <p>Your data is anonymously aggregated and syndicated directly to government portals (like BBMP, BWSSB) and local media pipelines. Your associated Google Identity is stripped from public APIs to protect whistleblower identities.</p>
            <h3 className="text-white font-bold text-lg mt-6">3. Cookie Policy</h3>
            <p>FixIndia.org runs on local-state caching. We do not use advertising or tracking cookies. All session data resides in your local browser sandbox.</p>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-6 text-white/70 text-sm leading-relaxed pb-20">
            <h3 className="text-white font-bold text-lg">1. Civic Code of Conduct</h3>
            <p>By utilizing the FixIndia.org engine, you swear to report only verified, truthful infrastructure hazards. Manipulating locations, uploading irrelevant images, or maliciously inflating upvotes will result in an immediate permanent ban on your device signature.</p>
            <h3 className="text-white font-bold text-lg mt-6">2. Liability</h3>
            <p>FixIndia.org provides a public ledger of regional issues. We hold NO liability for the physical repair of state infrastructure—we merely construct the transparent bridge between citizen and state.</p>
            <h3 className="text-white font-bold text-lg mt-6">3. Content Ownership</h3>
            <p>Images uploaded to FixIndia.org enter the public domain. Once you upload an image of a pothole or fractured pipeline, you waive exclusive copyright, allowing journalists and agencies to utilize the media freely to force accountability.</p>
          </div>
        );
      case 'donate':
        return (
          <div className="space-y-6 pb-20">
            <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 p-6 rounded-3xl flex flex-col items-center mb-8">
              <HeartHandshake size={48} className="text-[#FF9933] mb-4" />
              <h2 className="text-[#FF9933] font-bold text-xl uppercase tracking-widest text-center">Keep the Voice Loud</h2>
              <p className="text-center mt-2 text-[#FF9933]/70">FixIndia.org relies heavily on high-bandwidth Mapbox and AWS endpoints. We do not show ads. Support the rebellion.</p>
            </div>
            
            <div className="grid gap-4 mt-6">
              <button className="w-full bg-[#FF9933]/10 border border-[#FF9933]/30 p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-[#FF9933]/20 transition-colors">
                <span className="font-bold text-xl text-[#FF9933]">Donate ₹100</span>
                <span className="text-[10px] text-[#FF9933]/60 uppercase tracking-widest mt-1">Strengthen the Platform</span>
              </button>
              <button className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-[#FFD700]/20 transition-colors">
                <span className="font-bold text-xl text-[#FFD700]">Donate ₹500</span>
                <span className="text-[10px] text-[#FFD700]/60 uppercase tracking-widest mt-1">Pays for Map Bandwidth</span>
              </button>
              <button className="w-full bg-[var(--color-danger-red)]/10 border border-[var(--color-danger-red)]/30 p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-[var(--color-danger-red)]/20 transition-colors">
                <span className="font-bold text-xl text-[var(--color-danger-red)]">UPI / Custom Amount</span>
                <span className="text-[10px] text-[var(--color-danger-red)]/60 uppercase tracking-widest mt-1">Scan QR Code</span>
              </button>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6 pb-20">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center mb-8">
              <Bug size={48} className="text-white/40 mb-4" />
              <h2 className="text-white font-bold text-xl uppercase tracking-widest text-center">System Anomalies</h2>
              <p className="text-center mt-2 text-white/50">Found a glitch in the Matrix? Let the engineering core know.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/50 ml-2 font-bold">Severity</label>
                <select className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#00D1FF]/50 transition-colors">
                  <option>Visual Glitch (UI/UX)</option>
                  <option>Map Failing to Load</option>
                  <option>Bug During Reporting</option>
                  <option>Critical System Failure</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/50 ml-2 font-bold">Description</label>
                <textarea 
                  rows={5}
                  placeholder="Explain exactly what happened..."
                  className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#00D1FF]/50 transition-colors resize-none"
                />
              </div>

              <button className="w-full mt-4 bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/80 transition-colors">
                <Send size={18} />
                Deploy Bug Report
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const titles = {
    privacy: 'Privacy Protocol',
    terms: 'Terms of Service',
    donate: 'Platform Support',
    help: 'Report Bug',
    verify: 'Verify Local Issues',
    liveability: 'City Liveability Index'
  };

  return (
    <AnimatePresence>
      {pageType && (
        <motion.div
          initial={{ x: '100%', opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-[var(--color-brand-bg)] backdrop-blur-3xl overflow-y-auto pointer-events-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--color-brand-bg)]/80 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center gap-4 z-10 pt-safe">
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-bold text-xl uppercase tracking-widest">{titles[pageType]}</h1>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
