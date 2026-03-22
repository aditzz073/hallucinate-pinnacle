import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowDown, Eye, Settings2,
  TrendingUp, CheckCircle, BarChart2, Cpu, Mail, Phone, MessageSquare,
  Microscope, Copy, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import StrategySimulatorSection from "../components/landing/StrategySimulatorSection";
import ENGINE_LOGOS from "../utils/engineLogos";
import IconContainer from "../components/ui/IconContainer";
import SectionWrapper from "../hoc/SectionWrapper";
import { fadeIn, fadeUp, slideInLeft, slideInRight } from "../utils/motion";

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

function CountUpNumber({ value, duration = 800 }) {
  const reduceMotion = useReducedMotion();
  const target = Number(value);
  const [display, setDisplay] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setDisplay(value);
      return undefined;
    }

    if (reduceMotion) {
      setDisplay(target);
      return undefined;
    }

    let rafId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      const next = Math.round(target * eased);
      setDisplay(next);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, reduceMotion, value]);

  return <>{display}</>;
}

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
  const reduceMotion = useReducedMotion();
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
          { label: "AI Visibility",   value: 81, unit: "/100", color: "#4F46E5" },
          { label: "Citation Prob.",  value: 74, unit: "%",    color: "#7C3AED" },
          { label: "Eng. Readiness",  value: 68, unit: "%",    color: "#0891B2" },
        ].map((m) => (
          <motion.div
            key={m.label}
            className="rounded-xl p-3"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</p>
            <p className="text-2xl font-bold" style={{ color: m.color }}>
              <CountUpNumber value={m.value} duration={800} />
              <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>{m.unit}</span>
            </p>
          </motion.div>
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
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="relative min-h-[92vh] flex items-center pt-8 md:pt-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
          backgroundSize: "84px 84px",
        }}
      />
      <div
        className="absolute top-8 right-0 w-[440px] h-[420px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(79,70,229,0.08) 0%, transparent 72%)" }}
      />

      <div className="relative w-full max-w-[1120px] mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div variants={slideInLeft}>
            <motion.div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-medium"
              style={{
                background: "rgba(79,70,229,0.12)",
                border: "1px solid rgba(79,70,229,0.3)",
                color: "#A5B4FC",
              }}
              variants={fadeIn}
            >
              <Cpu className="w-3.5 h-3.5" />
              AI Visibility Platform
            </motion.div>

            <motion.h1
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6"
              style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            >
              Control How AI<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Talks About
              </span>{" "}
              Your Brand
            </motion.h1>

            <motion.p
              className="text-lg mb-10 max-w-md leading-relaxed"
              style={{ color: "var(--muted)" }}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              Analyze, predict, and optimize how ChatGPT, Gemini, Perplexity, and Copilot recognize your content.
            </motion.p>

            <motion.div
              className="flex items-center flex-wrap gap-3 mb-10"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.3, duration: 0.45, ease: "easeOut" }}
            >
              <motion.button
                data-testid="hero-get-started"
                onClick={() => onNavigate("audits")}
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Run AI Visibility Audit
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
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
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Book Demo
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

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
          </motion.div>

          {/* Right: dashboard mockup */}
          <motion.div className="flex justify-end" variants={slideInRight}>
            <motion.div
              variants={fadeUp}
              style={{
              transform: "perspective(1200px) rotateY(-4deg) rotateX(2deg)",
              filter: "drop-shadow(0 40px 80px rgba(79,70,229,0.25))",
            }}
            >
              <DashboardMockup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
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
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="py-20 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1120px] mx-auto">
        <motion.div className="text-center mb-12" variants={fadeUp}>
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
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {AI_ENGINES.map((engine) => (
            <motion.div
              key={engine.id}
              className="rounded-xl px-4 py-5 text-center transition-all duration-200"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <IconContainer className="mx-auto mb-3">
                <img src={ENGINE_LOGOS[engine.id]} alt={engine.name} className="w-6 h-6 object-contain" />
              </IconContainer>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {engine.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
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
    <SectionWrapper className="py-24 px-8">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: story */}
          <motion.div variants={slideInLeft}>
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
          </motion.div>

          {/* Right: flow diagram */}
          <motion.div className="flex justify-center" variants={slideInRight}>
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
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
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
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1120px] mx-auto">
        <motion.div className="text-center mb-14" variants={fadeUp}>
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                className="rounded-2xl p-7 transition-all duration-200"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                variants={fadeUp}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
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
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div variants={slideInLeft}>
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

            <motion.button
              onClick={() => onNavigate?.("ai-visibility-lab")}
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Open AI Visibility Lab
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Right: mini lab UI preview */}
          <motion.div variants={slideInRight}>
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
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// ── 7. Free Audit CTA ─────────────────────────────────────────────────────────
function FreeAuditCTA({ onGetStarted, onNavigate }) {
  const [auditUrl, setAuditUrl] = useState("");
  const reduceMotion = useReducedMotion();

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate?.("audits");
  };

  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[900px] mx-auto">
        <motion.div
          className="rounded-2xl p-10 lg:p-14 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.05) 100%)",
            border: "1px solid rgba(79,70,229,0.25)",
          }}
          variants={fadeUp}
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
              { label: "AI Visibility Score", value: 78, valueSuffix: "", valuePrefix: "", sub: "Combined score out of 100", color: "#4F46E5" },
              { label: "Citation Probability", value: 64, valueSuffix: "%", valuePrefix: "", sub: "Likelihood of being cited", color: "#7C3AED" },
              { label: "Top Engine", textValue: "ChatGPT", sub: "Best performing AI engine", color: "#0891B2" },
            ].map((card) => (
              <motion.div
                key={card.label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                variants={fadeUp}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>{card.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: card.color }}>
                  {card.textValue || (
                    <>
                      {card.valuePrefix}
                      <CountUpNumber value={card.value} duration={800} />
                      {card.valueSuffix}
                    </>
                  )}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{card.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

const CLI_TYPING_COMMAND = "pinnacle analyze https://site.com";
const CLI_QUICK_START_COMMAND = `pip install pinnacle-cli
pinnacle analyze https://yoursite.com`;

function PinnacleCLISection({ onNavigate }) {
  const reduceMotion = useReducedMotion();
  const [typedCommand, setTypedCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdvancedSetup, setShowAdvancedSetup] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timeoutId = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeoutId);
  }, [copied]);

  const copyQuickStart = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(CLI_QUICK_START_COMMAND);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = CLI_QUICK_START_COMMAND;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (reduceMotion) {
      setTypedCommand(CLI_TYPING_COMMAND);
      return undefined;
    }

    let timeoutId;
    let index = 0;
    let pause = false;

    const tick = () => {
      if (pause) {
        pause = false;
        index = 0;
        setTypedCommand("");
        timeoutId = setTimeout(tick, 480);
        return;
      }

      index += 1;
      setTypedCommand(CLI_TYPING_COMMAND.slice(0, index));

      if (index >= CLI_TYPING_COMMAND.length) {
        pause = true;
        timeoutId = setTimeout(tick, 1500);
        return;
      }

      timeoutId = setTimeout(tick, 40);
    };

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, [reduceMotion]);

  return (
    <SectionWrapper className="px-8 py-24" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="rounded-3xl p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.09) 55%, rgba(8,145,178,0.08) 100%)",
            border: "1px solid rgba(124,58,237,0.28)",
            boxShadow: "0 18px 42px rgba(0,0,0,0.35)",
          }}
          variants={fadeUp}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <motion.div variants={slideInLeft}>
              <span
                className="inline-flex items-center mb-5"
                style={{
                  background: "rgba(16,185,129,0.14)",
                  border: "1px solid rgba(16,185,129,0.35)",
                  color: "#6EE7B7",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                LIVE
              </span>

              <h2
                className="font-display text-4xl lg:text-5xl font-bold mb-3"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Pinnacle CLI
              </h2>

              <p className="text-lg mb-4" style={{ color: "#C4B5FD" }}>
                Pinnacle AI. Now in your terminal.
              </p>

              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
                Run AI visibility analysis directly from your terminal.
              </p>

              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#A78BFA" }}>
                  Quick Start
                </p>
              </div>

              <div
                className="rounded-xl p-4 mb-4 relative"
                style={{
                  background: "rgba(11,11,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  type="button"
                  onClick={copyQuickStart}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                  style={{
                    background: copied ? "rgba(16,185,129,0.16)" : "rgba(99,102,241,0.12)",
                    border: copied ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(99,102,241,0.25)",
                    color: copied ? "#6EE7B7" : "#C4B5FD",
                  }}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied ✓" : "Copy"}
                </button>
                <pre className="text-xs sm:text-sm leading-relaxed m-0" style={{ color: "#C4B5FD", fontFamily: "monospace" }}>
{CLI_QUICK_START_COMMAND}
                </pre>
              </div>

              <p className="text-xs mb-3" style={{ color: "#B7B3D6" }}>
                Used by developers to test AI visibility before deploying.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                {[
                  "Works locally",
                  "CI/CD ready",
                  "Fast analysis",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px]"
                    style={{
                      color: "#D1D5DB",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    • {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <motion.button
                  onClick={() => onNavigate?.("cli")}
                  className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  View CLI Docs
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={copyQuickStart}
                  className="btn-secondary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor: "rgba(124,58,237,0.4)",
                    color: "#DDD6FE",
                    background: "rgba(124,58,237,0.12)",
                  }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  Install Now
                </motion.button>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(11,11,20,0.65)" }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSetup((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
                  style={{ color: "#C4B5FD" }}
                >
                  <span>Advanced Setup (optional)</span>
                  {showAdvancedSetup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedSetup && (
                  <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>Local backend setup</p>
                      <pre className="text-xs m-0 rounded-lg p-2.5" style={{ color: "#DDD6FE", background: "rgba(4,4,12,0.85)", fontFamily: "monospace", border: "1px solid rgba(255,255,255,0.06)" }}>
{`cd backend
python3 -m pip install -r requirements.txt
python3 server.py`}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>Editable install</p>
                      <pre className="text-xs m-0 rounded-lg p-2.5" style={{ color: "#DDD6FE", background: "rgba(4,4,12,0.85)", fontFamily: "monospace", border: "1px solid rgba(255,255,255,0.06)" }}>
{`cd cli
python3 -m pip install -e .`}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>API key config</p>
                      <pre className="text-xs m-0 rounded-lg p-2.5" style={{ color: "#DDD6FE", background: "rgba(4,4,12,0.85)", fontFamily: "monospace", border: "1px solid rgba(255,255,255,0.06)" }}>
{`pinnacle auth <YOUR_API_KEY>`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={slideInRight}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#A78BFA" }}>
                Example Output
              </p>
              <motion.div
                className="rounded-xl p-5 transition-all duration-300"
                style={{
                  background: "#0B0B14",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "monospace",
                  boxShadow: "0 0 40px rgba(124,58,237,0.15)",
                }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2 mb-5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                </div>

                <div className="space-y-2 text-[13px] leading-relaxed">
                  <div>
                    <span style={{ color: "#A78BFA" }}>$ </span>
                    <span style={{ color: "#EDE9FE" }}>{typedCommand}</span>
                    <motion.span
                      className="inline-block"
                      style={{ color: "#A78BFA" }}
                      animate={reduceMotion ? undefined : { opacity: [0, 1, 0] }}
                      transition={reduceMotion ? undefined : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      |
                    </motion.span>
                  </div>

                  <div style={{ color: "#9CA3AF" }}>Analyzing AI visibility...</div>
                  <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.06)" }} />

                  <div className="pt-1" style={{ color: "#C4B5FD", fontWeight: 700 }}>Score</div>
                  <div><span style={{ color: "#9CA3AF" }}>AI Visibility Score: </span><span style={{ color: "#A78BFA", fontWeight: 700 }}>78</span></div>

                  <div className="pt-1" style={{ color: "#C4B5FD", fontWeight: 700 }}>Citation Probability</div>
                  <div><span style={{ color: "#22d3ee", fontWeight: 700 }}>64%</span></div>

                  <div className="pt-1" style={{ color: "#C4B5FD", fontWeight: 700 }}>Top Engine</div>
                  <div><span style={{ color: "#34d399", fontWeight: 700 }}>ChatGPT</span></div>

                  <div className="pt-2" style={{ color: "#C4B5FD", fontWeight: 700 }}>Engine Readiness</div>
                  <div className="pl-2 space-y-1">
                    <div style={{ color: "#9CA3AF" }}>ChatGPT <span style={{ color: "#34d399", fontWeight: 700 }}>82</span></div>
                    <div style={{ color: "#9CA3AF" }}>Perplexity <span style={{ color: "#22d3ee", fontWeight: 700 }}>74</span></div>
                    <div style={{ color: "#9CA3AF" }}>Gemini <span style={{ color: "#F59E0B", fontWeight: 700 }}>71</span></div>
                    <div style={{ color: "#9CA3AF" }}>Copilot <span style={{ color: "#818CF8", fontWeight: 700 }}>68</span></div>
                  </div>

                  <div className="pt-2" style={{ color: "#C4B5FD", fontWeight: 700 }}>Recommendations</div>
                  <div className="pl-2 space-y-1" style={{ color: "#D1FAE5" }}>
                    <div>✓ Add FAQ schema</div>
                    <div>✓ Improve heading hierarchy</div>
                    <div>✓ Increase authoritative citations</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

export default function LandingPage({ onGetStarted = () => {}, onNavigate = () => {} }) {
  return (
    <div className="relative overflow-hidden" style={{ background: "transparent" }} data-testid="landing-page">

      <HeroSection onGetStarted={onGetStarted} onNavigate={onNavigate} />
      <AIEngineGrid />
      <SearchShiftSection />
      <AIVisibilityLabPreview onNavigate={onNavigate} />
      <StrategySimulatorSection onNavigate={onNavigate} />
      <PlatformPillars />
      <FreeAuditCTA onGetStarted={onGetStarted} onNavigate={onNavigate} />
      <PinnacleCLISection onNavigate={onNavigate} />

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
                  { label: "AEO Audits", page: "audits" },
                  { label: "AI Visibility Lab", page: "ai-visibility-lab" },
                  { label: "Monitoring", page: "monitor" },
                  { label: "Pricing", page: "pricing" },
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" >
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
