import React, { useState, useEffect } from "react";
import { runAITest, listAITests } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { 
  Search, ExternalLink, Loader2, AlertTriangle, Lightbulb, 
  Sparkles, Brain, FileText, Building2, ChevronDown, ChevronUp,
  Target, Zap, Award, Lock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGuestMode } from "../hooks/useGuestMode";
import GuestBanner from "../components/ui/GuestBanner";
import GuestLimitModal from "../components/modals/GuestLimitModal";
import LockedSection from "../components/ui/LockedSection";

export default function AITestsPage({ onSignUp }) {
  const { user } = useAuth();
  
  // Skip guest mode entirely for privileged users
  const isPrivileged = user?.is_privileged || false;
  const { isGuest, remainingUses, hasReachedLimit, incrementUsage, showLimitModal, setShowLimitModal } = useGuestMode('ai_tests');
  
  // Privileged users are never treated as guests
  const effectiveIsGuest = isPrivileged ? false : isGuest;
  const effectiveHasReachedLimit = isPrivileged ? false : hasReachedLimit;

  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [showGeoDetails, setShowGeoDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadTests();
    } else {
      setListLoading(false);
    }
  }, [user]);

  const loadTests = async () => { 
    try { setTests(await listAITests()); } catch {} 
    setListLoading(false); 
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) return;

    // If guest has reached limit (but not privileged), show modal immediately
    if (effectiveIsGuest && effectiveHasReachedLimit) {
      setShowLimitModal(true);
      return;
    }

    // Check guest limit before making API call (skip for privileged)
    if (effectiveIsGuest && !incrementUsage()) {
      return;
    }

    setError("");
    setLoading(true);
    setShowGeoDetails(false);
    try { 
      const r = await runAITest(url.trim(), query.trim()); 
      setActiveResult(r); 
      if (user) {
        loadTests();
      }
    }
    catch (err) { setError(err.response?.data?.detail || "AI test failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-8" data-testid="ai-tests-page">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          AI Citation & <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Generation</span> Tests
        </h1>
        <p className="text-gray-500">Test how likely AI engines are to cite and generate content from your page.</p>
      </div>

      {/* Guest Mode Banner */}
      {effectiveIsGuest && <GuestBanner remainingUses={remainingUses} onSignUp={onSignUp || (() => {})} />}

      {/* Form */}
      <div className="glass-card p-6">
        <form onSubmit={handleTest} className="space-y-4" data-testid="ai-test-form">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Page URL</label>
            <input 
              data-testid="ai-test-url-input" 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://example.com/page" 
              className="glass-input w-full h-12 px-4 text-sm" 
              required 
              disabled={effectiveIsGuest && effectiveHasReachedLimit}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Search Query</label>
              <input 
                data-testid="ai-test-query-input" 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="e.g., best CRM software" 
                className="glass-input w-full h-12 px-4 text-sm" 
                required 
                disabled={effectiveIsGuest && effectiveHasReachedLimit}
              />
            </div>
            <div className="flex items-end">
              <button 
                data-testid="ai-test-submit-button" 
                type="submit" 
                disabled={loading} 
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Analyzing..." : (effectiveIsGuest && effectiveHasReachedLimit ? "Sign In to Continue" : "Run Test")}
              </button>
            </div>
          </div>
          {isGuest && hasReachedLimit && (
            <p className="text-sm text-amber-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              You've used all 2 free tests. Click the button above to create an account.
            </p>
          )}
        </form>
      </div>

      {/* Guest Limit Modal */}
      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={onSignUp || (() => {})}
        feature="AI tests"
      />

      {error && (
        <div className="glass-card border-red-500/20 p-4" data-testid="ai-test-error">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
              {(error.toLowerCase().includes('cloudflare') || error.toLowerCase().includes('403')) && (
                <p className="text-xs text-gray-600">Some websites block automated analysis. Try a different URL.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hide results when guest reaches limit */}
      {activeResult && !(effectiveIsGuest && effectiveHasReachedLimit) && (
        <div className="space-y-4" data-testid="ai-test-result">
          {/* Main Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Citation Score */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">Citation Probability</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-5xl font-bold" style={{ color: getScoreColor(activeResult.citation_probability) }}>
                    {activeResult.citation_probability}
                  </span>
                  <span className="text-2xl text-gray-600">%</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{activeResult.likely_position}</p>
                  <p className="text-xs text-gray-600">Est. Position</p>
                </div>
              </div>
              <a href={activeResult.url} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs text-blue-400 hover:underline flex items-center gap-1 truncate">
                {activeResult.url} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            {/* GEO Score */}
            <div className="glass-card p-6 border-cyan-500/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">GEO Score</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">NEW</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-5xl font-bold" style={{ color: getScoreColor(activeResult.geo_score || 0) }}>
                    {activeResult.geo_score || 0}
                  </span>
                  <span className="text-2xl text-gray-600">%</span>
                </div>
                {activeResult.detected_brand && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Building2 className="w-3 h-3" />
                      <span>{activeResult.detected_brand}</span>
                    </div>
                    <p className="text-xs text-gray-600">Detected Brand</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Citation Parameters Breakdown */}
          {activeResult.breakdown && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Citation Parameters</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: "Intent Match", value: activeResult.breakdown.intent_match || 0, tooltip: "How well content matches search intent" },
                  { label: "Extractability", value: activeResult.breakdown.extractability || 0, tooltip: "How easily AI can extract key info" },
                  { label: "Authority", value: activeResult.breakdown.authority || 0, tooltip: "Technical authority signals" },
                  { label: "Schema Support", value: activeResult.breakdown.schema_support || 0, tooltip: "Structured data presence" },
                  { label: "Content Depth", value: activeResult.breakdown.content_depth || 0, tooltip: "Content comprehensiveness" },
                ].map((metric, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: getScoreColor(metric.value) }}>
                      {metric.value}%
                    </div>
                    <div className="text-xs text-gray-500">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GEO Breakdown Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Generative Readiness", value: activeResult.generative_readiness || 0, icon: Brain, color: "purple" },
              { label: "Summarization", value: activeResult.summarization_resilience || 0, icon: FileText, color: "cyan" },
              { label: "Brand Retention", value: activeResult.brand_retention_probability || 0, icon: Award, color: "amber" },
              { label: "Schema Support", value: activeResult.breakdown?.schema_support || 0, icon: Target, color: "blue" },
            ].map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 text-${metric.color}-400`} />
                    <span className="text-xs text-gray-500">{metric.label}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: getScoreColor(metric.value) }}>{metric.value}%</p>
                </div>
              );
            })}
          </div>

          {/* GEO Insights Toggle */}
          {activeResult.geo_insights && (
            <div className="glass-card overflow-hidden">
              <button 
                onClick={() => setShowGeoDetails(!showGeoDetails)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">GEO Insights & Improvements</span>
                  <span className="text-xs text-gray-600">({activeResult.geo_insights.improvement_suggestions?.length || 0} suggestions)</span>
                </div>
                {showGeoDetails ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              
              {showGeoDetails && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5">
                  {activeResult.geo_insights.improvement_suggestions?.slice(0, 5).map((s, i) => (
                    <div key={i} className="pt-4 rounded-xl bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white">{s.issue}</span>
                        {s.impact && <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{s.impact}</span>}
                      </div>
                      <p className="text-xs text-gray-500">{s.how_to_fix}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Locked Sections for Guests - hide when limit reached */}
      {effectiveIsGuest && activeResult && !effectiveHasReachedLimit && (
        <div className="space-y-4">
          <LockedSection
            title="Deep Competitive Analysis"
            description="Compare your citation probability against top-ranking pages and identify gaps in your AI optimization strategy."
            onUnlock={onSignUp || (() => {})}
          />
          <LockedSection
            title="Strategy Simulator Access"
            description="Simulate content optimizations and see projected improvements in citation probability before making changes."
            onUnlock={onSignUp || (() => {})}
          />
          <LockedSection
            title="Save & Track Results"
            description="Access unlimited test history, trend analysis, and compare performance across all your tested pages."
            onUnlock={onSignUp || (() => {})}
          />
        </div>
      )}

      {/* Test History - Only for logged in users */}
      {user && (
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test History</h2>
        {listLoading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : tests.length === 0 ? (
          <div className="glass-card flex flex-col items-center py-12 text-center">
            <Search className="w-8 h-8 text-gray-700 mb-3" />
            <p className="text-sm text-gray-600">No tests yet. Run your first test above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tests.slice(0, 10).map((t, i) => (
              <div key={i} className="glass-card flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</span>
                    {t.geo_score !== undefined && (
                      <>
                        <span className="text-gray-700">|</span>
                        <span className="text-sm font-semibold" style={{ color: getScoreColor(t.geo_score) }}>{t.geo_score}%</span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{t.url}</p>
                    <p className="text-xs text-gray-600 truncate">"{t.query}"</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 shrink-0">{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
