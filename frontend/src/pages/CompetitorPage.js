import React, { useState } from "react";
import { compareCompetitors } from "../api";
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
    <div className="space-y-8" data-testid="competitor-page">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Competitor <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Intelligence</span></h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Compare your page against competitors for a specific query.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleCompare} className="space-y-4" data-testid="compare-form">
        <input 
          data-testid="compare-query" 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search query (e.g., best CRM software)" 
          className="glass-input w-full h-12 px-4 text-sm" 
          required 
        />
        
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Your URL</label>
          <input 
            data-testid="compare-primary-url" 
            type="url" 
            value={primaryUrl} 
            onChange={(e) => setPrimaryUrl(e.target.value)} 
            placeholder="https://yoursite.com/page" 
            className="glass-input w-full h-12 px-4 text-sm border-primary/30" 
            required 
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Competitor URLs</label>
          {compUrls.map((u, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <input 
                data-testid={`compare-comp-url-${i}`} 
                type="url" 
                value={u} 
                onChange={(e) => updateCompUrl(i, e.target.value)} 
                placeholder={`Competitor ${i + 1} URL`} 
                className="glass-input flex-1 h-11 px-4 text-sm" 
              />
              {compUrls.length > 1 && (
                <button type="button" onClick={() => removeCompUrl(i)} className="p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              )}
            </div>
          ))}
          {compUrls.length < 5 && (
            <button type="button" onClick={addCompUrl} className="mt-3 text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add competitor
            </button>
          )}
        </div>
        
        <button data-testid="compare-submit" type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6" data-testid="compare-result">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Ranking Order</h3>
            <p className="text-xs text-gray-500 mb-4">Query: "{result.query}" | Intent: {result.intent}</p>
            <div className="space-y-2">
              {result.ranking_order?.map((url, i) => {
                const sc = result.score_comparison?.find((s) => s.url === url);
                const isPrimary = sc?.is_primary;
                return (
                  <div 
                    key={i} 
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl ${isPrimary ? "bg-primary/10 border border-primary/20" : "bg-white/[0.02] border border-white/5"}`} 
                    data-testid={`rank-${i}`}
                  >
                    <span className="text-lg font-semibold text-gray-500 w-8">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {url} {isPrimary && <span className="text-primary text-xs ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{sc?.page_type} | AEO: {sc?.aeo_score} | Position: {sc?.likely_position}</p>
                    </div>
                    <ScoreBadge score={sc?.citation_probability || 0} />
                  </div>
                );
              })}
            </div>
          </div>

          {result.gap_analysis?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Gap Analysis
              </h3>
              {result.gap_analysis.map((ga, i) => (
                <div key={i} className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 truncate">vs {ga.competitor_url}</p>
                  {ga.gaps.length === 0 ? (
                    <p className="text-xs text-emerald-400">No significant gaps found - you're outperforming!</p>
                  ) : (
                    <div className="space-y-2">
                      {ga.gaps.map((g, j) => (
                        <div key={j} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-2.5 text-xs">
                          <span className="font-medium text-gray-300 w-32">{g.dimension}</span>
                          <span style={{ color: getScoreColor(g.your_score) }}>{g.your_score}</span>
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                          <span style={{ color: getScoreColor(g.competitor_score) }}>{g.competitor_score}</span>
                          <span className="text-red-400 font-medium ml-2">-{g.gap}</span>
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
