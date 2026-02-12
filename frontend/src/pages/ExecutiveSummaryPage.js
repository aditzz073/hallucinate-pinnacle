import React, { useState, useEffect } from "react";
import { getExecutiveSummary } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { Crown, Loader2, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";

export default function ExecutiveSummaryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExecutiveSummary().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading executive summary...</div>;
  if (!data) return <div className="text-gray-400 text-sm">Failed to load summary.</div>;

  const h = data.overall_health || {};
  const cov = data.data_coverage || {};

  return (
    <div className="max-w-5xl" data-testid="executive-summary-page">
      <div className="mb-0">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Phase 9</p>
        <h1 className="font-semibold text-3xl mb-2">Executive Summary</h1>
        <p className="text-gray-400 text-sm">High-level AI discoverability health assessment.</p>
      </div>

      {/* Health Status */}
      <div className="glass-card p-6 mb-6" data-testid="health-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${h.status === "strong" ? "bg-emerald-500" : h.status === "moderate" ? "bg-amber-500" : h.status === "weak" ? "bg-red-500" : "bg-zinc-500"}`} />
              <span className="font-semibold text-lg capitalize">{h.status || "Unknown"}</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xl">{h.summary}</p>
          </div>
          {h.score > 0 && (
            <div className="text-right">
              <p className="font-semibold text-4xl" style={{ color: getScoreColor(h.score) }}>{h.score}</p>
              <p className="text-xs text-gray-400">Health Score</p>
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          {h.average_aeo_score > 0 && (
            <div className="bg-muted rounded-md px-3 py-2"><span className="text-xs text-gray-400">Avg AEO: </span><span className="font-mono text-sm" style={{ color: getScoreColor(h.average_aeo_score) }}>{h.average_aeo_score}</span></div>
          )}
          {h.average_citation_probability > 0 && (
            <div className="bg-muted rounded-md px-3 py-2"><span className="text-xs text-gray-400">Avg Citation: </span><span className="font-mono text-sm" style={{ color: getScoreColor(h.average_citation_probability) }}>{h.average_citation_probability}%</span></div>
          )}
        </div>
      </div>

      {/* Data Coverage */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Audits", value: cov.total_audits },
          { label: "AI Tests", value: cov.total_ai_tests },
          { label: "Monitored", value: cov.monitored_pages },
          { label: "Changes", value: cov.total_changes },
          { label: "Negative", value: cov.negative_changes },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="font-semibold text-xl">{s.value}</p>
            <p className="text-[10px] text-gray-400 font-mono">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Key Weaknesses */}
      {data.key_weaknesses?.length > 0 && (
        <div className="glass-card p-6 mb-6" data-testid="weaknesses-card">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Key Weaknesses</h3>
          <div className="space-y-2">
            {data.key_weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3" data-testid={`weakness-${i}`}>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${w.severity === "high" ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>{w.severity}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{w.category}</p>
                  <p className="text-xs text-gray-400">{w.description}</p>
                </div>
                {w.average_score > 0 && <span className="font-mono text-sm" style={{ color: getScoreColor(w.average_score) }}>{w.average_score}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highest Impact */}
      {data.highest_impact_improvement && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 mb-6" data-testid="impact-card">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-brand-blue" /> Highest Impact Improvement</h3>
          {data.highest_impact_improvement.issue && <p className="text-sm font-medium text-brand-blue mb-1">{data.highest_impact_improvement.issue}</p>}
          <p className="text-sm text-gray-400">{data.highest_impact_improvement.recommendation}</p>
          {data.highest_impact_improvement.affected_audits && <p className="text-xs font-mono text-gray-400/60 mt-2">Affects {data.highest_impact_improvement.affected_audits} audits | Impact: {data.highest_impact_improvement.estimated_impact}</p>}
        </div>
      )}

      {/* Competitive Standing */}
      {data.competitive_standing && (
        <div className="glass-card p-6" data-testid="standing-card">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-brand-blue" /> Competitive Standing</h3>
          <p className="text-sm text-gray-400">{data.competitive_standing.summary}</p>
        </div>
      )}
    </div>
  );
}
