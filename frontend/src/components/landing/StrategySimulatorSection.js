import React from "react";
import { ArrowRight, Target } from "lucide-react";
import ENGINE_LOGOS from "../../utils/engineLogos";

const SIM_STEPS = [
  { step: "01", label: "Analyze your current AI visibility score" },
  { step: "02", label: "Simulate content improvements" },
  { step: "03", label: "Predict ranking and citation impact" },
  { step: "04", label: "Deploy the best-performing strategy" },
];

const ENGINE_DELTAS = [
  { name: "ChatGPT",    delta: 12, color: "#34d399", logo: ENGINE_LOGOS.chatgpt    },
  { name: "Perplexity", delta: 9,  color: "#22d3ee", logo: ENGINE_LOGOS.perplexity },
  { name: "Google SGE", delta: 7,  color: "#818CF8", logo: ENGINE_LOGOS.google_sge },
  { name: "Copilot",    delta: 5,  color: "#a78bfa", logo: ENGINE_LOGOS.copilot    },
];

export default function StrategySimulatorSection({ onNavigate }) {
  return (
    <section
      className="py-24 px-8"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <div
            style={{ animation: "fadeUp 300ms ease both" }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-medium"
              style={{
                background: "rgba(79,70,229,0.12)",
                border: "1px solid rgba(79,70,229,0.3)",
                color: "#A5B4FC",
              }}
            >
              <Target className="w-3.5 h-3.5" />
              Flagship Feature
            </div>

            <h2
              className="font-display text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              Strategy Simulator
            </h2>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
              Simulate optimization strategies before publishing and predict how changes impact AI visibility.
            </p>

            <div className="space-y-4 mb-8">
              {SIM_STEPS.map((s) => (
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
              onClick={() => onNavigate?.("strategy-simulator")}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              }}
            >
              Open Strategy Simulator
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Right: UI mockup ───────────────────────────────────────── */}
          <div
            className="transition-transform duration-300 hover:scale-[1.02]"
            style={{ animation: "fadeUp 300ms ease 80ms both" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid rgba(79,70,229,0.25)",
                boxShadow: "0 0 60px rgba(79,70,229,0.08)",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-2 text-xs font-mono" style={{ color: "var(--muted)" }}>
                  Strategy Simulator
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Input fields */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <div>
                    <p className="text-xs mb-1.5 font-medium" style={{ color: "var(--muted)" }}>Content Change</p>
                    <div
                      className="h-8 rounded-lg flex items-center px-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                    >
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Add structured FAQ schema
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-1.5 font-medium" style={{ color: "var(--muted)" }}>Target Query</p>
                    <div
                      className="h-8 rounded-lg flex items-center px-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                    >
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        best running shoes under 10000
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-9 rounded-lg flex items-center justify-center text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff" }}
                  >
                    Run Simulation
                  </div>
                </div>

                {/* Before → After metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>AI Visibility</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-semibold" style={{ color: "var(--text-muted)" }}>72</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                      <span className="text-2xl font-bold" style={{ color: "#818CF8" }}>86</span>
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--surface-2)", border: "1px solid rgba(79,70,229,0.2)" }}
                  >
                    <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Citation Prob.</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-semibold" style={{ color: "var(--text-muted)" }}>58%</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                      <span className="text-2xl font-bold" style={{ color: "#34d399" }}>79%</span>
                    </div>
                  </div>
                </div>

                {/* Engine impact bars */}
                <div
                  className="rounded-xl p-4 space-y-2.5"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
                    Engine Impact
                  </p>
                  {ENGINE_DELTAS.map((e) => (
                    <div key={e.name} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-20 shrink-0">
                        <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm shrink-0">
                          <img src={e.logo} alt={e.name} className="w-3.5 h-3.5 object-contain" />
                        </div>
                        <span className="text-xs truncate" style={{ color: "var(--muted)" }}>{e.name}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${e.delta * 7}%`, background: e.color }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right font-bold" style={{ color: e.color }}>
                        +{e.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
