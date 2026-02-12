import React, { useState, useEffect } from "react";
import { runAITest, listAITests } from "../api";
import { ScoreBadge, getScoreColor } from "../components/ui/ScoreRing";
import { Search, ArrowRight, ExternalLink, Loader2, AlertTriangle, Lightbulb } from "lucide-react";

export default function AITestsPage() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await listAITests();
      setTests(data);
    } catch (e) { /* ignore */ }
    setListLoading(false);
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await runAITest(url.trim(), query.trim());
      setActiveResult(result);
      loadTests();
    } catch (err) {
      setError(err.response?.data?.detail || "AI test failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl" data-testid="ai-tests-page">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Phase 2</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">AI Citation Tests</h1>
        <p className="text-muted-foreground text-sm">Test how likely AI engines are to cite your page for a specific query.</p>
      </div>

      {/* Test Form */}
      <form onSubmit={handleTest} className="space-y-3 mb-8" data-testid="ai-test-form">
        <div className="flex gap-3">
          <input
            data-testid="ai-test-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="flex-1 h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
            required
          />
        </div>
        <div className="flex gap-3">
          <input
            data-testid="ai-test-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query (e.g., best CRM software)"
            className="flex-1 h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
            required
          />
          <button
            data-testid="ai-test-submit-button"
            type="submit"
            disabled={loading}
            className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-sm flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_15px_rgba(79,70,229,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Testing..." : "Run Test"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md mb-6" data-testid="ai-test-error">
          {error}
        </div>
      )}

      {/* Active Result */}
      {activeResult && <AITestResult result={activeResult} />}

      {/* History */}
      <div className="mt-10">
        <h2 className="font-heading font-semibold text-lg tracking-tight mb-4">Test History</h2>
        {listLoading ? (
          <div className="text-muted-foreground text-sm">Loading...</div>
        ) : tests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tests yet. Run your first citation test above.</p>
        ) : (
          <div className="space-y-2">
            {tests.map((test, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-card border border-border rounded-lg px-5 py-4 hover:border-primary/20 transition-all duration-200"
                data-testid={`test-history-${i}`}
              >
                <div className="flex items-center gap-4">
                  <ScoreBadge score={test.citation_probability} />
                  <div>
                    <p className="text-sm font-medium truncate max-w-sm">{test.url}</p>
                    <p className="text-xs text-muted-foreground">Query: "{test.query}"</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {new Date(test.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AITestResult({ result }) {
  const bd = result.breakdown || {};
  const positionColor = result.likely_position === "Top 3" ? "#10B981"
    : result.likely_position === "Top 5" ? "#F59E0B"
    : result.likely_position === "Top 10" ? "#F97316" : "#EF4444";

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6" data-testid="ai-test-result">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-heading font-bold text-4xl" style={{ color: getScoreColor(result.citation_probability) }}>
              {result.citation_probability}%
            </span>
            <span className="text-muted-foreground text-sm">Citation Probability</span>
          </div>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
            {result.url} <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-xs text-muted-foreground font-mono mt-1">Query: "{result.query}" | Intent: {result.intent}</p>
        </div>
        <div className="text-right">
          <span className="font-heading font-bold text-lg" style={{ color: positionColor }}>
            {result.likely_position}
          </span>
          <p className="text-xs text-muted-foreground">Estimated Position</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(bd).map(([key, val]) => (
          <div key={key} className="bg-muted rounded-lg p-4 text-center">
            <p className="font-heading font-bold text-xl" style={{ color: getScoreColor(val) }}>{val}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{key.replace(/_/g, " ")}</p>
          </div>
        ))}
      </div>

      {/* Why Not Cited */}
      {result.why_not_cited?.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Why Not Cited ({result.why_not_cited.length} gaps)
          </h3>
          <div className="space-y-2">
            {result.why_not_cited.map((gap, i) => (
              <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-md px-4 py-3" data-testid={`gap-${i}`}>
                <p className="text-sm font-medium text-amber-400">{gap.gap}</p>
                <p className="text-xs text-muted-foreground mt-1">{gap.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {result.improvement_suggestions?.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            Improvements
          </h3>
          <div className="space-y-2">
            {result.improvement_suggestions.map((sug, i) => (
              <div key={i} className="bg-primary/5 border border-primary/20 rounded-md px-4 py-3" data-testid={`suggestion-${i}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-primary">{sug.suggestion}</span>
                  <span className={`text-[10px] font-mono uppercase ${sug.priority === "high" ? "text-red-400" : "text-amber-400"}`}>
                    {sug.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{sug.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
