import React from 'react';
import { X, Lock } from 'lucide-react';
import { PLAN_DISPLAY_NAMES, FEATURE_UPGRADE_MESSAGES, getMinimumPlanForFeature } from '../../utils/featureAccess';

export default function FeatureLockedModal({ isOpen, onClose, onUpgrade, feature = '', requiredPlan = '' }) {
  if (!isOpen) return null;

  const planName = requiredPlan
    ? (PLAN_DISPLAY_NAMES[requiredPlan] || requiredPlan)
    : getMinimumPlanForFeature(feature);
  const message = FEATURE_UPGRADE_MESSAGES[feature] || "Unlock this feature by upgrading your plan.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#000000] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Available in {planName}</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{message}</p>

          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: "var(--primary)", color: "black" }}
            >
              {planName === "Optimize" ? "Start Optimizing" : `Unlock ${planName}`}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
