import React, { useState } from "react";
import { runAITest, runAITestingLab } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import {
  Search, ExternalLink, Loader2, AlertTriangle, Lightbulb,
  Sparkles, Brain, FileText, Building2, ChevronDown, ChevronUp,
  Target, Zap, Award, Lock, CheckCircle, XCircle, Info,
  Globe, Microscope,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGuestMode } from "../hooks/useGuestMode";
import GuestBanner from "../components/ui/GuestBanner";
import GuestLimitModal from "../components/modals/GuestLimitModal";
import LockedSection from "../components/ui/LockedSection";
import ENGINE_LOGOS from "../utils/engineLogos";

const ENGINE_ICONS = {
  chatgpt:    Brain,
  perplexity: Target,
  google_sge: Search,
  copilot:    Sparkles,
};

const ENGINE_BORDER = {
  chatgpt:    "rgba(52,211,153,0.2)",
  perplexity: "rgba(34,211,238,0.2)",
  google_sge: "rgba(99,102,241,0.2)",
  copilot:    "rgba(167,139,250,0.2)",
};

const GRADE_CLASS = {
  "A+": "text-emerald-400 bg-emerald-500/20",
  "A":  "text-emerald-400 bg-emerald-500/20",
  "B+": "text-green-400 bg-green-500/20",
  "B":  "text-green-400 bg-green-500/20",
  "C":  "text-yellow-400 bg-yellow-500/20",
  "D":  "text-orange-400 bg-orange-500/20",
  "F":  "text-red-400 bg-red-500/20",
};

const POSITION_CLASS = {
  "Top 3":      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Top 5":      "text-green-400 bg-green-500/10 border-green-500/20",
  "May Appear": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Low":        "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Very Low":   "text-red-400 bg-red-500/10 border-red-500/20",
};

const ALL_ENGINES = ["chatgpt", "perplexity", "google_sge", "copilot"];

export default function AIVisibilityLabPage({ onSignUp }) {
  const { user } = useAuth();
  const isPrivileged = user?.is_privileged || false;
  const {
    isGuest, remainingUses, hasReachedLimit, incrementUsage,
    showLimitModal, setShowLimitModal,
  } = useGuestMode("ai_visibility_lab");

  const effectiveIsGuest         = isPrivileged ? false : isGuest;
  const effectiveHasReachedLimit = isPrivileged ? false : hasReachedLimit;

  const [query, setQuery]                   = useState("");
  const [url, setUrl]                       = useState("");
  const [loading, setLoading]               = useState(false);
  const [citationResult, setCitationResult] = useState(null);
  const [engineResult, setEngineResult]     = useState(null);
  const [error, setError]                   = useState("");
  const [activeTab, setActiveTab]           = useState("citation");
  const [showGeoDetails, setShowGeoDetails] = useState(false);
  const [expandedEngines, setExpandedEngines] = useState({});

  const toggleExpand = (id) =>
    setExpandedEngines((prev) => ({ ...prev, [id]: !prev[id] }));

  const visibilityScore =
    citationResult && engineResult
      ? Math.round(
          (citationResult.citation_probability + engineResult.overall_stats.average_score) / 2
        )
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) return;

    if (effectiveIsGuest && effectiveHasReachedLimit) {
      setShowLimitModal(true);
      return;
    }
    if (effectiveIsGuest && !incrementUsage()) return;

    setError("");
    setLoading(true);
    setCitationResult(null);
    setEngineResult(null);
    setShowGeoDetails(false);
    setExpandedEngines({});

    try {
      const [citation, engine] = await Promise.all([
        runAITest(url.trim(), query.trim()),
        runAITestingLab(query.trim(), url.trim(), ALL_ENGINES),
      ]);
      setCitationResult(citation);
      setEngineResult(engine);
      setActiveTab("citation");
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const hasResults = citationResult && engineResult;

  return (
    <div className="space-y-8" data-testid="ai-visibility-lab-page">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          AI Visibility{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Lab
          </span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Run one analysis to see citation probability and engine readiness across all AI platforms.
        </p>
      </div>

      {effectiveIsGuest && (
        <GuestBanner remainingUses={remainingUses} onSignUp={onSignUp || (() => {})} />
      )}

      {/* Input Form */}
      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                Search Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., best project management software"
                className="glass-input w-full h-12 px-4 text-sm"
                required
                minLength={3}
                maxLength={200}
                disabled={effectiveIsGuest && effectiveHasReachedLimit}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                Page URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="glass-input w-full h-12 px-4 text-sm"
                required
                disabled={effectiveIsGuest && effectiveHasReachedLimit}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-12 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Microscope className="w-4 h-4" />}
              {loading
                ? "Analyzing..."
                : effectiveIsGuest && effectiveHasReachedLimit
                  ? "Sign In to Continue"
                  : "Run Analysis"}
            </button>
            {isGuest && hasReachedLimit && (
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                You've used all 2 free analyses.
              </p>
            )}
          </div>
        </form>
      </div>

      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={onSignUp || (() => {})}
        feature="AI Visibility Lab analyses"
      />

      {error && (
        <div className="glass-card border-red-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
              {(error.toLowerCase().includes("cloudflare") || error.toLowerCase().includes("403")) && (
                <p className="text-xs text-gray-600">
                  Some websites block automated analysis. Try a different URL.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card h-28" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
          <div className="glass-card h-12" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="glass-card h-64" style={{ background: "rgba(255,255,255,0.03)" }} />
        </div>
      )}

      {/* Results */}
      {hasResults && !loading && !(effectiveIsGuest && effectiveHasReachedLimit) && (
        <div className="space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 text-center" style={{ borderColor: "rgba(99,102,241,0.3)" }}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Visibility Score</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(visibilityScore) }}>
                {visibilityScore}
              </p>
              <p className="text-xs text-gray-600 mt-1">combined score</p>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Citation Probability</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(citationResult.citation_probability) }}>
                {citationResult.citation_probability}%
              </p>
              <p className="text-xs text-gray-600 mt-1">{citationResult.likely_position}</p>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Best Engine</p>
              {engineResult.overall_stats.best_engine ? (
                <>
                  <p className="text-base font-semibold text-white">
                    {engineResult.overall_stats.best_engine.name}
                  </p>
                  <p className="text-3xl font-bold mt-1" style={{ color: getScoreColor(engineResult.overall_stats.best_engine.score) }}>
                    {engineResult.overall_stats.best_engine.score}
                  </p>
                </>
              ) : (
                <p className="text-gray-600 mt-4">—</p>
              )}
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Query Relevance</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(engineResult.relevance.relevance_score) }}>
                {engineResult.relevance.relevance_score}
              </p>
              <p className="text-xs text-gray-600 mt-1">page-to-query match</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div
            className="flex gap-0 p-1 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "fit-content" }}
          >
            {[
              { id: "citation", label: "Citation Probability" },
              { id: "engine",   label: "Engine Readiness" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab 1: Citation Probability ─────────────────────────── */}
          {activeTab === "citation" && (
            <div className="space-y-4">

              {/* Main score cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Citation Probability</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-5xl font-bold" style={{ color: getScoreColor(citationResult.citation_probability) }}>
                        {citationResult.citation_probability}
                      </span>
                      <span className="text-2xl text-gray-600">%</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{citationResult.likely_position}</p>
                      <p className="text-xs text-gray-600">Est. Position</p>
                    </div>
                  </div>
                  <a
                    href={citationResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-xs text-blue-400 hover:underline flex items-center gap-1 truncate"
                  >
                    {citationResult.url} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="glass-card p-6" style={{ borderColor: "rgba(34,211,238,0.15)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">GEO Score</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-5xl font-bold" style={{ color: getScoreColor(citationResult.geo_score || 0) }}>
                        {citationResult.geo_score || 0}
                      </span>
                      <span className="text-2xl text-gray-600">%</span>
                    </div>
                    {citationResult.detected_brand && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Building2 className="w-3 h-3" />
                          <span>{citationResult.detected_brand}</span>
                        </div>
                        <p className="text-xs text-gray-600">Detected Brand</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Citation Parameters */}
              {citationResult.breakdown && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Citation Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                      { label: "Intent Match",   value: citationResult.breakdown.intent_match    || 0 },
                      { label: "Extractability", value: citationResult.breakdown.extractability  || 0 },
                      { label: "Authority",      value: citationResult.breakdown.authority        || 0 },
                      { label: "Schema Support", value: citationResult.breakdown.schema_support  || 0 },
                      { label: "Content Depth",  value: citationResult.breakdown.content_depth   || 0 },
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

              {/* GEO Breakdown */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Generative Readiness", value: citationResult.generative_readiness           || 0, icon: Brain,    color: "purple" },
                  { label: "Summarization",         value: citationResult.summarization_resilience       || 0, icon: FileText, color: "cyan"   },
                  { label: "Brand Retention",       value: citationResult.brand_retention_probability    || 0, icon: Award,    color: "amber"  },
                  { label: "Schema Support",        value: citationResult.breakdown?.schema_support      || 0, icon: Target,   color: "blue"   },
                ].map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <div key={i} className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 text-${metric.color}-400`} />
                        <span className="text-xs text-gray-500">{metric.label}</span>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: getScoreColor(metric.value) }}>
                        {metric.value}%
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* GEO Insights toggle */}
              {citationResult.geo_insights && (
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setShowGeoDetails(!showGeoDetails)}
                    className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-white">GEO Insights & Improvements</span>
                      <span className="text-xs text-gray-600">
                        ({citationResult.geo_insights.improvement_suggestions?.length || 0} suggestions)
                      </span>
                    </div>
                    {showGeoDetails
                      ? <ChevronUp className="w-4 h-4 text-gray-500" />
                      : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>
                  {showGeoDetails && (
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5">
                      {citationResult.geo_insights.improvement_suggestions?.slice(0, 5).map((s, i) => (
                        <div key={i} className="pt-4 rounded-xl bg-white/[0.02] p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium text-white">{s.issue}</span>
                            {s.impact && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                s.impact === "High"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}>
                                {s.impact}
                              </span>
                            )}
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

          {/* ── Tab 2: Engine Readiness ──────────────────────────────── */}
          {activeTab === "engine" && (
            <div className="space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Average Score</p>
                  <p className="text-4xl font-bold" style={{ color: getScoreColor(engineResult.overall_stats.average_score) }}>
                    {engineResult.overall_stats.average_score}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    across {engineResult.overall_stats.engines_analyzed} engine
                    {engineResult.overall_stats.engines_analyzed !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="glass-card p-5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Best Engine</p>
                  {engineResult.overall_stats.best_engine ? (
                    <>
                      <p className="text-base font-semibold text-white mt-0.5">
                        {engineResult.overall_stats.best_engine.name}
                      </p>
                      <p className="text-3xl font-bold mt-1" style={{ color: getScoreColor(engineResult.overall_stats.best_engine.score) }}>
                        {engineResult.overall_stats.best_engine.score}
                      </p>
                    </>
                  ) : <p className="text-gray-600">—</p>}
                </div>
                <div className="glass-card p-5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Query Relevance</p>
                  <p className="text-4xl font-bold" style={{ color: getScoreColor(engineResult.relevance.relevance_score) }}>
                    {engineResult.relevance.relevance_score}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">page-to-query match</p>
                </div>
              </div>

              {/* Relevance feedback */}
              <div className="glass-card p-4 flex items-start gap-3" style={{ borderColor: "rgba(99,102,241,0.25)" }}>
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-white">Relevance Analysis</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{engineResult.relevance.feedback}</p>
                  <div className="flex gap-4 pt-0.5">
                    {[
                      ["Title",    engineResult.relevance.title_match],
                      ["Headings", engineResult.relevance.heading_match],
                      ["Content",  engineResult.relevance.content_match],
                    ].map(([label, val]) => (
                      <span key={label} className="text-xs text-gray-600">
                        {label}: <span className="text-white font-medium">{val}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engine cards */}
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-white">Engine Results</h2>
                {engineResult.results.map((r) => {
                  const Icon       = ENGINE_ICONS[r.engine_id] || Brain;
                  const isExpanded = expandedEngines[r.engine_id];
                  const pos        = r.position_estimate;
                  const posClass   = POSITION_CLASS[pos?.bucket] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
                  const gradeClass = GRADE_CLASS[r.grade]        || "text-gray-400 bg-gray-500/20";

                  return (
                    <div
                      key={r.engine_id}
                      className="glass-card overflow-hidden"
                      style={{ borderColor: ENGINE_BORDER[r.engine_id] }}
                    >
                      <div className="p-5">

                        {/* Engine header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-sm"
                            >
                              {ENGINE_LOGOS[r.engine_id]
                                ? <img src={ENGINE_LOGOS[r.engine_id]} alt={r.engine_name} className="w-5 h-5 object-contain" />
                                : <Icon className="w-5 h-5 text-indigo-300" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-white">{r.engine_name}</span>
                                {r.rank === 1 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                                    #1 Best Match
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                                {r.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-baseline gap-1 justify-end">
                              <span className="text-3xl font-bold" style={{ color: getScoreColor(r.readiness_score) }}>
                                {r.readiness_score}
                              </span>
                              <span className="text-gray-600">/100</span>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end mt-1">
                              <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${gradeClass}`}>
                                Grade: {r.grade}
                              </span>
                              {pos && (
                                <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${posClass}`}>
                                  {pos.bucket}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {r.improvements?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Recommendations
                            </p>
                            <ul className="space-y-1.5">
                              {r.improvements.map((imp, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-xs"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Expand toggle */}
                        <button
                          onClick={() => toggleExpand(r.engine_id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 transition-colors mt-2"
                        >
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />}
                          {isExpanded ? "Hide" : "Show"} details
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                            {r.strengths?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Strengths
                                </p>
                                <ul className="space-y-1">
                                  {r.strengths.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-emerald-400">
                                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {r.weaknesses?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Weaknesses
                                </p>
                                <ul className="space-y-1">
                                  {r.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-red-400">
                                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>{w}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {r.priority_signals?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  What {r.engine_name} Prioritizes
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {r.priority_signals.map((sig, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400"
                                    >
                                      {sig}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Page info */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Page Information</span>
                  <a
                    href={engineResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:underline"
                  >
                    View Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Word Count</p>
                    <p className="text-sm font-medium text-white">
                      {engineResult.page_info?.word_count?.toLocaleString() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Has Schema</p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: engineResult.page_info?.has_schema ? "#34d399" : "#f87171" }}
                    >
                      {engineResult.page_info?.has_schema ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Schema Types</p>
                    <p className="text-sm font-medium text-white truncate">
                      {engineResult.page_info?.schema_types?.length
                        ? engineResult.page_info.schema_types.join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locked sections for guests */}
          {effectiveIsGuest && !effectiveHasReachedLimit && (
            <div className="space-y-4">
              <LockedSection
                title="Deep Competitive Analysis"
                description="Compare your citation probability against top-ranking pages and identify optimization gaps."
                onUnlock={onSignUp || (() => {})}
              />
              <LockedSection
                title="Save & Track Results"
                description="Access unlimited test history, trend analysis, and compare performance over time."
                onUnlock={onSignUp || (() => {})}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
