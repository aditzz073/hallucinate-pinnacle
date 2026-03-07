import React from "react";
import {
  ArrowRight, Zap, Shield, Search, Eye, FlaskConical, Crown,
  TrendingUp, CheckCircle, BarChart2, Cpu, Mail, Phone, MessageSquare,
} from "lucide-react";

const BENTO_FEATURES = [
  {
    icon: Zap,
    title: "AEO Page Audits",
    desc: "Deterministic scoring across 5 dimensions: authority, structure, content, technical, and freshness.",
    size: "large", // spans 2 cols
    accent: "#4F46E5",
  },
  {
    icon: Search,
    title: "Citation Testing",
    desc: "Probability scoring + gap analysis for any query.",
    size: "small",
    accent: "#7C3AED",
  },
  {
    icon: Eye,
    title: "Page Monitoring",
    desc: "Append-only snapshots with deterministic impact classification.",
    size: "small",
    accent: "#4F46E5",
  },
  {
    icon: FlaskConical,
    title: "Strategy Simulator",
    desc: "Simulate optimizations and see projected citation lift before you ship.",
    size: "small",
    accent: "#7C3AED",
  },
  {
    icon: Shield,
    title: "Advanced Explainability",
    desc: "Per-category contributing factors, penalties, and historical intelligence.",
    size: "small",
    accent: "#6366F1",
  },
  {
    icon: Crown,
    title: "Enterprise Intelligence",
    desc: "Competitor comparison and executive summaries for data-driven decisions.",
    size: "large",
    accent: "#8B5CF6",
  },
];

// Mini dashboard product mockup for hero right column
function HeroMockup() {
  const bars = [62, 78, 55, 88, 71, 94, 83];
  return (
    <div
      className="relative w-full max-w-[480px] rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,70,229,0.15)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
      >
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-3 text-xs font-mono" style={{ color: "var(--muted)" }}>pinnacle.ai / dashboard</span>
      </div>

      {/* Top scorecard row */}
      <div className="grid grid-cols-3 gap-px p-4" style={{ gap: "12px" }}>
        {[
          { label: "AEO Score", value: "87", unit: "/100", color: "#4F46E5" },
          { label: "Citation Prob.", value: "74", unit: "%", color: "#7C3AED" },
          { label: "Pages Tracked", value: "12", unit: "", color: "#0891B2" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-3"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</p>
            <p className="text-2xl font-bold" style={{ color: m.color }}>
              {m.value}<span className="text-sm font-normal" style={{ color: "var(--muted)" }}>{m.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-4 pb-4">
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Citation Probability (7d)</p>
            <span className="text-xs font-semibold" style={{ color: "#4F46E5" }}>+12%</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${h}%`,
                  background: i === bars.length - 1
                    ? "linear-gradient(to top, #4F46E5, #7C3AED)"
                    : "rgba(79,70,229,0.3)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Audit row */}
      <div className="px-4 pb-4 space-y-2">
        {[
          { url: "blog/ai-seo-guide", score: 94, status: "Excellent" },
          { url: "docs/getting-started", score: 71, status: "Good" },
          { url: "pricing", score: 48, status: "Needs Work" },
        ].map((row) => (
          <div
            key={row.url}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>/{row.url}</span>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: row.score >= 80 ? "rgba(5,150,105,0.15)" : row.score >= 60 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)",
                  color: row.score >= 80 ? "#10B981" : row.score >= 60 ? "#F59E0B" : "#EF4444",
                }}
              >
                {row.status}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{row.score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Indigo glow at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(79,70,229,0.08), transparent)" }}
      />
    </div>
  );
}

export default function LandingPage({ onGetStarted, onNavigate }) {
  return (
    <div className="relative overflow-hidden" style={{ background: "var(--bg)" }} data-testid="landing-page">

      {/* ── HERO — two-column layout ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
          }}
        />
        {/* Indigo glow left */}
        <div
          className="absolute top-1/3 left-1/4 w-[600px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(79,70,229,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Indigo glow right — behind mockup */}
        <div
          className="absolute top-1/4 right-0 w-[480px] h-[480px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(124,58,237,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-[1120px] mx-auto px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-medium"
                style={{
                  background: "rgba(79,70,229,0.12)",
                  border: "1px solid rgba(79,70,229,0.3)",
                  color: "#A5B4FC",
                }}
              >
                <Cpu className="w-3.5 h-3.5" />
                AI Engine Optimization platform
              </div>

              {/* Headline */}
              <h1
                className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.0] mb-6"
                style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
              >
                Get discovered<br />
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">by AI</span> engines.
              </h1>

              <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
                Pinnacle analyzes how your content performs in AI-generated answers.
                Understand your signals, fix your gaps, and get cited.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 mb-10">
                {[
                  { label: "Deterministic scoring", icon: CheckCircle },
                  { label: "5 signal dimensions", icon: BarChart2 },
                  { label: "Real-time tracking", icon: TrendingUp },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <button
                  data-testid="hero-get-started"
                  onClick={onGetStarted}
                  className="btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  data-testid="hero-learn-more"
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  View demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Product mockup */}
            <div className="flex justify-end">
              <div style={{ transform: "perspective(1200px) rotateY(-4deg) rotateX(2deg)", filter: "drop-shadow(0 40px 80px rgba(79,70,229,0.25))" }}>
                <HeroMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ───────────────────────────────────────────────── */}
      <section className="py-24 px-8" data-section="features">
        <div className="max-w-[1120px] mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4F46E5" }}>
              Platform
            </p>
            <h2
              className="font-display text-4xl lg:text-5xl font-bold leading-tight"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              Everything your content needs<br />to rank in AI answers.
            </h2>
          </div>

          <div className="bento-grid">
            {BENTO_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={f.size === "large" ? "bento-large" : "bento-small"}
                  data-testid={`feature-card-${i}`}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "28px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.accent}40`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5"
                    style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.accent }} />
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-8" data-section="pricing" id="pricing">
        <div className="max-w-[1120px] mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4F46E5" }}>
              Pricing
            </p>
            <h2
              className="font-display text-4xl lg:text-5xl font-bold"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              Simple, transparent pricing.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter */}
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Starter</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For individuals exploring AEO.</p>
              <div className="mb-4">
                <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>$0</span>
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {["5 audits/month", "10 AI tests/month", "Basic analytics"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#4F46E5" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full rounded-lg py-2.5 text-sm font-medium transition-colors"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                Get started
              </button>
            </div>

            {/* Pro — featured */}
            <div
              className="rounded-2xl p-6 relative"
              style={{
                background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.08) 100%)",
                border: "1px solid rgba(79,70,229,0.4)",
              }}
            >
              <div
                className="absolute -top-3 left-6 px-3 py-1 rounded-full text-2xs font-bold tracking-wide"
                style={{ background: "#4F46E5", color: "#fff", fontSize: "10px" }}
              >
                MOST POPULAR
              </div>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Professional</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For teams serious about AEO.</p>
              <div className="mb-4">
                <span className="text-4xl font-bold" style={{ color: "#818CF8" }}>$100</span>
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {["Unlimited audits", "Unlimited AI tests", "Page monitoring", "Strategy simulator", "Priority support"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#818CF8" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold">
                Start free trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Enterprise</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For large-scale operations.</p>
              <div className="mb-4">
                <span className="text-2xl font-semibold" style={{ color: "var(--text-muted)" }}>Custom pricing</span>
              </div>
              <ul className="space-y-2 mb-5">
                {["Everything in Pro", "Competitor intel", "Executive reports", "Dedicated support", "Custom integrations"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#4F46E5" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Get in touch</p>
                <a
                  href="mailto:sales@pinnacle.ai"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(79,70,229,0.12)" }}>
                    <Mail className="w-3 h-3" style={{ color: "#818CF8" }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>sales@pinnacle.ai</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>Email our sales team</div>
                  </div>
                </a>
                <a
                  href="tel:+18005550199"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(79,70,229,0.12)" }}>
                    <Phone className="w-3 h-3" style={{ color: "#818CF8" }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>+1 (800) 555-0199</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>Mon–Fri, 9am–6pm EST</div>
                  </div>
                </a>
                <a
                  href="https://calendly.com/pinnacle-sales"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(79,70,229,0.12)" }}>
                    <MessageSquare className="w-3 h-3" style={{ color: "#818CF8" }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Book a demo</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>Schedule a 30-min call</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-[600px] mx-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "56px 48px", boxShadow: "0 0 80px rgba(79,70,229,0.08)" }}>
          <h2
            className="font-display text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Reach the pinnacle<br />of AI discoverability.
          </h2>
          <p className="text-base mb-8" style={{ color: "var(--muted)" }}>
            Start analyzing your AI discoverability in seconds. Free forever.
          </p>
          <button
            onClick={onGetStarted}
            className="btn-primary inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold"
          >
            Start optimizing
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[1120px] mx-auto px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-black tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Pinnacle</span>
                  <span style={{ color: "#818CF8" }} className="font-light">.ai</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                AI discoverability optimization for the next generation of search.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "AEO Audits", section: "features" },
                  { label: "AI Testing", section: "features" },
                  { label: "Monitoring", section: "features" },
                  { label: "Pricing", section: "pricing" },
                ].map(({ label, section }) => (
                  <li key={label}>
                    <button
                      onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: "About", page: "about" },
                  { label: "Blog", page: "blog" },
                  { label: "Careers", page: "careers" },
                  { label: "Press", page: "press" },
                ].map(({ label, page }) => (
                  <li key={label}>
                    <button
                      onClick={() => onNavigate?.(page)}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal + Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Legal</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  { label: "Privacy Policy", page: "privacy" },
                  { label: "Terms of Service", page: "terms" },
                  { label: "Cookie Policy", page: "cookies" },
                ].map(({ label, page }) => (
                  <li key={label}>
                    <button
                      onClick={() => onNavigate?.(page)}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Contact</p>
              <ul className="space-y-2.5">
                <li><a href="mailto:sales@pinnacle.ai" className="text-sm" style={{ color: "var(--text-muted)" }}>sales@pinnacle.ai</a></li>
                <li><a href="mailto:support@pinnacle.ai" className="text-sm" style={{ color: "var(--text-muted)" }}>support@pinnacle.ai</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              &copy; {new Date().getFullYear()} Pinnacle.ai. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: "Twitter / X", href: "https://twitter.com/pinnacleai" },
                { label: "LinkedIn", href: "https://linkedin.com/company/pinnacleai" },
                { label: "GitHub", href: "https://github.com/pinnacleai" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
