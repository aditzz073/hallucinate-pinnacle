import React, { useState } from "react";
import {
  ArrowRight, ArrowDown, Eye, Settings2,
  TrendingUp, CheckCircle, BarChart2, Cpu, Mail, Phone, MessageSquare,
  Microscope,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import StrategySimulatorSection from "../components/landing/StrategySimulatorSection";
import ENGINE_LOGOS from "../utils/engineLogos";
import IconContainer from "../components/ui/IconContainer";

const VISIBILITY_TREND_SERIES = [
  { key: "citation",      label: "Citation Probability", color: "#8B5CF6" },
  { key: "readiness",     label: "Generative Readiness", color: "#3B82F6" },
  { key: "summarization", label: "Summarization",        color: "#34D399" },
  { key: "brand",         label: "Brand Retention",      color: "#F59E0B" },
  { key: "schema",        label: "Schema Support",       color: "#EF4444" },
];

const VISIBILITY_TREND_DATA = [
  { day: "Apr 12", citation: 64, readiness: 84, summarization: 42, brand: 48, schema: 32 },
  { day: "Apr 13", citation: 66, readiness: 59, summarization: 27, brand: 50, schema: 44 },
  { day: "Apr 14", citation: 57, readiness: 37, summarization: 23, brand: 15, schema: 9  },
  { day: "Apr 15", citation: 62, readiness: 17, summarization: 46, brand: 24, schema: 18 },
  { day: "Apr 16", citation: 65, readiness: 15, summarization: 74, brand: 62, schema: 56 },
  { day: "Apr 17", citation: 88, readiness: 71, summarization: 53, brand: 58, schema: 52 },
  { day: "Apr 18", citation: 68, readiness: 60, summarization: 78, brand: 40, schema: 34 },
];

function VisibilityTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const pointByKey = new Map(payload.map((item) => [item.dataKey, item.value]));

  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        background: "rgba(12,12,38,0.96)",
        border: "1px solid rgba(99,102,241,0.35)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-[11px] font-semibold mb-2" style={{ color: "#c7d2fe" }}>{label}</p>
      <div className="space-y-1">
        {VISIBILITY_TREND_SERIES.map((series) => (
          <div key={series.key} className="flex items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: series.color }} />
              <span style={{ color: "#a5b4fc" }}>{series.label}</span>
            </div>
            <span className="font-semibold" style={{ color: "#f8fafc" }}>
              {pointByKey.get(series.key)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard mockup shared by Hero + Showcase ────────────────────────────────
function DashboardMockup() {
  const firstCitation = VISIBILITY_TREND_DATA[0]?.citation || 0;
  const lastCitation = VISIBILITY_TREND_DATA[VISIBILITY_TREND_DATA.length - 1]?.citation || 0;
  const citationDelta = lastCitation - firstCitation;
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
        <span className="ml-3 text-xs font-mono" style={{ color: "var(--muted)" }}>
          pinnacle.ai / dashboard
        </span>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 p-4" style={{ gap: "12px" }}>
        {[
          { label: "AI Visibility",   value: "81", unit: "/100", color: "#4F46E5" },
          { label: "Citation Prob.",  value: "74", unit: "%",    color: "#7C3AED" },
          { label: "Eng. Readiness",  value: "68", unit: "%",    color: "#0891B2" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-3"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</p>
            <p className="text-2xl font-bold" style={{ color: m.color }}>
              {m.value}
              <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>{m.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="px-4 pb-3">
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>AI Visibility Trend (7d)</p>
            <span
              className="text-xs font-semibold"
              style={{ color: citationDelta >= 0 ? "#34d399" : "#f87171" }}
            >
              {citationDelta >= 0 ? "+" : ""}{citationDelta}%
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
            {VISIBILITY_TREND_SERIES.map((series) => (
              <span key={series.key} className="text-[10px] flex items-center gap-1" style={{ color: "var(--muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: series.color }} />
                {series.label}
              </span>
            ))}
          </div>

          <div className="h-44 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VISIBILITY_TREND_DATA} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  content={<VisibilityTrendTooltip />}
                  cursor={{ stroke: "rgba(129,140,248,0.35)", strokeWidth: 1 }}
                />
                {VISIBILITY_TREND_SERIES.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={2.2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "#0b1026", strokeWidth: 2, fill: series.color }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Engine readiness bars */}
      <div className="px-4 pb-4 space-y-1.5">
        {[
          { engine: "ChatGPT",    score: 82, color: "#34d399", logo: ENGINE_LOGOS.chatgpt    },
          { engine: "Perplexity", score: 71, color: "#22d3ee", logo: ENGINE_LOGOS.perplexity },
          { engine: "Google SGE", score: 68, color: "#818cf8", logo: ENGINE_LOGOS.google_sge },
          { engine: "Copilot",    score: 55, color: "#a78bfa", logo: ENGINE_LOGOS.copilot    },
        ].map((row) => (
          <div
            key={row.engine}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-1.5 w-20 shrink-0">
              <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm shrink-0">
                <img src={row.logo} alt={row.engine} className="w-3 h-3 object-contain" />
              </div>
              <span className="text-[11px] font-medium truncate" style={{ color: "var(--muted)" }}>{row.engine}</span>
            </div>
            <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${row.score}%`, background: row.color }}
              />
            </div>
            <span className="text-[11px] font-bold w-7 text-right" style={{ color: row.color }}>
              {row.score}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(79,70,229,0.08), transparent)" }}
      />
    </div>
  );
}

// ── 1. Hero Section ───────────────────────────────────────────────────────────
function HeroSection({ onGetStarted, onNavigate }) {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-8 md:pt-12">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-[600px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(79,70,229,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/4 right-0 w-[480px] h-[480px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-[1120px] mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-medium"
              style={{
                background: "rgba(79,70,229,0.12)",
                border: "1px solid rgba(79,70,229,0.3)",
                color: "#A5B4FC",
              }}
            >
              <Cpu className="w-3.5 h-3.5" />
              AI Visibility Platform
            </div>

            <h1
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6"
              style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
            >
              Control How AI<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Talks About
              </span>{" "}
              Your Brand
            </h1>

            <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
              Analyze, predict, and optimize how ChatGPT, Gemini, Perplexity, and Copilot recognize your content.
            </p>

            <div className="flex items-center flex-wrap gap-3 mb-10">
              <button
                data-testid="hero-get-started"
                onClick={() => onNavigate("audits")}
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
              >
                Run AI Visibility Audit
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
                Book Demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-6">
              {[
                { label: "Deterministic scoring", icon: CheckCircle },
                { label: "6+ AI engines",           icon: BarChart2 },
                { label: "Real-time tracking",      icon: TrendingUp },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div className="flex justify-end">
            <div style={{
              transform: "perspective(1200px) rotateY(-4deg) rotateX(2deg)",
              filter: "drop-shadow(0 40px 80px rgba(79,70,229,0.25))",
            }}>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 2. AI Engine Grid ─────────────────────────────────────────────────────────
const AI_ENGINES = [
  { id: "chatgpt",    name: "ChatGPT",    color: "#34d399" },
  { id: "gemini",     name: "Gemini",     color: "#f59e0b" },
  { id: "perplexity", name: "Perplexity", color: "#22d3ee" },
  { id: "copilot",    name: "Copilot",    color: "#818cf8" },
  { id: "claude",     name: "Claude",     color: "#fb923c" },
  { id: "grok",       name: "Grok",       color: "#a78bfa" },
];

function AIEngineGrid() {
  return (
    <section className="py-20 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4F46E5" }}>
            Coverage
          </p>
          <h2
            className="font-display text-3xl lg:text-4xl font-bold mb-4"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Where Your Brand Appears in AI
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            Pinnacle analyzes your visibility across every major AI engine.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {AI_ENGINES.map((engine) => (
            <div
              key={engine.id}
              className="rounded-xl px-4 py-5 text-center transition-all duration-200"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${engine.color}40`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <IconContainer className="mx-auto mb-3">
                <img src={ENGINE_LOGOS[engine.id]} alt={engine.name} className="w-6 h-6 object-contain" />
              </IconContainer>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {engine.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 3. Search Shift Section ───────────────────────────────────────────────────
const SHIFT_STEPS = [
  {
    number: "01",
    title: "Millions now ask AI",
    desc: "Users ask ChatGPT, Perplexity, and Gemini instead of searching Google. AI is the new front page.",
    color: "#4F46E5",
  },
  {
    number: "02",
    title: "AI summarizes and recognizes sources",
    desc: "AI engines generate answers that summarize information and recognize specific pages. Only recognized content gets visibility.",
    color: "#7C3AED",
  },
  {
    number: "03",
    title: "Unrecognized brands disappear",
    desc: "If your brand isn't in AI answers, you're invisible to a growing segment of users. Pinnacle fixes that.",
    color: "#6366F1",
  },
];

const FLOW_STEPS = ["User Query", "AI Generated Answer", "Recognised Sources", "Traffic & Visibility"];

function SearchShiftSection() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: story */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>
              The Shift
            </p>
            <h2
              className="font-display text-4xl lg:text-5xl font-bold mb-8"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              Search Is<br />Changing Fast
            </h2>
            <div className="space-y-8">
              {SHIFT_STEPS.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div
                    className="text-2xl font-black shrink-0 w-10 mt-0.5 leading-none"
                    style={{ color: `${step.color}60` }}
                  >
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: flow diagram */}
          <div className="flex justify-center">
            <div className="space-y-2 w-full max-w-[300px]">
              {FLOW_STEPS.map((step, i) => (
                <div key={step}>
                  <div
                    className="rounded-xl px-5 py-4 text-center text-sm font-medium"
                    style={{
                      background:
                        i === 2
                          ? "linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(124,58,237,0.15) 100%)"
                          : "var(--surface)",
                      border:
                        i === 2 ? "1px solid rgba(79,70,229,0.4)" : "1px solid var(--border)",
                      color: i === 2 ? "#A5B4FC" : "var(--foreground)",
                    }}
                  >
                    {i === 2 ? (
                      <>
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full mb-1.5 font-medium"
                          style={{ background: "rgba(79,70,229,0.2)", color: "#818CF8" }}
                        >
                          <img src="/logo-white.png" alt="Pinnacle logo" className="w-3 h-3 object-contain" />
                          Pinnacle makes you win here
                        </span>
                        <div>{step}</div>
                      </>
                    ) : step}
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="flex flex-col items-center py-1" aria-hidden="true">
                      <div className="w-px h-3" style={{ background: "var(--border)" }} />
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(79,70,229,0.14)",
                          border: "1px solid rgba(79,70,229,0.35)",
                        }}
                      >
                        <ArrowDown className="w-3 h-3" style={{ color: "#818CF8" }} />
                      </div>
                      <div className="w-px h-3" style={{ background: "var(--border)" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 4. Platform Pillars ───────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: Microscope,
    title: "AI Visibility Intelligence",
    color: "#4F46E5",
    items: [
      "Citation Probability",
      "Engine Readiness Scores",
      "SEO/GEO Score Analysis",
      "Citation Gap Report",
    ],
  },
  {
    icon: Settings2,
    title: "Optimization",
    color: "#7C3AED",
    items: [
      "Strategy Simulator",
      "AEO Page Audits",
      "Score Improvement Tracking",
      "Content Recommendations - v2",
    ],
  },
  {
    icon: Eye,
    title: "Monitoring",
    color: "#0891B2",
    items: [
      "AI Mention Monitoring",
      "Competitor AI Visibility",
      "Page Change Tracking - v2",
      "AI Traffic Insights - v2",
    ],
  },
];

function PlatformPillars() {
  return (
    <section className="py-24 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4F46E5" }}>
            Platform
          </p>
          <h2
            className="font-display text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            The AI Visibility Platform
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            Everything you need to understand, optimize, and monitor your AI visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl p-7 transition-all duration-200"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${pillar.color}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <IconContainer className="mb-5">
                  <Icon className="w-6 h-6" style={{ color: pillar.color }} />
                </IconContainer>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                  {pillar.title}
                </h3>
                <ul className="space-y-2.5">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--muted)" }}>
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: pillar.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── 5. AI Visibility Lab Preview ──────────────────────────────────────────────
const LAB_STEPS = [
  { step: "01", label: "Enter your search query" },
  { step: "02", label: "Provide your page URL" },
  { step: "03", label: "Predict AI recognition by engine" },
  { step: "04", label: "Follow recommendations to optimize" },
];

function AIVisibilityLabPreview({ onNavigate }) {
  return (
    <section className="py-24 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-medium"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#C4B5FD",
              }}
            >
              <Microscope className="w-3.5 h-3.5" />
              Flagship Feature
            </div>
            <h2
              className="font-display text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              AI Visibility Lab
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
              Simulate how AI engines answer questions and predict whether your brand gets recognized.
            </p>

            <div className="space-y-4 mb-8">
              {LAB_STEPS.map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "rgba(79,70,229,0.15)",
                      color: "#818CF8",
                      border: "1px solid rgba(79,70,229,0.25)",
                    }}
                  >
                    {s.step}
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate?.("ai-visibility-lab")}
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
            >
              Open AI Visibility Lab
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: mini lab UI preview */}
          <div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid rgba(79,70,229,0.25)",
                boxShadow: "0 0 60px rgba(79,70,229,0.08)",
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-2 text-xs font-mono" style={{ color: "var(--muted)" }}>
                  AI Visibility Lab
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Mock inputs */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="h-8 rounded-lg flex items-center px-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Best AI visibility platform...
                    </span>
                  </div>
                  <div
                    className="h-8 rounded-lg flex items-center px-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                      https://yoursite.com...
                    </span>
                  </div>
                  <div
                    className="h-9 rounded-lg flex items-center justify-center text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff" }}
                  >
                    Run Analysis
                  </div>
                </div>

                {/* Summary scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Citation Prob.</p>
                    <p className="text-3xl font-bold" style={{ color: "#34d399" }}>78%</p>
                  </div>
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{ background: "var(--surface-2)", border: "1px solid rgba(79,70,229,0.3)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>AI Visibility</p>
                    <p className="text-3xl font-bold" style={{ color: "#818CF8" }}>81</p>
                  </div>
                </div>

                {/* Engine bars preview */}
                <div
                  className="rounded-xl p-4 space-y-2.5"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
                    Engine Readiness
                  </p>
                  {[
                    { name: "ChatGPT",    score: 82, color: "#34d399", logo: ENGINE_LOGOS.chatgpt    },
                    { name: "Perplexity", score: 71, color: "#22d3ee", logo: ENGINE_LOGOS.perplexity },
                    { name: "Google SGE", score: 65, color: "#818cf8", logo: ENGINE_LOGOS.google_sge },
                    { name: "Copilot",    score: 54, color: "#a78bfa", logo: ENGINE_LOGOS.copilot    },
                  ].map((e) => (
                    <div key={e.name} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-24 shrink-0">
                        <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm shrink-0">
                          <img src={e.logo} alt={e.name} className="w-3.5 h-3.5 object-contain" />
                        </div>
                        <span className="text-xs truncate" style={{ color: "var(--muted)" }}>{e.name}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${e.score}%`, background: e.color }}
                        />
                      </div>
                      <span className="text-xs w-6 text-right font-bold" style={{ color: e.color }}>
                        {e.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 7. Free Audit CTA ─────────────────────────────────────────────────────────
function FreeAuditCTA({ onGetStarted, onNavigate }) {
  const [auditUrl, setAuditUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate?.("audits");
  };

  return (
    <section className="py-24 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[900px] mx-auto">
        <div
          className="rounded-2xl p-10 lg:p-14 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.05) 100%)",
            border: "1px solid rgba(79,70,229,0.25)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#818CF8" }}>
            Get Started Free
          </p>
          <h2
            className="font-display text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Run a Free AI<br />Visibility Audit
          </h2>
          <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            Enter your website URL and see how AI engines currently perceive your content , no signup required.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-10">
            <input
              type="url"
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              placeholder="https://yoursite.com"
              className="flex-1 h-12 rounded-xl px-4 text-sm"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(79,70,229,0.3)",
                color: "var(--foreground)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-primary h-12 px-6 rounded-xl text-sm font-semibold whitespace-nowrap inline-flex items-center gap-2"
            >
              Analyze My Site
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { label: "AI Visibility Score",    value: "78", sub: "Combined score out of 100",   color: "#4F46E5" },
              { label: "Citation Probability",   value: "64%", sub: "Likelihood of being cited",   color: "#7C3AED" },
              { label: "Top Engine",             value: "ChatGPT", sub: "Best performing AI engine",   color: "#0891B2" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>{card.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ onGetStarted, onNavigate }) {
  return (
    <div className="relative overflow-hidden" style={{ background: "transparent" }} data-testid="landing-page">

      <HeroSection onGetStarted={onGetStarted} onNavigate={onNavigate} />
      <AIEngineGrid />
      <SearchShiftSection />
      <AIVisibilityLabPreview onNavigate={onNavigate} />
      <StrategySimulatorSection onNavigate={onNavigate} />
      <PlatformPillars />
      <FreeAuditCTA onGetStarted={onGetStarted} onNavigate={onNavigate} />

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-8" data-section="pricing" id="pricing" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[1120px] mx-auto">
          <div className="mb-10 text-center">
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
                <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>Free</span>
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

            {/* Pro , featured */}
            <div
              className="rounded-2xl p-6 relative"
              style={{
                background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.08) 100%)",
                border: "1px solid rgba(79,70,229,0.4)",
              }}
            >
              <div
                className="absolute -top-3 left-6 px-3 py-1 rounded-full font-bold tracking-wide"
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
              <button onClick={onGetStarted} className="btn-primary w-full justify-center rounded-lg py-2.5 text-sm font-semibold">
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
                AI visibility optimization for the next generation of search.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "AEO Audits",      section: "features" },
                  { label: "AI Visibility Lab", section: "features" },
                  { label: "Monitoring",       section: "features" },
                  { label: "Pricing",          section: "pricing" },
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
                  { label: "About",    page: "about" },
                  { label: "Blog",     page: "blog" },
                  { label: "Careers",  page: "careers" },
                  { label: "Press",    page: "press" },
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
                  { label: "Cookie Policy",  page: "cookies" },
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
                { label: "LinkedIn",    href: "https://linkedin.com/company/pinnacleai" },
                { label: "GitHub",      href: "https://github.com/pinnacleai" },
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
