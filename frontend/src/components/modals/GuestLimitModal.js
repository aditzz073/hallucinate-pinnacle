import React from 'react';
import { X, TrendingUp, Zap, LineChart, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GuestLimitModal({ isOpen, onClose, feature = 'audits' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;



  const benefits = [
    { icon: Zap,       text: '5 audits per month — no credit card required' },
    { icon: LineChart, text: 'Full recommendations and AI insights' },
    { icon: TrendingUp, text: 'Save and track all your audit history' },
    { icon: FileText,  text: 'Access advanced AI visibility scoring' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D0D1F] backdrop-blur-xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 mb-6">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>

          {/* Heading — exact spec copy */}
          <h2 className="text-2xl font-bold text-white mb-2">
            You've used your free previews
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Create a free account to get 5 audits per month, full recommendations, and audit
            history — no credit card required.
          </p>

          {/* Benefits list */}
          <div className="space-y-3 mb-8">
            {benefits.map((item, i) => {
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
              onClick={() => { onClose(); navigate('/register'); }}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => { onClose(); navigate('/pricing'); }}
              className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
