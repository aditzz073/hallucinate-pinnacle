import React, { useState } from "react";
import { compareCompetitors, sensitivityTest } from "../api";
import { ScoreBadge, getScoreColor } from "../components/ui/ScoreRing";
import { Swords, Loader2, Plus, X, ArrowRight, AlertTriangle } from "lucide-react";

export default function CompetitorPage() {
  const [query, setQuery] = useState("");
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [compUrls, setCompUrls] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const addCompUrl = () => { if (compUrls.length < 5) setCompUrls([...compUrls, ""]); };
  const removeCompUrl = (i) => { setCompUrls(compUrls.filter((_, idx) => idx !== i)); };
  const updateCompUrl = (i, val) => { const c = [...compUrls]; c[i] = val; setCompUrls(c); };

  const handleCompare = async (e) => {
    e.preventDefault();
    const validUrls = compUrls.filter((u) => u.trim());
    if (!query.trim() || !primaryUrl.trim() || !validUrls.length) return;
    setError("");
    setLoading(true);
    try {
      const data = await compareCompetitors(query.trim(), primaryUrl.trim(), validUrls);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Comparison failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl" data-testid="competitor-page">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Phase 9</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">Competitor Intelligence</h1>
        <p className="text-muted-foreground text-sm">Compare your page against competitors for a specific query.</p>
      </div>

      <form onSubmit={handleCompare} className="space-y-4 mb-8" data-testid="compare-form">
        <input data-testid="compare-query" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search query (e.g., best CRM software)" className="w-full h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Your URL</label>
          <input data-testid="compare-primary-url" type="url" value={primaryUrl} onChange={(e) => setPrimaryUrl(e.target.value)} placeholder="https://yoursite.com/page" className="w-full h-12 rounded-md border border-primary/30 bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mt-1" required />
        </div>
        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Competitor URLs</label>
          {compUrls.map((u, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <input data-testid={`compare-comp-url-${i}`} type="url" value={u} onChange={(e) => updateCompUrl(i, e.target.value)} placeholder={`Competitor ${i + 1} URL`} className="flex-1 h-10 rounded-md border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              {compUrls.length > 1 && <button type="button" onClick={() => removeCompUrl(i)} className="p-2 hover:bg-destructive/10 rounded-md"><X className="w-4 h-4" /></button>}
            </div>
          ))}
          {compUrls.length < 5 && <button type="button" onClick={addCompUrl} className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"><Plus className="w-3 h-3" /> Add competitor</button>}
        </div>
        <button data-testid="compare-submit" type="submit" disabled={loading} className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-sm flex items-center gap-2 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md mb-6">{error}</div>}

      {result && (
        <div className="space-y-6" data-testid="compare-result">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading font-semibold text-sm mb-1">Ranking Order</h3>
            <p className="text-xs text-muted-foreground mb-4">Query: "{result.query}" | Intent: {result.intent}</p>
            <div className="space-y-2">
              {result.ranking_order?.map((url, i) => {
                const sc = result.score_comparison?.find((s) => s.url === url);
                const isPrimary = sc?.is_primary;
                return (
                  <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-md ${isPrimary ? "bg-primary/10 border border-primary/30" : "bg-muted/50"}`} data-testid={`rank-${i}`}>
                    <span className="font-heading font-bold text-lg text-muted-foreground w-8">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{url} {isPrimary && <span className="text-primary text-xs">(You)</span>}</p>
                      <p className="text-xs text-muted-foreground">{sc?.page_type} | AEO: {sc?.aeo_score} | Position: {sc?.likely_position}</p>
                    </div>
                    <ScoreBadge score={sc?.citation_probability || 0} />
                  </div>
                );
              })}
            </div>
          </div>

          {result.gap_analysis?.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Gap Analysis</h3>
              {result.gap_analysis.map((ga, i) => (
                <div key={i} className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-2 truncate">vs {ga.competitor_url}</p>
                  {ga.gaps.length === 0 ? (
                    <p className="text-xs text-emerald-400">No significant gaps found - you're outperforming!</p>
                  ) : (
                    <div className="space-y-2">
                      {ga.gaps.map((g, j) => (
                        <div key={j} className="flex items-center gap-3 bg-muted/30 rounded-md px-4 py-2 text-xs">
                          <span className="font-medium w-32">{g.dimension}</span>
                          <span style={{ color: getScoreColor(g.your_score) }}>{g.your_score}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span style={{ color: getScoreColor(g.competitor_score) }}>{g.competitor_score}</span>
                          <span className="text-red-400 font-mono ml-2">-{g.gap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
