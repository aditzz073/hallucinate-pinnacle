import React from "react";
import Logo from "../components/ui/Logo";
import {
  Sparkles, ArrowRight, Zap, Shield,
  Search, Eye, FlaskConical, Crown,
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
    <div className="relative min-h-screen bg-[#050508] overflow-hidden" data-testid="landing-page">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/20 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-float-slow-reverse" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/8 rounded-full blur-[80px] animate-float-medium" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#050508]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl mb-10 animate-fade-in">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Powered by Advanced AI Analysis</span>
          </div>

          {/* Main headline with gradient */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8 animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Pinnacle</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">.ai</span>
          </h1>

          {/* Animated underline */}
          <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            The AI Engine Optimization platform that analyzes how your content performs in AI-generated answers. 
            <span className="text-white font-medium"> Understand. Optimize. Get discovered.</span>
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-gray-500">Deterministic</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">5+</p>
              <p className="text-xs text-gray-500">Analysis Dimensions</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Real-time</p>
              <p className="text-xs text-gray-500">Insights</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button
              data-testid="hero-get-started"
              onClick={onGetStarted}
              className="group relative rounded-full bg-white px-8 py-4 text-base font-semibold text-black overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            <button
              data-testid="hero-learn-more"
              onClick={onGetStarted}
              className="group rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              View Demo
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: '2s' }}>
            <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-scroll-down" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4" data-section="features" id="features">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#0a0a12] to-[#050508]" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">dominate</span> AI search
            </h2>
            <p className="text-gray-400 text-lg font-light max-w-xl mx-auto">
              A complete toolkit for understanding and optimizing your AI discoverability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              // Assign bright colors to each icon
              const iconColors = [
                "text-blue-400",      // AEO Audits
                "text-purple-400",    // Citation Testing
                "text-emerald-400",   // Page Monitoring
                "text-amber-400",     // Strategy Simulator
                "text-indigo-400",    // Advanced Explainability
                "text-pink-400",      // Enterprise Intelligence
              ];
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                  data-testid={`feature-card-${i}`}
                >
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} border border-white/5`}>
                    <Icon className={`h-6 w-6 ${iconColors[i]}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 px-4" data-section="pricing" id="pricing">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508] to-[#0a0a12]" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">transparent</span> pricing
            </h2>
            <p className="text-gray-400 text-lg font-light max-w-xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  5 audits/month
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  10 AI tests/month
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Basic analytics
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Pro Tier - Featured */}
            <div className="rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 p-8 backdrop-blur-sm relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-white">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">$49</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Unlimited audits
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Unlimited AI tests
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Page monitoring
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Strategy simulator
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Priority support
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-bold text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Competitor intel
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Executive reports
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Custom integrations
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-300"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 px-4 text-center">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl" />
        
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to reach the <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">pinnacle</span>?
          </h2>
          <p className="text-gray-400 text-lg font-light mb-10">
            Start analyzing your AI discoverability in seconds.
          </p>
          <button
            onClick={onGetStarted}
            className="group rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-4 text-base font-semibold text-white hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-300"
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
