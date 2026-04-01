import React from "react";
import { X } from "lucide-react";

export default function UpgradeModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close upgrade modal"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Unlock this feature</h2>
          <p className="text-gray-400 text-sm mb-8">This feature is available on Pinnacle Pro.</p>

          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="btn-primary w-full py-3 rounded-lg text-sm font-bold"
            >
              Upgrade Plan -&gt;
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
