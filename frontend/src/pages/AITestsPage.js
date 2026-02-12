import React, { useState, useEffect } from "react";
import { runAITest, listAITests } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { Search, ArrowRight, ExternalLink, Loader2, AlertTriangle, Lightbulb } from "lucide-react";

export default function AITestsPage() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => { loadTests(); }, []);
  const loadTests = async () => { try { setTests(await listAITests()); } catch {} setListLoading(false); };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) return;
    setError("");
    setLoading(true);
    try { const r = await runAITest(url.trim(), query.trim()); setActiveResult(r); loadTests(); }
    catch (err) { setError(err.response?.data?.detail || "AI test failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-10" data-testid="ai-tests-page">
      <div>
        <h1 className="text-3xl lg:text-4xl font-thin text-white mb-2">AI Citation Tests</h1>
        <p className="text-gray-400 font-light">Test how likely AI engines are to cite your page for a specific query.</p>
      </div>

      <form onSubmit={handleTest} className="space-y-3" data-testid="ai-test-form">
        <input data-testid="ai-test-url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="glass-input w-full h-12 px-4 text-sm" required />
        <div className="flex gap-3">
          <input data-testid="ai-test-query-input" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search query (e.g., best CRM software)" className="glass-input flex-1 h-12 px-4 text-sm" required />
          <button data-testid="ai-test-submit-button" type="submit" disabled={loading} className="h-12 px-6 rounded-xl bg-white text-black font-medium flex items-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 disabled:opacity-50 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Testing..." : "Run Test"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-4" data-testid="ai-test-error">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
              {(error.toLowerCase().includes('cloudflare') || error.toLowerCase().includes('403') || error.toLowerCase().includes('access denied')) && (
                <div className="text-xs text-gray-500 border-t border-white/5 pt-2 mt-2">
                  <p className="font-medium text-gray-400 mb-1">Why does this happen?</p>
                  <p>Some websites use aggressive bot protection (like Cloudflare) that blocks automated analysis. E-commerce sites are especially strict about this.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeResult && (
        <div className="glass-card p-6 space-y-6" data-testid="ai-test-result">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl font-thin" style={{ color: getScoreColor(activeResult.citation_probability) }}>{activeResult.citation_probability}%</span>
                <span className="text-gray-400 text-sm">Citation Probability</span>
              </div>
              <a href={activeResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue hover:underline flex items-center gap-1">{activeResult.url} <ExternalLink className="w-3 h-3" /></a>
              <p className="text-xs text-gray-500 mt-1">Query: "{activeResult.query}" | Intent: {activeResult.intent}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold" style={{ color: activeResult.likely_position === "Top 3" ? "#10B981" : activeResult.likely_position === "Top 5" ? "#F59E0B" : "#EF4444" }}>{activeResult.likely_position}</span>
              <p className="text-xs text-gray-500">Est. Position</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {Object.entries(activeResult.breakdown || {}).map(([key, val]) => (
              <div key={key} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-center">
                <p className="text-xl font-light" style={{ color: getScoreColor(val) }}>{val}</p>
                <p className="text-xs text-gray-500 mt-1">{key.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>

          {activeResult.why_not_cited?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3"><AlertTriangle className="w-4 h-4 text-yellow-400" />Gaps ({activeResult.why_not_cited.length})</h3>
              <div className="space-y-2">{activeResult.why_not_cited.map((g, i) => (
                <div key={i} className="rounded-xl bg-yellow-400/5 border border-yellow-400/10 px-4 py-3" data-testid={`gap-${i}`}>
                  <p className="text-sm font-medium text-yellow-400">{g.gap}</p>
                  <p className="text-xs text-gray-500 mt-1">{g.detail}</p>
                </div>
              ))}</div>
            </div>
          )}

          {activeResult.improvement_suggestions?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3"><Lightbulb className="w-4 h-4 text-brand-blue" />Improvements</h3>
              <div className="space-y-2">{activeResult.improvement_suggestions.map((s, i) => (
                <div key={i} className="rounded-xl bg-brand-blue/5 border border-brand-blue/10 px-4 py-3" data-testid={`suggestion-${i}`}>
                  <span className="text-sm font-medium text-brand-blue">{s.suggestion}</span>
                  <p className="text-xs text-gray-500 mt-1">{s.detail}</p>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test History</h2>
        {listLoading ? <p className="text-sm text-gray-500">Loading...</p> : tests.length === 0 ? (
          <div className="glass-card flex flex-col items-center py-12 text-center"><Search className="w-8 h-8 text-gray-600 mb-3" /><p className="text-sm text-gray-500">No tests yet.</p></div>
        ) : (
          <div className="space-y-2">{tests.map((t, i) => (
            <div key={i} className="glass-card flex items-center justify-between px-5 py-4" data-testid={`test-history-${i}`}>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold" style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</span>
                <div><p className="text-sm text-white truncate max-w-sm">{t.url}</p><p className="text-xs text-gray-500">"{t.query}"</p></div>
              </div>
              <span className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString()}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
