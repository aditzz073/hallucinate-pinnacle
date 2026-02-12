import React from "react";
import Blobs from "../components/ui/Blobs";
import Logo from "../components/ui/Logo";
import {
  Sparkles, ArrowRight, Zap, Shield, Activity,
  Search, Eye, BarChart3, FlaskConical, Crown,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "AEO Page Audits",
    desc: "Deep analysis of any URL for AI Engine Optimization signals with deterministic scoring across 5 dimensions.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Search,
    title: "Citation Testing",
    desc: "Test how likely AI engines are to cite your page for specific queries with probability scoring and gap analysis.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Eye,
    title: "Page Monitoring",
    desc: "Track page signal changes over time with append-only snapshots and deterministic impact classification.",
    gradient: "from-teal-500/20 to-green-500/20",
  },
  {
    icon: FlaskConical,
    title: "Strategy Simulator",
    desc: "Simulate content optimizations and see projected impact on citation probability before making changes.",
    gradient: "from-orange-500/20 to-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Advanced Explainability",
    desc: "Per-category contributing factors, penalties, evidence, and historical intelligence for every audit.",
    gradient: "from-indigo-500/20 to-blue-500/20",
  },
  {
    icon: Crown,
    title: "Enterprise Intelligence",
    desc: "Competitor comparison, sensitivity toggles, and executive summaries for data-driven decisions.",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
];

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden" data-testid="landing-page">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <Blobs variant="hero" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="anim-hidden animate-fade-in-up-delay-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl mb-8"
            data-testid="hero-badge"
          >
            <Sparkles className="h-4 w-4 text-brand-blue" />
            <span className="text-sm font-medium text-gray-300">Powered by Advanced AI Analysis</span>
          </div>

          {/* Headline */}
          <h1
            className="anim-hidden animate-fade-in-up-delay-2 gradient-text text-6xl md:text-7xl lg:text-8xl font-thin leading-[1.05] mb-6"
            data-testid="hero-title"
          >
            Pinnacle.ai
          </h1>

          {/* Subtitle */}
          <p
            className="anim-hidden animate-fade-in-up-delay-3 text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed"
            data-testid="hero-subtitle"
          >
            The AI Engine Optimization platform that analyzes how your content performs in AI-generated answers.
            Understand. Optimize. Get discovered.
          </p>

          {/* CTAs */}
          <div className="anim-hidden animate-fade-in-up-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              data-testid="hero-get-started"
              onClick={onGetStarted}
              className="group rounded-full bg-white px-8 py-4 text-base font-medium text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            <button
              data-testid="hero-learn-more"
              onClick={onGetStarted}
              className="group rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-xl hover:scale-105 hover:bg-white/10 transition-all duration-300"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-content mx-auto">
          <div className="text-center mb-16">
            <h2 className="gradient-text text-4xl md:text-5xl font-thin mb-4">
              Everything you need to dominate AI search
            </h2>
            <p className="text-gray-400 text-lg font-light max-w-xl mx-auto">
              A complete toolkit for understanding and optimizing your AI discoverability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="feature-card rounded-3xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-xl"
                  data-testid={`feature-card-${i}`}
                  style={{ animationDelay: `${1 + i * 0.15}s` }}
                >
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient}`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="gradient-text text-4xl md:text-5xl font-thin mb-6">
            Ready to reach the pinnacle?
          </h2>
          <p className="text-gray-400 text-lg font-light mb-10">
            Start analyzing your AI discoverability in seconds.
          </p>
          <button
            onClick={onGetStarted}
            className="group rounded-full bg-gradient-to-r from-brand-blue to-brand-teal px-10 py-4 text-base font-medium text-white hover:scale-105 btn-glow transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              Start Optimizing
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
