import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ChevronDown, Eye, Settings2,
  TrendingUp, CheckCircle, BarChart2, Cpu, Mail, MessageSquare,
  Microscope, Crown,
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

const AI_SELECTION_SIGNALS = [
  {
    title: "Heading structure",
    description: "Structured content with clear H1/H2/H3 headings scores higher for extractability",
  },
  {
    title: "Schema support",
    description: "Pages with schema markup are easier for AI systems to interpret and cite",
  },
  {
    title: "Direct definitions",
    description: "Short, direct definitions improve citation probability by 20-40 points",
  },
  {
    title: "Authority signals",
    description: "Authority signals like org schema and external citations increase trust scoring",
  },
];

const FEATURE_DEPTH_CARDS = [
  {
    title: "AI Visibility Audit",
    description:
      "Analyzes your page across 23 signals including structure, schema, trust, and technical factors to calculate your AEO score. Pinnacle fetches the page, parses its content, and scores each signal. The result shows exactly where your page loses AI visibility points.",
  },
  {
    title: "Citation Probability",
    description:
      "Measures how likely your page is cited by AI systems for a specific query. Scoring uses intent match, extractability, authority, schema support, and content depth. Higher citation probability means your page is more likely to appear in generated answers.",
  },
  {
    title: "Strategy Simulator",
    description:
      "Simulates the impact of content changes before you make them. Choose a strategy, like FAQ schema or better headings, and see projected citation score changes. This helps prioritize fixes that deliver measurable impact first.",
  },
  {
    title: "Competitor Intelligence",
    description:
      "Compares your page against up to five competitors for the same query. It shows where competitors score higher and why AI systems may prefer them. This helps you close exact gaps that reduce AI visibility.",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is AI visibility?",
    answer:
      "AI visibility measures how often AI systems use, cite, or summarize your content. It tracks discoverability in generative engines, not only traditional search.",
  },
  {
    question: "How is AI visibility different from SEO?",
    answer:
      "SEO targets ranking in search results. AI visibility targets inclusion inside generated answers. A page can rank well but still score low for AI use.",
  },
  {
    question: "What is AEO?",
    answer:
      "AEO means AI Engine Optimization. It structures and annotates content so systems like ChatGPT and Gemini are more likely to cite it.",
  },
  {
    question: "What is GEO?",
    answer:
      "GEO means Generative Engine Optimization. It focuses on making content usable inside AI answer text, not only linked or referenced.",
  },
  {
    question: "How do AI engines decide which content to cite?",
    answer:
      "AI engines evaluate extractability, authority, schema support, and content depth. Clear structure and factual sentences increase citation likelihood.",
  },
  {
    question: "What is an AI Visibility Score?",
    answer:
      "An AI Visibility Score is a 0-100 measure of citation readiness. Pinnacle calculates it from 23 signals across structure, trust, media, schema, and technical categories.",
  },
  {
    question: "How can I improve my AI visibility?",
    answer:
      "Add JSON-LD schema and improve heading hierarchy from H1 to H3. Write short extractable paragraphs and strengthen authority signals with organization markup.",
  },
  {
    question: "What tools can I use to measure AI visibility?",
    answer:
      "Pinnacle AI provides AEO audits, citation probability scoring, and engine readiness analysis. It covers ChatGPT, Perplexity, Microsoft Copilot, and Google SGE.",
  },
];

const FAQ_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pinnacle AI",
  url: "https://pinnacle.ai",
  description:
    "Pinnacle AI is an AI visibility platform that helps websites improve citation probability and discoverability in AI-generated responses.",
  sameAs: [],
};

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Pinnacle AI",
  description:
    "An AI Engine Optimization platform for auditing and improving AI answer visibility. It supports ChatGPT, Perplexity, Gemini, and Microsoft Copilot.",
  category: "AI Optimization Software",
  url: "https://pinnacle.ai",
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pinnacle AI",
  url: "https://pinnacle.ai",
  description: "AEO and GEO platform for improving AI visibility and citation probability.",
};

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
    <SectionWrapper className="relative min-h-[92vh] flex items-center pt-8 md:pt-12" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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

function AIVisibilityExplainedSection() {
  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
              AI VISIBILITY
            </p>
            <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
              What is AI Visibility?
            </h2>
            <p className="text-base md:text-lg mb-4 max-w-[560px]" style={{ color: "#94A3B8" }}>
              The new standard for content discoverability in AI-generated responses.
            </p>
            <p className="text-sm md:text-[14px] leading-[1.7] mb-3 max-w-[560px]" style={{ color: "#94A3B8" }}>
              AI visibility tracks how often AI systems cite, summarize, or use your content. It applies to responses from ChatGPT, Gemini, and Perplexity.
            </p>
            <p className="text-sm md:text-[14px] leading-[1.7] max-w-[560px]" style={{ color: "#94A3B8" }}>
              Unlike traditional SEO, which optimizes for ranked links, AI visibility optimizes for appearing inside the answer itself.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
              WHY IT MATTERS
            </p>
            <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
              Traditional SEO is not enough
            </h2>
            <p className="text-base md:text-lg max-w-[560px]" style={{ color: "#94A3B8" }}>
              AI engines use different signals. Pinnacle is built for this shift.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              tag: "SEO",
              title: "Traditional SEO",
              description: "Ranking in search engine results pages",
              accent: "rgba(148,163,184,0.75)",
            },
            {
              tag: "AEO",
              title: "AI Engine Optimization",
              description: "Being cited by AI systems in generated answers",
              accent: "rgba(99,102,241,0.85)",
            },
            {
              tag: "GEO",
              title: "Generative Engine Optimization",
              description: "Being used inside generative engine responses",
              accent: "rgba(139,92,246,0.85)",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: `2px solid ${item.accent}`,
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color: item.accent }}>{item.tag}</p>
              <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#ffffff" }}>{item.title}</h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "#94A3B8" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function HowAIEnginesChooseContentSection() {
  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
          AI UNDERSTANDING
        </p>
        <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
          How AI engines evaluate your content
        </h2>
        <p className="text-base md:text-lg max-w-[560px] mb-11" style={{ color: "#94A3B8" }}>
          AI systems score pages differently than search engines. Here is what they look for.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AI_SELECTION_SIGNALS.map((signal) => (
            <div
              key={signal.description}
              className="rounded-xl p-5 flex items-start gap-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "#6366F1" }} />
              <div>
                <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#ffffff" }}>{signal.title}</h3>
                <p className="text-[14px] leading-[1.7]" style={{ color: "#94A3B8" }}>{signal.description}</p>
              </div>
            </div>
          ))}
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
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <motion.div className="text-left md:text-center mb-12" variants={fadeUp}>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
            Coverage
          </p>
          <h2
            className="font-display text-4xl lg:text-[42px] font-bold mb-4"
            style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
          >
            Where Your Brand Appears in AI
          </h2>
          <p className="text-base md:text-lg max-w-[560px] md:mx-auto" style={{ color: "#94A3B8" }}>
            Pinnacle analyzes your visibility across every major AI engine.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {AI_ENGINES.map((engine) => (
            <motion.div
              key={engine.id}
              className="rounded-xl px-5 py-6 text-center transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
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

function SearchShiftSection() {
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <motion.div className="mb-12" variants={fadeUp}>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
            HOW IT WORKS
          </p>
          <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
            Analyze. Understand. Improve.
          </h2>
          <p className="text-base md:text-lg max-w-[560px]" style={{ color: "#94A3B8" }}>
            Three steps to improve your AI visibility score.
          </p>
        </motion.div>

        <div className="relative">
          <div
            className="hidden md:block absolute left-[16%] right-[16%] top-12 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SHIFT_STEPS.map((step) => (
              <motion.div
                key={step.number}
                className="relative rounded-xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                variants={fadeUp}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="text-4xl font-black mb-4" style={{ color: "rgba(148,163,184,0.35)", lineHeight: 1 }}>
                  {step.number}
                </div>
                <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#ffffff" }}>
                  {step.title}
                </h3>
                <p className="text-[13px] leading-[1.7]" style={{ color: "#94A3B8" }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
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
        <motion.div className="text-left md:text-center mb-14" variants={fadeUp}>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
            Platform
          </p>
          <h2
            className="font-display text-4xl lg:text-[42px] font-bold mb-4"
            style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
          >
            Features for AI visibility analysis
          </h2>
          <p className="text-base md:text-lg max-w-[560px] md:mx-auto" style={{ color: "#94A3B8" }}>
            Structured modules to audit, optimize, and monitor AI visibility with measurable scoring.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                className="rounded-xl p-6 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                variants={fadeUp}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <IconContainer className="mb-5">
                  <Icon className="w-6 h-6" style={{ color: pillar.color }} />
                </IconContainer>
                <h3 className="text-[15px] font-semibold mb-3" style={{ color: "#ffffff" }}>
                  {pillar.title}
                </h3>
                <ul className="space-y-2.5">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14px]" style={{ color: "#94A3B8" }}>
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

function FeatureDepthSection() {
  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
          FEATURE BREAKDOWN
        </p>
        <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-11" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
          How Pinnacle audits AI visibility
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURE_DEPTH_CARDS.map((feature) => (
            <div key={feature.title} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "#6366F1" }} />
                <div>
                  <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#ffffff" }}>
                    {feature.title}
                  </h3>
                  <p className="text-[14px] leading-[1.7]" style={{ color: "#94A3B8" }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function WhoUsesPinnacleSection() {
  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
          BUILT FOR TEAMS
        </p>
        <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
          Who uses Pinnacle AI
        </h2>
        <p className="text-base md:text-lg mb-10 max-w-[560px]" style={{ color: "#94A3B8" }}>
          Teams that publish content use Pinnacle to improve citation probability and answer-level discoverability.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "SEO Teams", description: "Validate structure and schema signals that impact AI citation outcomes." },
            { title: "Content Teams", description: "Rewrite weak sections using extractable definitions and measurable scoring feedback." },
            { title: "Growth Teams", description: "Track engine readiness over time and prioritize fixes with the highest expected lift." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#ffffff" }}>{item.title}</h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "#94A3B8" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function FAQSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleToggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
          FAQ
        </p>
        <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
          Common questions
        </h2>
        <p className="text-base md:text-lg mb-11 max-w-[560px]" style={{ color: "#94A3B8" }}>
          Everything you need to know about AI visibility and how Pinnacle works.
        </p>

        <div className="rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={item.question}
              className="px-6 py-5"
              style={{ borderBottom: index === FAQ_ITEMS.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                type="button"
                onClick={() => handleToggleFaq(index)}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                <h3 className="text-[15px] font-medium" style={{ color: "#ffffff" }}>
                  {item.question}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${openFaqIndex === index ? "rotate-180" : "rotate-0"}`}
                  style={{ color: "#94A3B8" }}
                />
              </button>
              {openFaqIndex === index && (
                <p className="text-[14px] pt-2 pb-1" style={{ color: "#94A3B8" }}>
                  {item.answer}
                </p>
              )}
            </div>
          ))}
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
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div variants={slideInLeft}>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
              AI LAB
            </p>
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
              className="font-display text-4xl lg:text-[42px] font-bold mb-4"
              style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
            >
              AI Visibility Lab
            </h2>
            <p className="text-base md:text-lg mb-10 leading-relaxed max-w-[560px]" style={{ color: "#94A3B8" }}>
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
function FreeAuditCTA({ onNavigate }) {
  const [auditUrl, setAuditUrl] = useState("");
  const reduceMotion = useReducedMotion();

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate?.("audits");
  };

  return (
    <SectionWrapper className="pt-24 pb-20 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <div
          className="rounded-xl p-8 lg:p-10"
          style={{
            background: "radial-gradient(110% 90% at 50% 0%, rgba(99,102,241,0.07) 0%, rgba(99,102,241,0) 60%), rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 14px 32px rgba(0,0,0,0.24)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-start">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
                GET STARTED
              </p>
              <h2
                className="font-display text-4xl lg:text-[42px] font-bold mb-4"
                style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
              >
                Start measuring your AI visibility today
              </h2>
              <p className="text-base md:text-lg mb-10 max-w-[560px]" style={{ color: "#94A3B8" }}>
                Free audit. No credit card required.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="url"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="flex-1 h-12 rounded-xl px-4 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
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
            </div>

            {/* Preview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 text-left">
              {[
                { label: "AI Visibility Score", value: 78, valueSuffix: "", valuePrefix: "", sub: "Combined score out of 100", color: "#4F46E5" },
                { label: "Citation Probability", value: 64, valueSuffix: "%", valuePrefix: "", sub: "Likelihood of being cited", color: "#7C3AED" },
                { label: "Top Engine", textValue: "ChatGPT", sub: "Best performing AI engine", color: "#0891B2" },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  className="rounded-xl p-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
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
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

const CLI_TYPING_COMMAND = "pinnacle analyze https://site.com";

function PinnacleCLISection({ onNavigate }) {
  const reduceMotion = useReducedMotion();
  const [typedCommand, setTypedCommand] = useState("");

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
    <SectionWrapper className="px-8 pt-16 pb-24" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
          CLI WORKFLOW
        </p>
        <div
          className="rounded-xl p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.06) 55%, rgba(8,145,178,0.05) 100%), rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 14px 32px rgba(0,0,0,0.24)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <motion.div variants={slideInLeft}>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(124,58,237,0.4)",
                    color: "#C4B5FD",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  <Crown className="w-3 h-3" />
                  PREMIUM FEATURE
                </span>
                <span
                  className="inline-flex items-center"
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
                  PREVIEW
                </span>
              </div>

              <h2
                className="font-display text-4xl lg:text-[42px] font-bold mb-4"
                style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
              >
                Pinnacle CLI
              </h2>

              <p className="text-base md:text-lg mb-4" style={{ color: "#94A3B8" }}>
                Run AI visibility analysis without leaving your workflow.
              </p>

              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
                Pinnacle CLI lets you test how AI understands your content before users see it.
                Run checks locally or in CI, catch weak spots early, and ship with confidence.
              </p>

              <div className="space-y-2 mb-5 text-xs" style={{ color: "#D1D5DB" }}>
                <div className="flex items-center gap-2"><span style={{ color: "#22d3ee" }}>•</span> Test AI visibility before pushing changes</div>
                <div className="flex items-center gap-2"><span style={{ color: "#22d3ee" }}>•</span> Run audits inside your CI/CD pipeline</div>
                <div className="flex items-center gap-2"><span style={{ color: "#22d3ee" }}>•</span> Catch issues before they affect production</div>
                <div className="flex items-center gap-2"><span style={{ color: "#22d3ee" }}>•</span> Get actionable fixes instantly in your terminal</div>
              </div>

              <p className="text-xs mb-3" style={{ color: "#B7B3D6" }}>
                This preview shows how Pinnacle CLI works. Full access with unlimited runs is available on paid plans.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                {[
                  "Works locally",
                  "CI/CD friendly",
                  "Instant results",
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
                  Try CLI Preview
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
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
        </div>
      </div>
    </SectionWrapper>
  );
}

export default function LandingPage({
  onGetStarted = () => {},
  onNavigate = () => {},
  onSelectPlan = () => {},
  isCheckoutLoading = false,
  user = null,
}) {
  const isProUser = Boolean(user?.isSubscribed || user?.plan === "pro" || user?.isFoundingUser);

  return (
    <div className="relative overflow-x-hidden" style={{ background: "transparent" }} data-testid="landing-page">

      <HeroSection onGetStarted={onGetStarted} onNavigate={onNavigate} />
      <AIVisibilityExplainedSection />
      <HowAIEnginesChooseContentSection />
      <AIEngineGrid />
      <SearchShiftSection />
      <AIVisibilityLabPreview onNavigate={onNavigate} />
      <StrategySimulatorSection onNavigate={onNavigate} />
      <PlatformPillars />
      <FeatureDepthSection />
      <FreeAuditCTA onNavigate={onNavigate} />
      <PinnacleCLISection onNavigate={onNavigate} />
      <WhoUsesPinnacleSection />
      <FAQSection />

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-8" data-section="pricing" id="pricing" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1120px] mx-auto">
          <div className="mb-12 text-left md:text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#818CF8" }}>
              PRICING
            </p>
            <h2
              className="font-display text-4xl lg:text-[42px] font-bold mb-4"
              style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
            >
              Simple, transparent pricing
            </h2>
            <p className="text-base md:text-lg max-w-[560px] md:mx-auto" style={{ color: "#94A3B8" }}>
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter */}
            <div className="rounded-xl p-6 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
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
                onClick={() => onSelectPlan("free")}
                className="w-full rounded-lg py-2.5 text-sm font-medium transition-colors mt-auto"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {user?.isLoggedIn ? "Continue" : "Sign in to continue"}
              </button>
            </div>

            {/* Pro , featured */}
            <div
              className="rounded-xl p-6 relative h-full flex flex-col"
              style={{
                background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.08) 100%)",
                border: "1px solid #6366F1",
                boxShadow: "0 -1px 20px rgba(99,102,241,0.15)",
              }}
            >
              <div
                className="absolute -top-3 left-6 px-3 py-1 rounded-full font-bold tracking-wide"
                style={{ background: "#6366F1", color: "#fff", fontSize: "11px" }}
              >
                MOST POPULAR
              </div>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Professional</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For teams scaling AI visibility with premium workflows.</p>
              <div className="mb-4">
                <span className="text-4xl font-bold" style={{ color: "#818CF8" }}>$100</span>
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {[
                  "Unlimited audits",
                  "Unlimited AI tests",
                  "Advanced Audit access",
                  "Strategy Simulator access",
                  "CLI Tool access",
                  "Priority support",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#818CF8" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan("pro")}
                disabled={isCheckoutLoading || isProUser}
                className="btn-primary w-full justify-center rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
              >
                {isProUser ? "Current plan" : isCheckoutLoading ? "Redirecting..." : "Upgrade Plan ->"}
              </button>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl p-6 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Enterprise</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For large teams with competitive intelligence needs.</p>
              <div className="mb-4">
                <span className="text-2xl font-semibold" style={{ color: "var(--text-muted)" }}>Custom pricing</span>
              </div>
              <ul className="space-y-2 mb-5">
                {[
                  "Everything in Professional",
                  "Competitor Intel",
                  "Executive reports",
                  "Dedicated support",
                  "Custom integrations",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#4F46E5" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl p-3 space-y-2 mt-auto" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Get in touch</p>
                <a
                  href="mailto:pinnacle.ai.support@gmail.com"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(79,70,229,0.12)" }}>
                    <Mail className="w-3 h-3" style={{ color: "#818CF8" }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>pinnacle.ai.support@gmail.com</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>Email our team</div>
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
                <span className="font-display font-bold text-xl tracking-tight leading-none" style={{ color: "var(--foreground)" }}>
                  <span>Pinnacle</span>
                  <span className="font-light" style={{ color: "#818CF8" }}>.ai</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Pinnacle helps teams measure and improve how AI engines discover, cite, and summarize their pages.
                Run audits, monitor visibility signals, and turn recommendations into a clear optimization roadmap.
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
                  { label: "Terms and Data Policy", page: "terms-data-policy" },
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
                <li><a href="mailto:pinnacle.ai.support@gmail.com" className="text-sm" style={{ color: "var(--text-muted)" }}>pinnacle.ai.support@gmail.com</a></li>
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_PAGE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
    </div>
  );
}
