import React from 'react';
import { X, Lock, Sparkles } from 'lucide-react';

export default function FeatureLockedModal({ isOpen, onClose, onSignIn, feature = 'Dashboard' }) {
  if (!isOpen) return null;

  const messages = {
    Dashboard: {
      title: 'Sign in to access your Dashboard',
      description: 'View your saved insights, analytics, and AI visibility metrics in one place.',
    },
    'Monitor Pages': {
      title: 'Sign in to Monitor Pages',
      description: 'Track and monitor your pages performance over time with automated alerts.',
    },
    'Reports': {
      title: 'Sign in to access Reports',
      description: 'Generate comprehensive reports with historical data and trend analysis.',
    },
    'Advanced Audit': {
      title: 'Sign in to access Advanced Audit',
      description: 'Get deeper insights with advanced scoring algorithms and detailed recommendations.',
    },
    'Strategy Simulator': {
      title: 'Enterprise Feature',
      description: 'Simulate content optimizations and see projected impact on citation probability.',
    },
    'Competitor Intel': {
      title: 'Enterprise Feature',
      description: 'Compare your AI visibility against competitors and identify strategic gaps.',
    },
    'Executive Summary': {
      title: 'Enterprise Feature',
      description: 'Generate executive-ready reports and data-driven decision summaries.',
    },
    'Profile': {
      title: 'Sign in to access your Profile',
      description: 'Manage your account settings, preferences, and subscription details.',
    },
  };

  const { title, description } = messages[feature] || messages.Dashboard;

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm mb-8">{description}</p>

          <div className="space-y-3">
            <button
              onClick={onSignIn}
              className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Sign In to Access
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full border border-white/20 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
