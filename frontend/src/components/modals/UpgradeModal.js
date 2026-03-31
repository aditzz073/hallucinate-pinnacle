import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle, ArrowRight } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-lg overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)' }}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 mb-6">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Unlock Premium Insights</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              This feature is reserved for our Professional and Enterprise users. Upgrade now to get full access to deep AI visibility intelligence.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Detailed GEO optimization suggestions",
                "Advanced competitor gap analysis",
                "Priority AI engine processing",
                "Executive-level AEO reporting"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onUpgrade}
                className="flex-1 btn-primary py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 group"
              >
                Upgrade Plan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>

          <div className="bg-indigo-500/10 border-t border-white/5 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
              Join 500+ businesses optimizing for the next gen of search
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
