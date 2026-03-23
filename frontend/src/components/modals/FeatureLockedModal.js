import React from 'react';
import { X, Lock, Sparkles } from 'lucide-react';

export default function FeatureLockedModal({ isOpen, onClose, onUpgrade, feature = 'Premium Feature' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 mb-6">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to access this feature</h2>
          <p className="text-gray-400 text-sm mb-2">This feature is available on paid plans.</p>
          <p className="text-xs mb-8" style={{ color: "#A5B4FC" }}>{feature}</p>

          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="btn-primary w-full py-3 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              See Premium Plan
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
