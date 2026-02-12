import React, { useState } from "react";
import { runAdvancedAudit } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import SeverityBadge from "../components/ui/Badges";
import { Sparkles, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Loader2, Shield, Info } from "lucide-react";

export default function AdvancedAuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await runAdvancedAudit(url.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Advanced audit failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10" data-testid="advanced-audit-page">
      <div>
        <h1 className="text-3xl lg:text-4xl font-thin text-white mb-2">Advanced Audit</h1>
        <p className="text-gray-400 font-light">Deep audit with explainability, historical intelligence, and integrity metadata.</p>
      </div>

      <form onSubmit={handleAudit} className="flex gap-3" data-testid="advanced-audit-form">
        <input
          data-testid="advanced-audit-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page"
          className="glass-input flex-1 h-12 px-4 text-sm"
          required
        />
        <button
          data-testid="advanced-audit-submit"
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-xl bg-white text-black font-medium flex items-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Analyzing..." : "Deep Audit"}
        </button>
      </form>

      {error && <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="advanced-audit-error">{error}</div>}

      {result && <AdvancedResult result={result} />}
    </div>
  );
}

function AdvancedResult({ result }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const ex = result.explainability || {};
  const integrity = result.audit_integrity || {};

  return (
    <div className="space-y-6" data-testid="advanced-result">
      {/* Score + Integrity */}
      <div className="flex items-start justify-between glass-card p-6">
        <div>
          <span className="text-5xl font-thin" style={{ color: getScoreColor(result.overall_score) }}>{result.overall_score}</span>
          <span className="text-gray-400 text-sm ml-2">/100 AEO Score</span>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-brand-blue mt-2 hover:underline flex items-center gap-1">
            {result.url} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 text-right" data-testid="audit-integrity">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-green-400">Deterministic</span>
          </div>
          <p className="text-[10px] text-gray-500">v{integrity.scoring_version} | {integrity.total_signals_evaluated} signals</p>
        </div>
      </div>

      {/* Explainability Cards */}
      <div className="space-y-3">
        {Object.entries(ex).map(([category, data]) => (
          <ExplainCard
            key={category}
            category={category}
            data={data}
            expanded={expandedCat === category}
            onToggle={() => setExpandedCat(expandedCat === category ? null : category)}
          />
        ))}
      </div>

      {/* Historical Intelligence */}
      {result.historical_intelligence?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Historical Intelligence</h3>
          <div className="space-y-2">
            {result.historical_intelligence.slice(0, 5).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-md px-4 py-3 text-xs" data-testid={`hist-rec-${i}`}>
                <SeverityBadge severity={rec.severity} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{rec.issue}</p>
                  {rec.historical && (
                    <p className="text-muted-foreground mt-1">
                      {rec.historical.is_new_issue ? "New issue" : "Known issue"} - {rec.historical.change_explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExplainCard({ category, data, expanded, onToggle }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors duration-200" data-testid={`explain-${category}`}>
        <div className="flex items-center gap-3">
          <span className="font-heading font-bold text-xl" style={{ color: getScoreColor(data.score) }}>{data.score}</span>
          <span className="text-sm font-medium capitalize">{category}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{data.contributing_factors?.length || 0} factors, {data.penalties?.length || 0} penalties</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {data.contributing_factors?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Contributing Factors</p>
              {data.contributing_factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-emerald-400 font-mono">+{f.contribution}</span>
                  <span className="text-muted-foreground">{f.reason}</span>
                </div>
              ))}
            </div>
          )}
          {data.penalties?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-2">Penalties</p>
              {data.penalties.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-red-400 font-mono">-{p.penalty}</span>
                  <span className="text-muted-foreground">{p.reason}</span>
                </div>
              ))}
            </div>
          )}
          {data.evidence?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">Evidence</p>
              {data.evidence.map((e, i) => (
                <p key={i} className="text-xs text-muted-foreground py-0.5 font-mono">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
