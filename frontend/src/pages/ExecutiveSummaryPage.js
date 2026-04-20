import React, { useState, useEffect } from "react";
import { getExecutiveSummary } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { Loader2, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";

export default function ExecutiveSummaryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExecutiveSummary().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> 
          <span>Loading executive summary...</span>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Failed to load summary. Please try again.</p>
      </div>
    );
  }

  const h = data.overall_health || {};
  const cov = data.data_coverage || {};

  return (
    <div className="space-y-8" data-testid="executive-summary-page">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Executive <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Summary</span></h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>High-level AI discoverability health assessment.</p>
      </div>

      {/* Health Status */}
      <div className="glass-card p-6" data-testid="health-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                h.status === "strong" ? "bg-emerald-500" : 
                h.status === "moderate" ? "bg-amber-500" : 
                h.status === "weak" ? "bg-red-500" : "bg-gray-500"
              }`} />
              <span className="text-lg font-semibold text-white capitalize">{h.status || "Unknown"}</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xl">{h.summary}</p>
          </div>
          {h.score > 0 && (
            <div className="text-right">
              <p className="text-4xl font-bold" style={{ color: getScoreColor(h.score) }}>{h.score}</p>
              <p className="text-xs text-gray-500">Health Score</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          {h.average_aeo_score > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2">
              <span className="text-xs text-gray-500">Avg AEO: </span>
              <span className="text-sm font-medium" style={{ color: getScoreColor(h.average_aeo_score) }}>{h.average_aeo_score}</span>
            </div>
          )}
          {h.average_citation_probability > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2">
              <span className="text-xs text-gray-500">Avg Citation: </span>
              <span className="text-sm font-medium" style={{ color: getScoreColor(h.average_citation_probability) }}>{h.average_citation_probability}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Coverage */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Audits", value: cov.total_audits },
          { label: "AI Tests", value: cov.total_ai_tests },
          { label: "Monitored", value: cov.monitored_pages },
          { label: "Changes", value: cov.total_changes },
          { label: "Negative", value: cov.negative_changes },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Key Weaknesses */}
      {data.key_weaknesses?.length > 0 && (
        <div className="glass-card p-6" data-testid="weaknesses-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Key Weaknesses
          </h3>
          <div className="space-y-2">
            {data.key_weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3" data-testid={`weakness-${i}`}>
                <span className={`text-xs font-medium uppercase px-2 py-0.5 rounded ${
                  w.severity === "high" ? "bg-red-400/10 text-red-400 border border-red-400/20" : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                }`}>{w.severity}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{w.category}</p>
                  <p className="text-xs text-gray-500">{w.description}</p>
                </div>
                {w.average_score > 0 && <span className="text-sm font-medium" style={{ color: getScoreColor(w.average_score) }}>{w.average_score}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highest Impact */}
      {data.highest_impact_improvement && (
        <div className="glass-card p-6 border-primary/20" data-testid="impact-card">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" /> Highest Impact Improvement
          </h3>
          {data.highest_impact_improvement.issue && (
            <p className="text-sm font-medium text-primary mb-2">{data.highest_impact_improvement.issue}</p>
          )}
          <p className="text-sm text-gray-400">{data.highest_impact_improvement.recommendation}</p>
          {data.highest_impact_improvement.affected_audits && (
            <p className="text-xs text-gray-600 mt-3">
              Affects {data.highest_impact_improvement.affected_audits} audits | Impact: {data.highest_impact_improvement.estimated_impact}
            </p>
          )}
        </div>
      )}

      {/* Competitive Standing */}
      {data.competitive_standing && (
        <div className="glass-card p-6" data-testid="standing-card">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Competitive Standing
          </h3>
          <p className="text-sm text-gray-400">{data.competitive_standing.summary}</p>
        </div>
      )}
    </div>
  );
}
