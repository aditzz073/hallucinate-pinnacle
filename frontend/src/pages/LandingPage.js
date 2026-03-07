import React from "react";
import {
  ArrowRight, Zap, Shield, Search, Eye, FlaskConical, Crown,
  TrendingUp, CheckCircle, BarChart2, Cpu,
} from "lucide-react";

const BENTO_FEATURES = [
  {
    icon: Zap,
    title: "AEO Page Audits",
    desc: "Deterministic scoring across 5 dimensions — authority, structure, content, technical, and freshness.",
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
    accent: "#0891B2",
  },
  {
    icon: FlaskConical,
    title: "Strategy Simulator",
    desc: "Simulate optimizations and see projected citation lift before you ship.",
    size: "small",
    accent: "#D97706",
  },
  {
    icon: Shield,
    title: "Advanced Explainability",
    desc: "Per-category contributing factors, penalties, and historical intelligence.",
    size: "small",
    accent: "#059669",
  },
  {
    icon: Crown,
    title: "Enterprise Intelligence",
    desc: "Competitor comparison and executive summaries for data-driven decisions.",
    size: "large",
    accent: "#DB2777",
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

export default function LandingPage({ onGetStarted }) {
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
        {/* Indigo glow */}
        <div
          className="absolute top-1/3 left-1/4 w-[600px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(79,70,229,0.12) 0%, transparent 70%)",
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
                <span style={{ color: "#4F46E5" }}>by AI</span> engines.
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
                    <Icon className="w-3.5 h-3.5" style={{ color: "#4F46E5" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</span>
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
                </button>
              </div>
            </div>

            {/* Right: Product mockup */}
            <div className="flex justify-end">
              <HeroMockup />
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
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${f.accent}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
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
      <section className="py-24 px-8" data-section="pricing" id="pricing">
        <div className="max-w-[1120px] mx-auto">
          <div className="mb-14">
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
            <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Starter</h3>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>For individuals exploring AEO.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>$0</span>
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {["5 audits/month", "10 AI tests/month", "Basic analytics"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4F46E5" }} />
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
              className="rounded-2xl p-8 relative"
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
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Professional</h3>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>For teams serious about AEO.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: "#818CF8" }}>$49</span>
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {["Unlimited audits", "Unlimited AI tests", "Page monitoring", "Strategy simulator", "Priority support"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#818CF8" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold">
                Start free trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Enterprise</h3>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>For large-scale operations.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>Custom</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {["Everything in Pro", "Competitor intel", "Executive reports", "Dedicated support", "Custom integrations"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4F46E5" }} />
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
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-8 text-center">
        <div className="max-w-[640px] mx-auto">
          <h2
            className="font-display text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Reach the pinnacle<br />of AI discoverability.
          </h2>
          <p className="text-base mb-10" style={{ color: "var(--muted)" }}>
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
    </div>
  );
}
