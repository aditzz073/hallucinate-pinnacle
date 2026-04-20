import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ChevronDown, CheckCircle, Search, ShieldCheck,
  Terminal, Code2, Type, BookOpen, Sparkles, Microscope, Settings2, Eye
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import StrategySimulatorSection from "../components/landing/StrategySimulatorSection";
import SectionWrapper from "../hoc/SectionWrapper";
import { fadeUp, slideInLeft, slideInRight } from "../utils/motion";



const VISIBILITY_TREND_DATA = [
  { day: "Apr 12", citation: 64, readiness: 84, summarization: 42, brand: 48, schema: 32 },
  { day: "Apr 13", citation: 66, readiness: 59, summarization: 27, brand: 50, schema: 44 },
  { day: "Apr 14", citation: 57, readiness: 37, summarization: 23, brand: 15, schema: 9 },
  { day: "Apr 15", citation: 62, readiness: 17, summarization: 46, brand: 24, schema: 18 },
  { day: "Apr 16", citation: 65, readiness: 15, summarization: 74, brand: 62, schema: 56 },
  { day: "Apr 17", citation: 88, readiness: 71, summarization: 53, brand: 58, schema: 52 },
  { day: "Apr 18", citation: 68, readiness: 60, summarization: 78, brand: 40, schema: 34 },
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
      "An AI Visibility Score is a 0-100 measure of citation readiness. Pinnacle calculates it from 23+ signals across structure, trust, media, schema, and technical categories.",
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



// ── Dashboard mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const reduceMotion = useReducedMotion();
  const citationDelta = 4;
  return (
    <div className="relative w-full" style={{ maxWidth: 520 }}>
      {/* Main browser window */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(163,230,53,0.08)",
        }}
      >
        {/* Window chrome bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="ml-2 text-[10px] font-mono" style={{ color: "#555" }}>
              pinnacle.ai / dashboard
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-mono text-primary tracking-widest uppercase">Live</span>
          </div>
        </div>

        {/* Score cards row */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {[
            { label: "AI VISIBILITY", value: 81, unit: "/ 100", trend: "+4.2 this week", hasBar: true, barPct: 81 },
            { label: "CITATION PROB.", value: 78, unit: "%", trend: "↗ +12 vs last audit", hasBar: false },
          ].map((m, i) => (
            <div
              key={m.label}
              className="rounded-xl p-3.5"
              style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[9px] font-mono tracking-widest text-[#555] uppercase mb-1">{m.label}</p>
              <p className="text-[10px] text-primary mb-2">{m.trend}</p>
              <p className="text-[32px] font-bold leading-none text-white">
                <CountUpNumber value={m.value} duration={800} />
                <span className="text-[13px] font-normal text-[#555] ml-1">{m.unit}</span>
              </p>
              {m.hasBar && (
                <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full bg-primary" style={{ width: `${m.barPct}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Visibility trend chart area */}
        <div className="px-3 pb-2">
          <div
            className="rounded-xl p-3"
            style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-white/70">Visibility trend · 7d</p>
              <span className="text-[11px] font-semibold text-primary">+{citationDelta} pts</span>
            </div>
            <div className="h-[90px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VISIBILITY_TREND_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#444", fontSize: 9 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Line type="monotone" dataKey="citation" stroke="#a3e635" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeOpacity={0.6} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Engine readiness bars */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-[#555]">Engine readiness</p>
            <p className="text-[9px] font-mono text-[#444]">4 engines</p>
          </div>
          <div className="space-y-1.5">
            {[
              { engine: "ChatGPT", score: 82, color: "#a3e635" },
              { engine: "Perplexity", score: 71, color: "#3b82f6" },
              { engine: "Gemini", score: 68, color: "#f59e0b" },
              { engine: "Copilot", score: 55, color: "#e879f9" },
            ].map((row) => (
              <div key={row.engine} className="flex items-center gap-2">
                <span className="text-[10px] w-[58px] shrink-0" style={{ color: "#666" }}>{row.engine}</span>
                <div className="flex-1 h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${row.score}%`, background: row.color }} />
                </div>
                <span className="text-[10px] font-bold w-6 text-right" style={{ color: row.color }}>{row.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orbital card: New Citation — left side, mid-height */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute z-10"
        style={{
          left: -60,
          top: "38%",
        }}
      >
        <motion.div
          animate={reduceMotion ? undefined : {
            y: [0, -6, 0],
            x: [0, 4, 0],
            rotate: [0, 1.5, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="rounded-xl p-3"
          style={{
            background: "rgba(20,20,20,0.98)", // More opaque to replace blur
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            width: 200,
            willChange: "transform",
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] font-mono tracking-widest uppercase" style={{ color: "#555" }}>New Citation</span>
            <CheckCircle className="w-3 h-3 text-primary" />
          </div>
          <p className="text-[12px] text-white font-medium leading-snug">ChatGPT cited your /pricing page</p>
          <p className="text-[9px] font-mono mt-1.5" style={{ color: "#555" }}>2 min ago</p>
        </motion.div>
      </motion.div>

      {/* Orbital card: Lift Suggestion — bottom right */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="absolute z-10"
        style={{
          right: -16,
          bottom: -24,
        }}
      >
        <motion.div
          animate={reduceMotion ? undefined : {
            y: [0, -8, 0],
            x: [0, -3, 0],
            rotate: [0, -1, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="rounded-xl p-4"
          style={{
            background: "#a3e635",
            boxShadow: "0 10px 30px rgba(163,230,53,0.2)", // Reduced shadow complexity
            width: 220,
            willChange: "transform",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-black/50" />
            <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-black/50">Lift Suggestion</span>
          </div>
          <p className="text-[13px] font-bold text-[#0a0a0a] leading-snug mb-3">
            Add FAQ schema → predicted +14 citation pts.
          </p>
          <div className="flex items-center gap-3">
            <button className="bg-[#0a0a0a] text-white px-4 py-1.5 rounded-full text-[10px] font-bold">Apply</button>
            <button className="text-black/60 text-[10px] font-semibold">Preview</button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── 1. Hero Section ───────────────────────────────────────────────────────────
function HeroSection({ onGetStarted, onNavigate }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative min-h-screen flex items-center"
      style={{ background: "#000000", overflow: "hidden" }}
    >
      {/* Pure black base — green radial glow shifted left and up */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 45% 35%, rgba(163,230,53,0.3) 0%, transparent 45%)",
        }}
      />

      {/* Grid — only visible in the green-lit area, shifted left/up */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163,230,53,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163,230,53,0.055) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle 50% at 45% 35%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle 50% at 45% 35%, black 20%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[1160px] mx-auto px-8 lg:px-12 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-center">

          {/* ── Left: Copy ── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-7"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-mono tracking-[0.06em]" style={{ color: "#888" }}>
                AI Visibility Platform
              </span>
            </div>

            {/* Main headline — exact same line breaks as screenshot */}
            <h1
              className="font-bold leading-[1.04] mb-7"
              style={{
                fontSize: "clamp(44px, 5.6vw, 72px)",
                letterSpacing: "-0.025em",
                color: "#ffffff",
                fontFamily: "'Chivo', 'Inter', sans-serif",
              }}
            >
              Control how AI<br />
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#a3e635",
                  paddingRight: "4px",
                }}
              >
                talks
              </em>
              <br />
              about your<br />
              brand.
            </h1>

            {/* Sub-headline — matches screenshot copy exactly */}
            <p
              className="mb-9 leading-relaxed"
              style={{
                fontSize: "15px",
                color: "#888",
                maxWidth: 420,
              }}
            >
              Analyze, predict, and optimize how{" "}
              <span style={{ color: "#c8c8c8", fontWeight: 500 }}>ChatGPT</span>,{" "}
              <span style={{ color: "#c8c8c8", fontWeight: 500 }}>Gemini</span>,{" "}
              <span style={{ color: "#c8c8c8", fontWeight: 500 }}>Perplexity</span>, and{" "}
              <span style={{ color: "#c8c8c8", fontWeight: 500 }}>Copilot</span> recognize
              your content — with deterministic scoring, not vibes.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 mb-10 flex-wrap">
              <motion.button
                data-testid="hero-get-started"
                onClick={() => onNavigate("audits")}
                className="group inline-flex items-center gap-2 rounded-full font-bold transition-all"
                style={{
                  background: "#a3e635",
                  color: "#000",
                  padding: "12px 22px",
                  fontSize: "14px",
                  boxShadow: "0 0 20px rgba(163,230,53,0.18)",
                }}
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                Run AI Visibility Audit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.button
                data-testid="hero-learn-more"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#aaa",
                  padding: "12px 20px",
                  fontSize: "14px",
                }}
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                <span className="font-mono text-[#555] mr-0.5">{">_"}</span>
                Try CLI
              </motion.button>
            </div>

            {/* Bottom micro-stats */}
            <div className="flex items-center gap-7 flex-wrap">
              {["Deterministic scoring", "6+ AI engines", "Real-time tracking"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "rgba(163,230,53,0.5)" }}
                  />
                  <span
                    className="font-mono"
                    style={{ fontSize: "11px", color: "#444", letterSpacing: "0.04em" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Dashboard Mockup ── */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={reduceMotion ? false : { opacity: 0, x: 32 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            style={{
              paddingRight: 48,
              paddingBottom: 32,
            }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}




function AIVisibilityExplainedSection() {
  return (
    <>
      {/* 4. What is AI Visibility? */}
      <SectionWrapper id="platform" className="py-40 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-16">
            <div>
              <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase">
                {"// AI VISIBILITY"}
              </p>
              <h2 className="font-display text-5xl lg:text-[64px] font-bold mb-4 text-white leading-tight">
                What is <span className="text-primary">AI Visibility</span>?
              </h2>
            </div>
            <div className="lg:pt-8">
              <p className="text-[18px] leading-[1.6] text-white mb-6">
                AI visibility tracks how often AI systems <strong>cite, summarize, or use</strong> your content in the answers they generate.
              </p>
              <p className="text-[15px] leading-[1.7] text-muted-foreground">
                Unlike traditional SEO — which optimizes for ranked links — AI visibility optimizes for appearing <span className="text-primary">inside the answer itself</span>. That's the new standard for content discoverability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { metric: "6+", label: "ENGINES" },
              { metric: "23", label: "SIGNALS" },
              { metric: "1.2M", label: "QUERIES TRACKED" },
              { metric: "+34%", label: "AVG. LIFT" },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] p-10 bg-[#141418] border border-white/5">
                <h3 className="text-5xl font-display font-bold text-white mb-2">{item.metric}</h3>
                <p className="text-[12px] font-mono tracking-widest text-muted-foreground uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 5. SEO VS AEO VS GEO */}
      <SectionWrapper className="py-24 px-8 border-t border-white/5 bg-transparent">
        <div className="max-w-[1120px] mx-auto">
          <p className="text-[10px] font-mono tracking-[0.15em] mb-4 text-primary uppercase">
            {"// WHY IT MATTERS"}
          </p>
          <h2 className="font-display text-4xl lg:text-[50px] font-bold mb-6 text-white leading-tight">
            Traditional SEO <span className="text-muted-foreground font-light italic">is not enough.</span>
          </h2>
          <p className="text-[16px] text-muted-foreground max-w-[600px] mb-12 leading-relaxed">
            AI engines don't rank — they read, summarize, and cite. They use a different set of signals entirely. Pinnacle is built for this shift.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[20px] p-8 bg-[#141418] border border-white/5 relative overflow-hidden">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/5 text-[9px] font-mono tracking-widest text-white/50 mb-6 uppercase">SEO</span>
              <h3 className="text-2xl font-display font-bold text-white mb-3">Traditional SEO</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">Ranking in search engine results pages.</p>
              <div className="mt-16 text-[10px] font-mono text-white/20">01 / 03</div>
            </div>

            <div className="rounded-[20px] p-8 bg-primary border-transparent relative overflow-hidden shadow-[0_20px_40px_rgba(163,230,53,0.15)]">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-black/10 text-[9px] font-mono tracking-widest text-black/60 font-bold mb-6 uppercase">AEO</span>
              <h3 className="text-2xl font-display font-bold text-black mb-3">AI Engine<br />Optimization</h3>
              <p className="text-[15px] text-black/80 font-medium leading-relaxed mt-2">Being cited by AI systems inside generated answers.</p>
              <div className="mt-16 text-[10px] font-mono text-black/30 font-bold">02 / 03</div>
            </div>

            <div className="rounded-[20px] p-8 bg-[#141418] border border-white/5 relative overflow-hidden">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/5 text-[9px] font-mono tracking-widest text-white/50 mb-6 uppercase">GEO</span>
              <h3 className="text-2xl font-display font-bold text-white mb-3">Generative Engine<br />Optimization</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed mt-2">Being used inside generative engine responses and summaries.</p>
              <div className="mt-16 text-[10px] font-mono text-white/20">03 / 03</div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}

const AI_EVALUATION_CARDS = [
  { icon: Type, title: "Clear Headings", desc: "AI models parse clear, hierarchical H1-H3 structures first to understand page context." },
  { icon: Code2, title: "Schema Markup", desc: "Structured data feeds directly into knowledge graphs, ensuring accurate summarization." },
  { icon: BookOpen, title: "Direct Definitions", desc: "Models heavily favor 'What is X?' semantic patterns in paragraphs immediately following headings." },
  { icon: ShieldCheck, title: "Domain Authority", desc: "Trusted sources and high backlink profiles are weighted higher for generated citations." }
];

function HowAIEnginesChooseContentSection() {
  return (
    <>
      {/* 6. How Evaluation Works */}
      <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "transparent" }}>
        <div className="max-w-[1120px] mx-auto">
          <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase text-center">
            {"// AI UNDERSTANDING"}
          </p>
          <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-4 text-center text-white">
            How AI engines evaluate content
          </h2>
          <p className="text-[16px] text-muted-foreground text-center max-w-[600px] mx-auto mb-16">
            AI systems score pages differently than search engines. Here is what they look for.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_EVALUATION_CARDS.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.title}
                  className="rounded-[16px] p-6 flex flex-col items-start gap-4"
                  style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#0e0e11] border border-white/5 shadow-inner">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold mb-2 text-white">{signal.title}</h3>
                    <p className="text-[14px] leading-[1.6] text-muted-foreground">{signal.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* 7. How it Works (Steps) */}
      <SectionWrapper id="how-it-works" className="py-40 px-8 border-t border-white/5 bg-transparent">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase">
            {"// HOW IT WORKS"}
          </p>
          <h2 className="font-display text-4xl lg:text-[50px] font-bold mb-16 text-white leading-tight">
            Analyze. Understand. <span className="text-muted-foreground italic font-light">Improve.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Run a brand audit",
                desc: "Identify exactly how often and favorably you are cited across ChatGPT, Perplexity, and others.",
              },
              {
                number: "02",
                title: "Simulate strategies",
                desc: "See how adding semantic markup or restructuring headings will impact your generative rankings.",
              },
              {
                number: "03",
                title: "Track performance",
                desc: "Monitor your visibility scores day-by-day as engines re-crawl your updated content.",
              },
            ].map((step) => (
              <div key={step.number} className="relative p-6 rounded-2xl border border-white/5 bg-[#141418]">
                <div className="text-[50px] font-display font-medium text-primary mb-6 leading-none">
                  {step.number}
                  <span className="text-primary text-[20px]">/</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}

// ── 2. AI Engine Grid ─────────────────────────────────────────────────────────
// ── 2 + 3. AI Engine Marquee ──────────────────────────────────────────────────
const ALL_ENGINES = ["CHATGPT", "GEMINI", "PERPLEXITY", "COPILOT", "CLAUDE", "GROK", "GOOGLE SGE", "META AI", "DEEPSEEK", "MISTRAL"];

function AIEngineMarquee() {
  return (
    <div className="py-10 bg-transparent overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex justify-center mb-6">
        <p className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
          {"// tracked across every major AI engine"}
        </p>
      </div>
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee flex gap-12 whitespace-nowrap items-center w-max pr-12">
          {[...ALL_ENGINES, ...ALL_ENGINES].map((eng, i) => (
            <span key={i} className="text-2xl md:text-3xl font-display font-bold text-white/20 hover:text-white transition-colors cursor-default">
              {eng}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 3. Search Shift Section ───────────────────────────────────────────────────
const SHIFT_STEPS = [
  {
    number: "01",
    title: "Millions now ask AI",
    desc: "Users ask ChatGPT, Perplexity, and Gemini instead of searching Google. AI is the new front page.",
    color: "#a3e635",
  },
  {
    number: "02",
    title: "AI summarizes and recognizes sources",
    desc: "AI engines generate answers that summarize information and recognize specific pages. Only recognized content gets visibility.",
    color: "#a3e635",
  },
  {
    number: "03",
    title: "Unrecognized brands disappear",
    desc: "If your brand isn't in AI answers, you're invisible to a growing segment of users. Pinnacle fixes that.",
    color: "#a3e635",
  },
];

function SearchShiftSection() {
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="py-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1120px] mx-auto">
        <motion.div className="mb-12" variants={fadeUp}>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#a3e635" }}>
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

function PlatformBentoGrid() {
  return (
    <SectionWrapper className="py-24 px-8 bg-transparent" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase text-center">
          {"// PLATFORM FEATURES"}
        </p>
        <h2 className="font-display text-4xl lg:text-[50px] font-bold mb-16 text-center text-white">
          Everything you need to <span className="text-primary italic font-light">dominate AI answers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large Card: AI Visibility Intelligence */}
          <div className="md:col-span-2 rounded-[24px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group" style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="absolute -top-10 -right-10 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Microscope className="w-64 h-64 text-white" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#0e0e11] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                <Microscope className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-3 relative z-10">AI Visibility Intelligence</h3>
              <p className="text-[16px] text-muted-foreground max-w-sm mb-10 leading-relaxed relative z-10">
                Deep-dive auditing into your citation probability across 6+ major AI engines. Uncover exact gaps in your semantic clustering.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {["Citation Probability", "Engine Readiness", "SEO/GEO Analysis", "Citation Gap Report"].map((i) => (
                <div key={i} className="flex items-center gap-3 text-[14px] text-white/80">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* Medium Card: Optimization */}
          <div className="rounded-[24px] p-8 md:p-10 flex flex-col relative overflow-hidden group" style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-12 h-12 rounded-lg bg-[#0e0e11] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
              <Settings2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-display font-bold text-white mb-3">Optimization</h3>
            <p className="text-[16px] text-muted-foreground mb-10 leading-relaxed">
              Run strategy simulations and AEO audits to generate content recommendations.
            </p>
            <div className="space-y-4 mt-auto">
              {["Strategy Simulator", "AEO Page Audits", "Content Recs"].map((i) => (
                <div key={i} className="flex items-center gap-3 text-[14px] text-white/80">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* Wide Card: Monitoring */}
          <div className="md:col-span-3 rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden" style={{ background: "linear-gradient(to right, #141418, rgba(163,230,53,0.05))", border: "1px solid rgba(163,230,53,0.15)" }}>
            <div className="flex-1">
              <div className="w-12 h-12 rounded-lg bg-[#0e0e11] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-3">Monitoring</h3>
              <p className="text-[16px] text-muted-foreground max-w-lg mb-0 leading-relaxed">
                Continuous AI mention tracking. Watch your competitors and get alerts whenever their visibility surges ahead of yours.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1 w-full bg-[#0e0e11]/50 p-8 rounded-[16px] border border-white/5">
              {["AI Mention Monitoring", "Competitor Tracking", "Page Change Tracking", "AI Traffic Insights"].map((i) => (
                <div key={i} className="flex items-center gap-3 text-[15px] font-medium text-white/90">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                  {i}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
}

function DeveloperCLISection() {
  return (
    <SectionWrapper id="cli" className="py-40 px-8 bg-transparent border-t border-white/5">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase">
              {"// FOR DEVELOPERS"}
            </p>
            <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-6 text-white leading-tight">
              Integrate AI Visibility into your <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">CI/CD</span> pipeline
            </h2>
            <p className="text-[16px] text-muted-foreground mb-8 leading-relaxed">
              Run automated checks before deploying. Ensure that changes to your headings, schema, or body copy never nuke your AI search scores.
            </p>

            <div className="space-y-4">
              {[
                "NPM package available",
                "Fails build if AEO score drops significantly",
                "Integrates directly with GitHub Actions",
              ].map(item => (
                <div key={item} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[15px] text-white/80 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#09090b] border border-white/10 shadow-[0_0_50px_rgba(163,230,53,0.05)] transform perspective-[1000px] rotate-y-[-5deg] rotate-x-[2deg]">
            <div className="flex justify-between items-center px-4 py-3 bg-[#141418] border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">bash</span>
            </div>
            <div className="p-6 font-mono text-[13.5px] leading-relaxed relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px]" />
              <p className="text-white/40 mb-3">$ npx @pinnacle/cli audit ./pages</p>
              <p className="text-white mb-2"><span className="text-primary mr-2">✔</span> Scanned 24 pages in 1.2s</p>
              <p className="text-white mb-6"><span className="text-primary mr-2">✔</span> Simulated extraction (ChatGPT-4o)</p>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mb-4">
                <p className="text-amber-400 mb-1 flex items-center gap-2">
                  <span className="font-bold">⚠</span> /pricing/enterprise
                </p>
                <p className="text-white/60 text-[12px] ml-5">Nested schema markup missing. Citation prob. dropped -14%.</p>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-6">
                <p className="text-primary mb-1 flex items-center gap-2">
                  <span className="font-bold">✔</span> /features/ai-search
                </p>
                <p className="text-white/60 text-[12px] ml-5">H2 structured correctly. Readiness Score: 92/100 (Pass)</p>
              </div>

              <p className="text-white flex items-center justify-between">
                <span>Audit complete.</span>
                <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">1 Warning</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

function WhoUsesPinnacleSection() {
  return (
    <SectionWrapper className="py-24 px-8 bg-transparent" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[1120px] mx-auto">
        <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase text-center">
          {"// BUILT FOR SCALE"}
        </p>
        <h2 className="font-display text-4xl lg:text-[50px] font-bold mb-6 text-center text-white leading-tight">
          Who uses Pinnacle AI?
        </h2>
        <p className="text-[16px] text-muted-foreground mb-16 max-w-[600px] mx-auto text-center leading-relaxed">
          Growth and engineering teams use Pinnacle to improve citation probability and safeguard AI discoverability.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "SEO Teams",
              description: "Validate structure and schema signals that impact AI citation outcomes before content is published.",
              icon: Search
            },
            {
              title: "Content Marketing",
              description: "Rewrite weak sections using extractable definitions and measurable scoring feedback.",
              icon: BookOpen
            },
            {
              title: "Engineering",
              description: "Integrate AEO checks natively into deployment pipelines using the Pinnacle CLI and API.",
              icon: Code2
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[20px] p-8 relative overflow-hidden group" style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-[#0e0e11] group-hover:border-primary/50 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
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
    <SectionWrapper id="faq" className="py-40 px-8 bg-transparent" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[1000px] mx-auto">
        <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase text-center">
          {"// FAQ"}
        </p>
        <h2 className="font-display text-4xl lg:text-[42px] font-bold mb-12 text-white text-center">
          Common questions
        </h2>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.question}
                className="rounded-2xl transition-colors overflow-hidden"
                style={{
                  background: isOpen ? "rgba(163,230,53,0.03)" : "#141418",
                  border: isOpen ? "1px solid rgba(163,230,53,0.2)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleFaq(index)}
                  className="w-full flex items-center justify-between gap-6 p-8 text-left"
                >
                  <h3 className="text-[19px] font-semibold text-white">
                    {item.question}
                  </h3>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-primary text-black" : "bg-[#0e0e11] text-white/50 border border-white/10"}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-8 pb-8 text-[16px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {item.answer}
                  </div>
                )}
              </div>
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
    <SectionWrapper className="py-40 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: copy */}
          <motion.div variants={slideInLeft}>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#a3e635" }}>
              AI LAB
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[11px] font-mono tracking-wider"
              style={{
                background: "rgba(163,230,53,0.1)",
                border: "1px solid rgba(163,230,53,0.3)",
                color: "var(--primary)",
              }}
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
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
                    className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-mono tracking-widest font-bold"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--primary)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {s.step}
                  </div>
                  <p className="text-[15px] font-medium text-white/80">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <motion.button
              onClick={() => onNavigate?.("ai-visibility-lab")}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)] bg-primary text-black hover:bg-primary-hover"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              Open AI Lab
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Right: mini lab UI preview */}
          <motion.div variants={slideInRight}>
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "#09090b",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 60px rgba(163,230,53,0.08)",
              }}
            >
              {/* Terminal Chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#141418" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
                  Pinnacle // Lab
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Mock inputs */}
                <div
                  className="rounded-[12px] p-5 relative overflow-hidden"
                  style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

                  <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Target Query</div>
                  <div
                    className="h-10 rounded flex items-center px-4 mb-5"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-[13px] text-white">Best enterprise software 2026</span>
                  </div>

                  <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Target URL</div>
                  <div
                    className="h-10 rounded flex items-center px-4"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-[13px] text-white">https://yoursite.com/best-software</span>
                  </div>
                  <div
                    className="h-11 rounded flex items-center justify-center text-[13px] font-bold mt-6 cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.15)] transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--primary)", color: "#000" }}
                  >
                    Run Analysis
                  </div>
                </div>

                {/* Engine bars preview */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { name: "ChatGPT", score: 82, color: "#a3e635" },
                    { name: "Perplexity", score: 71, color: "#3b82f6" },
                  ].map((e) => (
                    <div key={e.name} className="flex flex-col rounded-lg p-3" style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground mb-3">{e.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                          <div className="h-full rounded-full" style={{ width: `${e.score}%`, background: e.color }} />
                        </div>
                        <span className="text-[12px] font-bold" style={{ color: e.color }}>{e.score}</span>
                      </div>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate?.("audits");
  };

  return (
    <SectionWrapper className="pt-24 pb-24 px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0e0e11" }}>
      <div className="max-w-[1120px] mx-auto">
        <div
          className="rounded-[24px] p-8 lg:p-12 relative overflow-hidden"
          style={{
            background: "#141418",
            border: "1px solid rgba(163,230,53,0.15)",
            boxShadow: "0 20px 60px rgba(163,230,53,0.08)",
          }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 items-center relative z-10">
            <div>
              <p className="text-[10px] font-mono tracking-widest mb-4 text-primary uppercase">
                {"// GET STARTED"}
              </p>
              <h2
                className="font-display text-4xl lg:text-[42px] font-bold mb-4 text-white leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                Start measuring your AI visibility today
              </h2>
              <p className="text-[16px] mb-10 max-w-[560px] text-muted-foreground leading-relaxed">
                Run a free audit to see how often you are cited. No credit card required.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="url"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="flex-1 h-14 rounded-xl px-5 text-[15px] transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    outline: "none",
                  }}
                  required
                />
                <button
                  type="submit"
                  className="group h-14 px-8 rounded-xl text-[15px] font-bold whitespace-nowrap inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(163,230,53,0.2)]"
                  style={{ background: "var(--primary)", color: "#000" }}
                >
                  Analyze My Site
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Preview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-left">
              {[
                { label: "AI Visibility Score", value: 78, valueSuffix: "", valuePrefix: "", sub: "Combined score out of 100" },
                { label: "Citation Probability", value: 64, valueSuffix: "%", valuePrefix: "", sub: "Likelihood of being cited in answers" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl p-5 flex items-center justify-between"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div>
                    <p className="text-[11px] font-mono tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{card.label}</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>{card.sub}</p>
                  </div>
                  <div className="text-3xl font-display font-bold text-primary">
                    {card.textValue || (
                      <>
                        {card.valuePrefix}
                        <CountUpNumber value={card.value} duration={800} />
                        {card.valueSuffix}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}



export default function LandingPage({
  onGetStarted = () => { },
  onNavigate = () => { },
  onSelectPlan = () => { },
  isCheckoutLoading = false,
  user = null,
}) {
  const isSubscribed = Boolean(user?.isSubscribed || user?.isFoundingUser);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-black" data-testid="landing-page">
      <div className="relative z-10">

        <HeroSection onGetStarted={onGetStarted} onNavigate={onNavigate} />
        <AIEngineMarquee />
        <AIVisibilityExplainedSection />
        <HowAIEnginesChooseContentSection />
        <SearchShiftSection />
        <AIVisibilityLabPreview onNavigate={onNavigate} />
        <StrategySimulatorSection onNavigate={onNavigate} />
        <PlatformBentoGrid />
        <DeveloperCLISection />
        <WhoUsesPinnacleSection />
        <FreeAuditCTA onNavigate={onNavigate} />
        <FAQSection />

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section className="py-24 px-8 bg-transparent" data-section="pricing" id="pricing" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="max-w-[1120px] mx-auto">
            <div className="mb-16 text-center">
              <p className="text-[10px] font-mono tracking-[0.1em] mb-4 text-primary uppercase text-center">
                {"// PRICING"}
              </p>
              <h2 className="font-display text-4xl lg:text-[50px] font-bold mb-4 text-white leading-tight">
                Simple, transparent pricing
              </h2>
              <p className="text-[16px] text-muted-foreground max-w-[600px] mx-auto">
                Start free. Upgrade when you need more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Discover */}
              <div className="rounded-[24px] p-10 flex flex-col" style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Discover</h3>
                <p className="text-[15px] text-muted-foreground mb-6">Understand your AI visibility.</p>
                <div className="mb-8 border-b border-white/5 pb-10">
                  <span className="text-5xl font-bold text-white">₹8,000</span>
                  <span className="text-base ml-1 text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {["5 audits/month", "3 AI tests/month", "Basic audit & score", "3-record history"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-[15px] text-white/80">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 opacity-70" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelectPlan("discover")}
                  className="w-full rounded-full py-4 text-base font-bold transition-all mt-auto pointer-events-auto"
                  style={{ background: "#0e0e11", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                >
                  Start with Discover
                </button>
              </div>

              {/* Optimize — featured */}
              <div
                className="rounded-[24px] p-8 relative flex flex-col transform md:scale-[1.03] z-10"
                style={{
                  background: "linear-gradient(180deg, #181c14 0%, #0e0e11 100%)",
                  border: "1px solid rgba(163,230,53,0.3)",
                  boxShadow: "0 20px 60px rgba(163,230,53,0.1)",
                }}
              >
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full font-bold tracking-widest text-[11px] uppercase"
                  style={{ background: "var(--primary)", color: "#000" }}
                >
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-display font-bold text-primary mb-2 mt-2">Optimize</h3>
                <p className="text-[15px] text-muted-foreground mb-6">Fix and improve what AI can't see.</p>
                <div className="mb-8 border-b border-primary/10 pb-10">
                  <span className="text-5xl font-bold text-white">₹15,000</span>
                  <span className="text-base ml-1 text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "30 audits/month",
                    "20 AI tests/month",
                    "Advanced Audit",
                    "Strategy Simulator",
                    "Competitor intel (2/query)",
                    "Full history",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-[15px] text-white/90">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelectPlan("optimize")}
                  disabled={isCheckoutLoading || isSubscribed}
                  className="w-full justify-center rounded-full py-4 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-auto transition-transform hover:scale-[1.02]"
                  style={{ background: "var(--primary)", color: "#000", boxShadow: "0 0 20px rgba(163,230,53,0.2)" }}
                >
                  {isSubscribed ? "Current plan" : isCheckoutLoading ? "Redirecting..." : "Start Optimizing"}
                </button>
              </div>

              {/* Dominate */}
              <div className="rounded-[24px] p-10 flex flex-col" style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Dominate</h3>
                <p className="text-[15px] text-muted-foreground mb-6">Scale and outperform competitors.</p>
                <div className="mb-8 border-b border-white/5 pb-10">
                  <span className="text-5xl font-bold text-white">₹40,000</span>
                  <span className="text-base ml-1 text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "Everything in Optimize",
                    "Unlimited audits & AI tests",
                    "Full competitor intel (5)",
                    "Monitoring + alerts",
                    "CLI access",
                    "Enterprise reports",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-[15px] text-white/80">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 opacity-70" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelectPlan("dominate")}
                  disabled={isCheckoutLoading}
                  className="w-full rounded-full py-4 text-base font-bold transition-all mt-auto disabled:opacity-60 disabled:cursor-not-allowed pointer-events-auto"
                  style={{ background: "#0e0e11", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                >
                  {isCheckoutLoading ? "Redirecting..." : "Dominate AI Search"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "transparent" }}>
          <div className="max-w-[1280px] mx-auto px-8 py-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display font-bold text-xl tracking-tight leading-none text-white">
                    <span>Pinnacle</span>
                    <span className="font-light text-primary">.ai</span>
                  </span>
                </div>
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  Control how AI engines discover, cite, and summarize your digital footprint.
                </p>
              </div>

              {/* Product */}
              <div>
                <p className="text-[10px] font-mono tracking-widest mb-6 text-white uppercase">Product</p>
                <ul className="space-y-3">
                  {[
                    { label: "AEO Audits", page: "audits" },
                    { label: "AI Visibility Lab", page: "ai-visibility-lab" },
                    { label: "Monitoring", page: "monitor" },
                    { label: "Pricing", page: "pricing" },
                    { label: "Pinnacle CLI", page: "cli", isNew: true },
                  ].map(({ label, page, isNew }) => (
                    <li key={label}>
                      <button
                        onClick={() => onNavigate?.(page)}
                        className="text-[14px] text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
                      >
                        {label}
                        {isNew && <span className="bg-primary/20 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">NEW</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="text-[10px] font-mono tracking-widest mb-6 text-white uppercase">Company</p>
                <ul className="space-y-3">
                  {[
                    { label: "About", page: "about" },
                    { label: "Blog", page: "blog" },
                    { label: "Careers", page: "careers" },
                    { label: "Press", page: "press" },
                  ].map(({ label, page }) => (
                    <li key={label}>
                      <button
                        onClick={() => onNavigate?.(page)}
                        className="text-[14px] text-muted-foreground hover:text-white transition-colors"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <p className="text-[10px] font-mono tracking-widest mb-6 text-white uppercase">Support</p>
                <ul className="space-y-3 mb-8">
                  <li><button onClick={() => onNavigate?.("docs")} className="text-[14px] text-muted-foreground hover:text-white transition-colors">Documentation</button></li>
                  <li><button onClick={() => onNavigate?.("status")} className="text-[14px] text-muted-foreground hover:text-white transition-colors">System Status</button></li>
                  <li><a href="mailto:support@pinnacle.ai" className="text-[14px] text-muted-foreground hover:text-white transition-colors">Contact Support</a></li>
                </ul>

                <p className="text-[10px] font-mono tracking-widest mb-6 text-white uppercase">Legal</p>
                <ul className="space-y-3">
                  <li><button onClick={() => onNavigate?.("terms")} className="text-[14px] text-muted-foreground hover:text-white transition-colors">Terms & Privacy</button></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5" >
              <div className="text-[13px] text-muted-foreground flex items-center gap-4">
                <span>&copy; {new Date().getFullYear()} Pinnacle.ai. All rights reserved.</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> All systems operational
                </span>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: "X", href: "https://twitter.com/pinnacleai" },
                  { label: "LinkedIn", href: "https://linkedin.com/company/pinnacleai" },
                  { label: "GitHub", href: "https://github.com/pinnacleai" },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_PAGE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
    </div>
  );
}
