import React, { useState, useEffect } from "react";
import { runAITest, listAITests } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { 
  Search, ExternalLink, Loader2, AlertTriangle, Lightbulb, 
  Sparkles, Brain, FileText, Building2, ChevronDown, ChevronUp,
  Target, Zap, Award
} from "lucide-react";

export default function AITestsPage() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [showGeoDetails, setShowGeoDetails] = useState(false);

  useEffect(() => { loadTests(); }, []);
  const loadTests = async () => { 
    try { setTests(await listAITests()); } catch {} 
    setListLoading(false); 
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) return;
    setError("");
    setLoading(true);
    setShowGeoDetails(false);
    try { 
      const r = await runAITest(url.trim(), query.trim()); 
      setActiveResult(r); 
      loadTests(); 
    }
    catch (err) { setError(err.response?.data?.detail || "AI test failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-10" data-testid="ai-tests-page">
      <div>
        <h1 className="text-3xl lg:text-4xl font-thin text-white mb-2">AI Citation & Generation Tests</h1>
        <p className="text-gray-400 font-light">Test how likely AI engines are to cite and generate content from your page.</p>
      </div>

      <form onSubmit={handleTest} className="space-y-3" data-testid="ai-test-form">
        <input 
          data-testid="ai-test-url-input" 
          type="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://example.com/page" 
          className="glass-input w-full h-12 px-4 text-sm" 
          required 
        />
        <div className="flex gap-3">
          <input 
            data-testid="ai-test-query-input" 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search query (e.g., best CRM software)" 
            className="glass-input flex-1 h-12 px-4 text-sm" 
            required 
          />
          <button 
            data-testid="ai-test-submit-button" 
            type="submit" 
            disabled={loading} 
            className="h-12 px-6 rounded-xl bg-white text-black font-medium flex items-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Run Test"}
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
        <div className="space-y-6" data-testid="ai-test-result">
          {/* Main Scores Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Citation Probability Card */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-brand-blue" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Citation Probability</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-thin" style={{ color: getScoreColor(activeResult.citation_probability) }}>
                      {activeResult.citation_probability}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold" style={{ 
                    color: activeResult.likely_position === "Top 3" ? "#10B981" : 
                           activeResult.likely_position === "Top 5" ? "#F59E0B" : "#EF4444" 
                  }}>
                    {activeResult.likely_position}
                  </span>
                  <p className="text-xs text-gray-500">Est. Position</p>
                </div>
              </div>
              <a href={activeResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue hover:underline flex items-center gap-1 truncate">
                {activeResult.url} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <p className="text-xs text-gray-500 mt-1">Query: "{activeResult.query}" | Intent: {activeResult.intent}</p>
            </div>

            {/* GEO Score Card */}
            <div className="glass-card p-6 border-brand-teal/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">GEO Score</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/20 text-brand-teal font-medium">NEW</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-thin" style={{ color: getScoreColor(activeResult.geo_score || 0) }}>
                      {activeResult.geo_score || 0}%
                    </span>
                  </div>
                </div>
                {activeResult.detected_brand && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Building2 className="w-3 h-3" />
                      <span>{activeResult.detected_brand}</span>
                    </div>
                    <p className="text-xs text-gray-500">Detected Brand</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Generative Engine Optimization - How well AI can generate answers from your content</p>
            </div>
          </div>

          {/* Citation Breakdown */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-blue" />
              Citation Factors
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(activeResult.breakdown || {}).map(([key, val]) => (
                <div key={key} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                  <p className="text-xl font-light" style={{ color: getScoreColor(val) }}>{val}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{key.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GEO Breakdown */}
          <div className="glass-card p-5 border-brand-teal/10">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              GEO Factors
              <span className="text-xs text-gray-500 font-normal ml-auto">Generative Engine Optimization</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Generative Readiness</span>
                </div>
                <p className="text-2xl font-light" style={{ color: getScoreColor(activeResult.generative_readiness || 0) }}>
                  {activeResult.generative_readiness || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">How extractable for AI answers</p>
              </div>
              
              <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Summarization Resilience</span>
                </div>
                <p className="text-2xl font-light" style={{ color: getScoreColor(activeResult.summarization_resilience || 0) }}>
                  {activeResult.summarization_resilience || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Survives AI compression</p>
              </div>
              
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-gray-400">Brand Retention</span>
                </div>
                <p className="text-2xl font-light" style={{ color: getScoreColor(activeResult.brand_retention_probability || 0) }}>
                  {activeResult.brand_retention_probability || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Brand survives in AI output</p>
              </div>
            </div>
          </div>

          {/* GEO Insights - Expandable */}
          {activeResult.geo_insights && (
            <div className="glass-card overflow-hidden">
              <button 
                onClick={() => setShowGeoDetails(!showGeoDetails)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                data-testid="toggle-geo-details"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-teal" />
                  <span className="text-sm font-medium text-white">GEO Insights & Improvements</span>
                  <span className="text-xs text-gray-500">
                    ({activeResult.geo_insights.improvement_suggestions?.length || 0} suggestions)
                  </span>
                </div>
                {showGeoDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              
              {showGeoDetails && (
                <div className="px-5 pb-5 space-y-6 border-t border-white/5">
                  {/* Strengths */}
                  {activeResult.geo_insights.strengths?.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-xs font-medium text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Strengths ({activeResult.geo_insights.strengths.length})
                      </h4>
                      <div className="grid gap-2">
                        {activeResult.geo_insights.strengths.map((s, i) => (
                          <div key={i} className="rounded-lg bg-green-400/5 border border-green-400/10 px-3 py-2">
                            <p className="text-sm text-green-400">{s.strength}</p>
                            <p className="text-xs text-gray-500">{s.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {activeResult.geo_insights.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        Weaknesses ({activeResult.geo_insights.weaknesses.length})
                      </h4>
                      <div className="grid gap-2">
                        {activeResult.geo_insights.weaknesses.slice(0, 5).map((w, i) => (
                          <div key={i} className="rounded-lg bg-yellow-400/5 border border-yellow-400/10 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-yellow-400">{w.weakness}</p>
                              {w.severity && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                                  w.severity === 'critical' ? 'bg-red-400/20 text-red-400' :
                                  w.severity === 'high' ? 'bg-orange-400/20 text-orange-400' :
                                  w.severity === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                                  'bg-gray-400/20 text-gray-400'
                                }`}>{w.severity}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{w.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {activeResult.geo_insights.improvement_suggestions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-brand-teal uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" />
                        GEO Improvement Suggestions
                      </h4>
                      <div className="space-y-3">
                        {activeResult.geo_insights.improvement_suggestions.map((s, i) => (
                          <div key={i} className="rounded-xl bg-brand-teal/5 border border-brand-teal/10 p-4" data-testid={`geo-suggestion-${i}`}>
                            <p className="text-sm font-medium text-brand-teal mb-2">{s.issue}</p>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-gray-400 font-medium">Why it matters: </span>
                                <span className="text-gray-500">{s.why_it_matters_for_generation}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 font-medium">How to fix: </span>
                                <span className="text-gray-500">{s.how_to_fix}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Legacy Citation Gaps & Suggestions */}
          {activeResult.why_not_cited?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Citation Gaps ({activeResult.why_not_cited.length})
              </h3>
              <div className="grid gap-2">
                {activeResult.why_not_cited.map((g, i) => (
                  <div key={i} className="rounded-lg bg-yellow-400/5 border border-yellow-400/10 px-3 py-2" data-testid={`gap-${i}`}>
                    <p className="text-sm font-medium text-yellow-400">{g.gap}</p>
                    <p className="text-xs text-gray-500">{g.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeResult.improvement_suggestions?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                <Lightbulb className="w-4 h-4 text-brand-blue" />
                Citation Improvements
              </h3>
              <div className="grid gap-2">
                {activeResult.improvement_suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg bg-brand-blue/5 border border-brand-blue/10 px-3 py-2" data-testid={`suggestion-${i}`}>
                    <span className="text-sm font-medium text-brand-blue">{s.suggestion}</span>
                    <p className="text-xs text-gray-500">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test History</h2>
        {listLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : tests.length === 0 ? (
          <div className="glass-card flex flex-col items-center py-12 text-center">
            <Search className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">No tests yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tests.map((t, i) => (
              <div key={i} className="glass-card flex items-center justify-between px-5 py-4" data-testid={`test-history-${i}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-sm font-semibold" style={{ color: getScoreColor(t.citation_probability) }}>
                        {t.citation_probability}%
                      </span>
                      <p className="text-[10px] text-gray-600">Citation</p>
                    </div>
                    {t.geo_score !== undefined && (
                      <div className="text-center border-l border-white/10 pl-3">
                        <span className="text-sm font-semibold" style={{ color: getScoreColor(t.geo_score) }}>
                          {t.geo_score}%
                        </span>
                        <p className="text-[10px] text-gray-600">GEO</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white truncate max-w-sm">{t.url}</p>
                    <p className="text-xs text-gray-500">"{t.query}"</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
