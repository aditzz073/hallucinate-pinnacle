import React, { useState, useEffect } from "react";
import { runAudit, listAudits } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { FileSearch, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function AuditsPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => { loadAudits(); }, []);
  const loadAudits = async () => { try { setAudits(await listAudits()); } catch {} setListLoading(false); };

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try { const r = await runAudit(url.trim()); setActiveResult(r); loadAudits(); }
    catch (err) { setError(err.response?.data?.detail || "Audit failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-10" data-testid="audits-page">
      <div>
        <h1 className="text-3xl lg:text-4xl font-thin text-white mb-2">Page Audits</h1>
        <p className="text-gray-400 font-light">Analyze any URL for AI Engine Optimization signals.</p>
      </div>

      <form onSubmit={handleAudit} className="flex gap-3" data-testid="audit-form">
        <input data-testid="audit-url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="glass-input flex-1 h-12 px-4 text-sm" required />
        <button data-testid="audit-submit-button" type="submit" disabled={loading} className="h-12 px-6 rounded-xl bg-white text-black font-medium flex items-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 disabled:opacity-50 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
          {loading ? "Auditing..." : "Run Audit"}
        </button>
      </form>

      {error && <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="audit-error">{error}</div>}

      {activeResult && <AuditResult result={activeResult} />}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Audit History</h2>
        {listLoading ? <p className="text-sm text-gray-500">Loading...</p> : audits.length === 0 ? (
          <div className="glass-card flex flex-col items-center py-12 text-center">
            <FileSearch className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">No audits yet. Run your first audit above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {audits.map((a, i) => (
              <div key={i} className="glass-card flex items-center justify-between px-5 py-4" data-testid={`audit-history-${i}`}>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</span>
                  <div>
                    <p className="text-sm text-white truncate max-w-md">{a.url}</p>
                    <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 hidden sm:inline">{a.page_type}</span>
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
    <div className="glass-card p-6 space-y-6" data-testid="audit-result">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl font-thin" style={{ color: getScoreColor(result.overall_score) }}>{result.overall_score}</span>
            <span className="text-gray-400 text-sm">/100 AEO Score</span>
          </div>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue hover:underline flex items-center gap-1">{result.url} <ExternalLink className="w-3 h-3" /></a>
          <p className="text-xs text-gray-500 mt-1">Type: {result.page_type}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Object.entries(bd).map(([key, val]) => (
          <div key={key} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-center">
            <p className="text-xl font-light" style={{ color: getScoreColor(val) }}>{val}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{key}</p>
          </div>
        ))}
      </div>

      {result.recommendations?.length > 0 && (
        <div>
          <button onClick={() => setShowRecs(!showRecs)} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white mb-3 transition-colors" data-testid="toggle-recommendations">
            {showRecs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Recommendations ({result.recommendations.length})
          </button>
          {showRecs && (
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 p-4" data-testid={`recommendation-${i}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${rec.severity === "high" ? "bg-red-400/10 text-red-400" : rec.severity === "medium" ? "bg-yellow-400/10 text-yellow-400" : "bg-blue-400/10 text-blue-400"}`}>{rec.severity}</span>
                    <span className="text-sm font-medium text-white">{rec.issue}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{rec.impact_explanation}</p>
                  <div className="flex items-start gap-2 text-xs text-brand-blue"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /><span>{rec.how_to_fix}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
