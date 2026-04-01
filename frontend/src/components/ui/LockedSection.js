import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

export default function LockedSection({ title, description, onUnlock, children, ctaLabel = "Sign in to continue" }) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden">
      {/* Blurred content */}
      <div className="blur-sm opacity-40 pointer-events-none select-none">
        {children || (
          <div className="space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-32 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        )}
      </div>

      {/* Unlock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-center px-6 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6">{description}</p>
          <button
            onClick={onUnlock}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
