import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";
import ENGINE_LOGOS from "../../utils/engineLogos";
import SectionWrapper from "../../hoc/SectionWrapper";
import { slideInLeft, slideInRight } from "../../utils/motion";

const SIM_STEPS = [
  { step: "01", label: "Analyze your current AI visibility score" },
  { step: "02", label: "Simulate content improvements" },
  { step: "03", label: "Predict ranking and citation impact" },
  { step: "04", label: "Deploy the best-performing strategy" },
];

const ENGINE_DELTAS = [
  { name: "ChatGPT",    delta: 12, color: "#34d399", logo: ENGINE_LOGOS.chatgpt    },
  { name: "Perplexity", delta: 9,  color: "#22d3ee", logo: ENGINE_LOGOS.perplexity },
  { name: "Google SGE", delta: 7,  color: "#a3e635", logo: ENGINE_LOGOS.google_sge },
  { name: "Copilot",    delta: 5,  color: "#a78bfa", logo: ENGINE_LOGOS.copilot    },
];

export default function StrategySimulatorSection({ onNavigate }) {
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper
      className="py-24 px-8"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <motion.div variants={slideInLeft}>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: "#a3e635" }}>
              STRATEGY SIMULATOR
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[11px] font-mono tracking-wider"
              style={{
                background: "rgba(163,230,53,0.1)",
                border: "1px solid rgba(163,230,53,0.3)",
                color: "var(--primary)",
              }}
            >
              <Target className="w-3.5 h-3.5" />
              Optimize Feature
            </div>

            <h2
              className="font-display text-4xl lg:text-[42px] font-bold mb-4"
              style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
            >
              Strategy Simulator
            </h2>

            <p className="text-base md:text-lg mb-10 leading-relaxed max-w-[560px]" style={{ color: "#94A3B8" }}>
              Simulate optimization strategies and predict how changes impact AI visibility.
            </p>

            <p className="text-xs font-medium mb-6" style={{ color: "#a3e635" }}>
              Preview available on landing. Full simulator runs are part of paid plans.
            </p>

            <div className="space-y-4 mb-8">
              {SIM_STEPS.map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "rgba(163,230,53,0.15)",
                      color: "#a3e635",
                      border: "1px solid rgba(163,230,53,0.25)",
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
              onClick={() => onNavigate?.("simulator")}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)] bg-primary text-black hover:bg-primary-hover"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              Try Strategy Simulator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* ── Right: UI mockup ───────────────────────────────────────── */}
          <motion.div
            className="transition-transform duration-300 hover:scale-[1.02]"
            variants={slideInRight}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "#09090b",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 60px rgba(163,230,53,0.08)",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#141418" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
                  Pinnacle // Simulator
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Input fields */}
                <div
                  className="rounded-[12px] p-5 space-y-4 relative overflow-hidden"
                  style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Target URL</p>
                    <div
                      className="h-10 rounded flex items-center px-4"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-[13px] text-white">
                        https://yoursite.com/pricing
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Simulated Change</p>
                    <div
                      className="h-10 rounded flex items-center px-4"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-[13px] text-white">
                        Added nested FAQ schema blocks
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-11 rounded flex items-center justify-center text-[13px] font-bold mt-6 cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.15)] transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--primary)", color: "#000" }}
                  >
                    Run Simulation
                  </div>
                </div>

                {/* Before → After metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-[12px] p-4 flex flex-col items-center justify-center"
                    style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-3 text-center">AI Visibility</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-medium text-muted-foreground line-through opacity-60">72</span>
                      <span className="text-xs text-primary">→</span>
                      <span className="text-3xl font-display font-bold text-white">86</span>
                    </div>
                  </div>
                  <div
                    className="rounded-[12px] p-4 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ background: "rgba(163,230,53,0.05)", border: "1px solid rgba(163,230,53,0.3)" }}
                  >
                    <p className="text-[10px] font-mono tracking-widest text-primary uppercase mb-3 text-center font-bold">Citation Prob.</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-medium text-muted-foreground line-through opacity-60">58%</span>
                      <span className="text-xs text-primary">→</span>
                      <span className="text-3xl font-display font-bold text-primary">79%</span>
                    </div>
                  </div>
                </div>

                {/* Engine impact bars */}
                <div
                  className="rounded-[12px] p-5 space-y-3"
                  style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-4 text-center">
                    Projected Engine Impact
                  </p>
                  {ENGINE_DELTAS.map((e) => (
                    <div key={e.name} className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 w-24 shrink-0">
                        <span className="text-[11px] truncate text-muted-foreground">{e.name}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${e.delta * 7}%`, background: e.color }}
                        />
                      </div>
                      <span className="text-[12px] w-8 text-right font-bold" style={{ color: e.color }}>
                        +{e.delta}
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
