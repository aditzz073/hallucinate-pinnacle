import React, { useState } from 'react';
import { Crown } from 'lucide-react';

export default function FoundingAccessBadge() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
        <Crown className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">
          FOUNDING ACCESS
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 shadow-2xl">
            <p className="text-xs text-gray-300">Full system access enabled</p>
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-l border-t border-white/20 rotate-45" />
        </div>
      )}
    </div>
  );
}
