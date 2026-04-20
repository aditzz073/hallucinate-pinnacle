import React from 'react';
import { Info, Sparkles } from 'lucide-react';

export default function GuestBanner({ remainingUses, onSignUp }) {
  return (
    <div data-testid="guest-banner" className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">Guest Mode</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              {remainingUses} {remainingUses === 1 ? 'use' : 'uses'} remaining
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Results will not be saved. Create a free account to unlock unlimited tests, save history, and access advanced insights.
          </p>
          <button
            onClick={onSignUp}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
