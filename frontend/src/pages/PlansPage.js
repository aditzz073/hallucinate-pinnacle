import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import PricingSection from '../components/pricing/PricingSection';

export default function PlansPage({ onGetStarted, onNavigate }) {
  return (
    <div className="min-h-screen pt-4 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Empower Your AEO Strategy
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Choose the right plan for <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              your growth
            </span>
          </h1>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            From exploring the basics of Generative Engine Optimization to enterprise-scale AI visibility dominance, we have a plan that fits your ambition.
          </p>
        </div>

        <PricingSection onGetStarted={onGetStarted} />

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Instant Activation",
              desc: "Get access to premium features immediately after your payment is processed."
            },
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              desc: "We use Stripe for 100% secure, encrypted payment processing and billing management."
            },
            {
              icon: Sparkles,
              title: "Cancel Anytime",
              desc: "Flexible monthly billing. No long-term contracts, cancel your subscription at any time."
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
