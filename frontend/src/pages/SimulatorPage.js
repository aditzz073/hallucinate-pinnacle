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
    <div className="space-y-8" data-testid="simulator-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Strategy Simulator</h1>
        <p>Simulate content optimizations and see projected impact on citation probability.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSimulate} className="space-y-4" data-testid="simulator-form">
        <input 
          data-testid="sim-url-input" 
          type="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://example.com/page" 
          className="glass-input w-full h-12 px-4 text-sm" 
          required 
        />
        <input 
          data-testid="sim-query-input" 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search query to test against" 
          className="glass-input w-full h-12 px-4 text-sm" 
          required 
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStrategy(s.id)}
              data-testid={`strategy-${s.id}`}
              className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                strategy === s.id 
                  ? "border-brand-blue/50 bg-brand-blue/10" 
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </button>
          ))}
        </div>

        <button 
          data-testid="sim-submit" 
          type="submit" 
          disabled={loading} 
          className="btn-primary"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
          {loading ? "Simulating..." : "Run Simulation"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="glass-card p-6 space-y-6" data-testid="sim-result">
          {/* Delta hero */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-light" style={{ color: getScoreColor(result.original_probability) }}>{result.original_probability}%</p>
                <p className="text-xs text-gray-500 mt-1">Current</p>
                <p className="text-xs text-gray-600">{result.original_position}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600" />
              <div className="text-center">
                <p className="text-3xl font-light" style={{ color: getScoreColor(result.simulated_probability) }}>{result.simulated_probability}%</p>
                <p className="text-xs text-gray-500 mt-1">Simulated</p>
                <p className="text-xs text-gray-600">{result.simulated_position}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${result.improvement_delta > 0 ? "bg-emerald-400/10 border border-emerald-400/20" : "bg-white/5 border border-white/10"}`}>
              {result.improvement_delta > 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-gray-400" />}
              <span className={`text-2xl font-semibold ${result.improvement_delta > 0 ? "text-emerald-400" : "text-gray-400"}`}>
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
                <div key={key} className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
                  <p className="text-xs text-gray-500 mb-2 capitalize">{key.replace(/_/g, " ")}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm" style={{ color: getScoreColor(orig) }}>{orig}</span>
                    <ArrowRight className="w-3 h-3 text-gray-600" />
                    <span className="text-sm font-semibold" style={{ color: getScoreColor(sim) }}>{sim}</span>
                  </div>
                  {delta !== 0 && <p className={`text-xs mt-1 ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>{delta > 0 ? "+" : ""}{delta}</p>}
                </div>
              );
            })}
          </div>

          <p className="text-sm text-gray-400">{result.explanation}</p>

          {result.adjustments_applied?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Adjustments Applied</p>
              <ul className="space-y-1">
                {result.adjustments_applied.map((a, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-brand-blue" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
