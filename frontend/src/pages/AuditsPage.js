import React, { useState, useEffect } from "react";
import { runAudit, listAudits } from "../api";
import { ScoreBadge, getScoreColor } from "../components/ui/ScoreRing";
import SeverityBadge from "../components/ui/Badges";
import { FileSearch, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function AuditsPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      const data = await listAudits();
      setAudits(data);
    } catch (e) { /* ignore */ }
    setListLoading(false);
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await runAudit(url.trim());
      setActiveResult(result);
      loadAudits();
    } catch (err) {
      setError(err.response?.data?.detail || "Audit failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl" data-testid="audits-page">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Phase 1</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">Page Audits</h1>
        <p className="text-muted-foreground text-sm">Analyze any URL for AI Engine Optimization signals.</p>
      </div>

      {/* Audit Form */}
      <form onSubmit={handleAudit} className="flex gap-3 mb-8" data-testid="audit-form">
        <input
          data-testid="audit-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page"
          className="flex-1 h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
          required
        />
        <button
          data-testid="audit-submit-button"
          type="submit"
          disabled={loading}
          className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-sm flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_15px_rgba(79,70,229,0.2)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
          {loading ? "Auditing..." : "Run Audit"}
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md mb-6" data-testid="audit-error">
          {error}
        </div>
      )}

      {/* Active Result */}
      {activeResult && <AuditResult result={activeResult} />}

      {/* History */}
      <div className="mt-10">
        <h2 className="font-heading font-semibold text-lg tracking-tight mb-4">Audit History</h2>
        {listLoading ? (
          <div className="text-muted-foreground text-sm">Loading...</div>
        ) : audits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No audits yet. Run your first audit above.</p>
        ) : (
          <div className="space-y-2">
            {audits.map((audit, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-card border border-border rounded-lg px-5 py-4 hover:border-primary/20 transition-all duration-200"
                data-testid={`audit-history-${i}`}
              >
                <div className="flex items-center gap-4">
                  <ScoreBadge score={audit.overall_score} />
                  <div>
                    <p className="text-sm font-medium truncate max-w-md">{audit.url}</p>
                    <p className="text-xs text-muted-foreground font-mono">{new Date(audit.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{audit.page_type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditResult({ result }) {
  const [showRecs, setShowRecs] = useState(true);
  const bd = result.breakdown || {};

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6" data-testid="audit-result">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-heading font-bold text-4xl" style={{ color: getScoreColor(result.overall_score) }}>
              {result.overall_score}
            </span>
            <span className="text-muted-foreground text-sm">/100 AEO Score</span>
          </div>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
            {result.url} <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-xs text-muted-foreground font-mono mt-1">Type: {result.page_type}</p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(bd).map(([key, val]) => (
          <div key={key} className="bg-muted rounded-lg p-4 text-center">
            <p className="font-heading font-bold text-xl" style={{ color: getScoreColor(val) }}>{val}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1 capitalize">{key}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div>
          <button
            onClick={() => setShowRecs(!showRecs)}
            className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-primary transition-colors duration-200"
            data-testid="toggle-recommendations"
          >
            {showRecs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Recommendations ({result.recommendations.length})
          </button>
          {showRecs && (
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="bg-muted/50 border border-border rounded-md p-4" data-testid={`recommendation-${i}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <SeverityBadge severity={rec.severity} />
                    <span className="text-sm font-medium">{rec.issue}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{rec.impact_explanation}</p>
                  <div className="flex items-start gap-2 text-xs text-primary/80">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{rec.how_to_fix}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
