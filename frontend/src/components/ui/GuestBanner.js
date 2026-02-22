import React from 'react';
import { Info, Sparkles } from 'lucide-react';

export default function GuestBanner({ remainingUses, onSignUp }) {
  return (
    <div className="mb-6 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">Guest Mode</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {remainingUses} {remainingUses === 1 ? 'use' : 'uses'} remaining
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Results will not be saved. Create a free account to unlock unlimited tests, save history, and access advanced insights.
          </p>
          <button
            onClick={onSignUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
