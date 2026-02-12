import React, { useState } from "react";
import { simulateStrategy } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { FlaskConical, Loader2, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

const STRATEGIES = [
  { id: "addFAQ", label: "Add FAQ Section", desc: "Simulate adding structured FAQ with schema" },
  { id: "addSummary", label: "Add Summary Block", desc: "Simulate adding key takeaways section" },
  { id: "addSchema", label: "Add Structured Data", desc: "Simulate comprehensive JSON-LD markup" },
  { id: "improveAuthority", label: "Improve Authority", desc: "Simulate adding author, org, citations" },
];

export default function SimulatorPage() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [strategy, setStrategy] = useState("addFAQ");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await simulateStrategy(url.trim(), query.trim(), strategy);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Simulation failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10" data-testid="simulator-page">
      <div className="mb-0">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Phase 7</p>
        <h1 className="font-semibold text-3xl mb-2">Strategy Simulator</h1>
        <p className="text-gray-400 text-sm">Simulate content optimizations and see projected impact on citation probability.</p>
      </div>

      <form onSubmit={handleSimulate} className="space-y-4 mb-8" data-testid="simulator-form">
        <input data-testid="sim-url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="w-full h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring" required />
        <input data-testid="sim-query-input" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search query to test against" className="w-full h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring" required />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStrategy(s.id)}
              data-testid={`strategy-${s.id}`}
              className={`text-left p-4 rounded-lg border transition-all duration-200 ${strategy === s.id ? "border-primary bg-primary/10" : "border-white/5 bg-card hover:border-primary/30"}`}
            >
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-1">{s.desc}</p>
            </button>
          ))}
        </div>

        <button data-testid="sim-submit" type="submit" disabled={loading} className="h-12 px-6 bg-primary text-brand-blue-foreground font-medium rounded-sm flex items-center gap-2 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
          {loading ? "Simulating..." : "Run Simulation"}
        </button>
      </form>

      {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md mb-6">{error}</div>}

      {result && (
        <div className="glass-card p-6 space-y-6" data-testid="sim-result">
          {/* Delta hero */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="font-semibold text-3xl" style={{ color: getScoreColor(result.original_probability) }}>{result.original_probability}%</p>
                <p className="text-xs text-gray-400">Current</p>
                <p className="text-[10px] font-mono text-gray-400">{result.original_position}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div className="text-center">
                <p className="font-semibold text-3xl" style={{ color: getScoreColor(result.simulated_probability) }}>{result.simulated_probability}%</p>
                <p className="text-xs text-gray-400">Simulated</p>
                <p className="text-[10px] font-mono text-gray-400">{result.simulated_position}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${result.improvement_delta > 0 ? "bg-emerald-500/10" : "bg-zinc-500/10"}`}>
              {result.improvement_delta > 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-zinc-400" />}
              <span className={`font-semibold text-2xl ${result.improvement_delta > 0 ? "text-emerald-400" : "text-zinc-400"}`}>
                {result.improvement_delta > 0 ? "+" : ""}{result.improvement_delta}
              </span>
            </div>
          </div>

          {/* Breakdown comparison */}
          <div className="grid grid-cols-5 gap-3">
            {Object.keys(result.original_breakdown || {}).map((key) => {
              const orig = result.original_breakdown[key];
              const sim = result.simulated_breakdown[key];
              const delta = sim - orig;
              return (
                <div key={key} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                  <p className="text-xs text-gray-400 font-mono mb-2">{key.replace(/_/g, " ")}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm" style={{ color: getScoreColor(orig) }}>{orig}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-bold" style={{ color: getScoreColor(sim) }}>{sim}</span>
                  </div>
                  {delta !== 0 && <p className={`text-[10px] font-mono mt-1 ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>{delta > 0 ? "+" : ""}{delta}</p>}
                </div>
              );
            })}
          </div>

          <p className="text-sm text-gray-400">{result.explanation}</p>

          {result.adjustments_applied?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase mb-2">Adjustments Applied</p>
              <ul className="space-y-1">
                {result.adjustments_applied.map((a, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-2"><ArrowRight className="w-3 h-3 text-brand-blue" /> {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
