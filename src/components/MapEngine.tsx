import { useEffect, useRef, useCallback, memo, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import Map, { Marker } from 'react-map-gl/maplibre';
import { Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Issue } from '../types';

interface MapEngineProps {
  issues: Issue[];
  onMarkerTap: (issue: Issue) => void;
  activeIssueId?: string | null;
}

const MapEngine = memo(function MapEngine({ issues, onMarkerTap, activeIssueId }: MapEngineProps) {
  const mapRef = useRef<MapRef>(null);
  const [hasLocated, setHasLocated] = useState(false);

  // Request user geo-location on load to auto-zoom (triggered when map is ready)
  useEffect(() => {
    if (hasLocated || !mapRef.current) return;
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        setHasLocated(true);
        // Slightly delay the flyTo to ensure the map transition from splash is smooth
        setTimeout(() => {
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 12.5,
            pitch: 0,
            duration: 3500,
            essential: true
          });
        }, 800);
      }, (error) => {
        console.warn("Geolocation access denied or timed out:", error);
      }, { 
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0 
      });
    }
  }, [hasLocated, mapRef.current]);

  const onMapLoad = useCallback(() => {
    // Map instance is ready and style is loaded
  }, []);

  // Track previous issue to know when user hits "Back to Map"
  const prevIssueId = useRef(activeIssueId);

  useEffect(() => {
    // If transitioning from an active issue back to null (cleared selection)
    if (prevIssueId.current !== null && activeIssueId === null) {
      const currentCenter = mapRef.current?.getCenter();
      if (currentCenter) {
        mapRef.current?.flyTo({
          center: [currentCenter.lng, currentCenter.lat],
          zoom: 13, // City scale
          pitch: 0, // Flatten back to 2D
          bearing: 0,
          duration: 1200,
          essential: true
        });
      }
    }
    prevIssueId.current = activeIssueId;
  }, [activeIssueId]);

  const handleMarkerClick = useCallback((e: any, issue: Issue) => {
    e.originalEvent.stopPropagation();
    
    // Fly to marker so it centers cleanly into the viewport
    mapRef.current?.flyTo({
      center: [issue.longitude, issue.latitude],
      zoom: 16.5,
      pitch: 60,
      bearing: 45,
      duration: 1000,
      offset: [0, -150] // Offset to keep marker visible above the bottom sheet
    });
    
    onMarkerTap(issue);
  }, [onMarkerTap]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#111]">
      <AnimatePresence>
        {activeIssueId === null && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-20 left-4 z-10 bg-[#09090b]/95 backdrop-blur-xl border border-white/20 p-5 rounded-3xl w-60 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <Trophy size={14} className="text-[#FFD700]" />
              </div>
              <div>
                <span className="block text-white font-bold text-[10px] uppercase tracking-widest leading-tight">Top MLAs</span>
                <span className="block text-[#00FF41] font-semibold text-[8px] uppercase tracking-widest leading-tight">Resolution Ranking</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'R. Arshad', rep: 'Shivajinagar', score: 98 },
                { name: 'N.A. Haris', rep: 'Shanti Nagar', score: 94 },
                { name: 'H.C. Balakrishna', rep: 'Magadi', score: 89 }
              ].map((mla, idx) => (
                <div key={mla.name} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm ${
                    idx === 0 ? 'bg-[#FFD700] text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 
                    idx === 1 ? 'bg-white/80 text-black' : 
                    'bg-[#CD7F32] text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <span className="block text-white text-xs font-bold leading-tight">{mla.name}</span>
                    <span className="block text-white/60 text-[9px] uppercase tracking-wider font-semibold leading-tight">{mla.rep}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full border border-white/5">
                    <Star size={8} className="text-[#FFD700] fill-[#FFD700]" />
                    <span className="text-[10px] font-bold text-[#FFD700]">{mla.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 76.5,
          latitude: 14.5,
          zoom: 6,
          pitch: 0,
          bearing: 0
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        maxPitch={85}
        attributionControl={false}
        reuseMaps // Persists the map instance across re-renders/unmounts
        collectResourceTiming={false}
        maxTileCacheSize={150}
        fadeDuration={100}
        onLoad={onMapLoad}
      >
        {issues.map((issue) => {
          let coreColor = 'bg-white';
          
          switch(issue.severity) {
            case 'critical': 
              coreColor = 'bg-[var(--color-danger-red)]'; 
              break;
            case 'high': 
              coreColor = 'bg-[#FF8C00]'; 
              break;
            case 'medium': 
              coreColor = 'bg-[var(--color-neon-amber)]'; 
              break;
            case 'low': 
              coreColor = 'bg-[#00FF41]'; 
              break;
            default:
              coreColor = 'bg-white';
          }

          const isActive = activeIssueId === issue.id;

          return (
            <Marker
              key={issue.id}
              longitude={issue.longitude}
              latitude={issue.latitude}
              anchor="center"
              onClick={(e) => handleMarkerClick(e, issue)}
            >
              <div className="relative flex items-center justify-center p-3 cursor-pointer group">
                <div 
                  className={`
                    w-4 h-4 rounded-full border-2 border-[var(--color-brand-bg)] 
                    ${coreColor}
                    transition-transform duration-300
                    ${issue.severity === 'critical' ? 'critical-pulse' : ''}
                    ${issue.severity === 'high' ? 'high-pulse' : ''}
                    ${isActive ? 'scale-[2.5] z-50' : 'scale-100 group-hover:scale-[1.5]'}
                  `} 
                />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
});

export default MapEngine;
