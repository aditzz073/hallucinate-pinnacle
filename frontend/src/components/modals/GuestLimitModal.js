import React from 'react';
import { X, TrendingUp, Zap, LineChart, FileText } from 'lucide-react';

export default function GuestLimitModal({ isOpen, onClose, onSignUp, feature = 'audits' }) {
  if (!isOpen) return null;

  const features = [
    { icon: Zap, text: 'Unlimited audits & AI tests' },
    { icon: LineChart, text: 'Save and track all results' },
    { icon: TrendingUp, text: 'Access strategy simulator' },
    { icon: FileText, text: 'Export PDF reports' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 mb-6">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-white mb-2">
            You've reached your guest limit
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Create a free account to unlock unlimited {feature} and access advanced AI visibility insights.
          </p>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-gray-300">{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={onSignUp}
              className="btn-primary w-full py-3 rounded-lg text-sm font-bold"
            >
              Create Free Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
