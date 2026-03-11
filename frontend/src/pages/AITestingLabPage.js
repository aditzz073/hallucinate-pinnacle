import React, { useState, useEffect } from "react";
import { runAITestingLab, getAIEngines } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import {
  Brain, Target, Search, Sparkles, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Info,
  ExternalLink, BarChart2, Zap, Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGuestMode } from "../hooks/useGuestMode";
import GuestBanner from "../components/ui/GuestBanner";
import GuestLimitModal from "../components/modals/GuestLimitModal";
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
  "Top 3":     "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Top 5":     "text-green-400 bg-green-500/10 border-green-500/20",
  "May Appear":"text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Low":       "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Very Low":  "text-red-400 bg-red-500/10 border-red-500/20",
};

const DEFAULT_ENGINES = [
  { id: "chatgpt",    name: "ChatGPT",           description: "Prioritizes well-structured, comprehensive content" },
  { id: "perplexity", name: "Perplexity",         description: "Craves structured data with strong citations" },
  { id: "google_sge", name: "Google SGE",         description: "Demands schema, E-E-A-T signals, and fresh content" },
  { id: "copilot",    name: "Microsoft Copilot",  description: "Prefers clear product/service data with schema" },
];

export default function AITestingLabPage({ onSignUp }) {
  const { user } = useAuth();
  const isPrivileged = user?.is_privileged || false;
  const {
    isGuest, remainingUses, hasReachedLimit, incrementUsage, showLimitModal, setShowLimitModal,
  } = useGuestMode("ai_testing_lab");

  const effectiveIsGuest         = isPrivileged ? false : isGuest;
  const effectiveHasReachedLimit = isPrivileged ? false : hasReachedLimit;

  const [query, setQuery]                   = useState("");
  const [url, setUrl]                       = useState("");
  const [selectedEngines, setSelectedEngines] = useState(["chatgpt", "perplexity", "google_sge", "copilot"]);
  const [loading, setLoading]               = useState(false);
  const [result, setResult]                 = useState(null);
  const [error, setError]                   = useState("");
  const [engines, setEngines]               = useState(DEFAULT_ENGINES);
  const [expandedEngines, setExpandedEngines] = useState({});

  useEffect(() => {
    getAIEngines()
      .then((data) => { if (data?.engines?.length) setEngines(data.engines); })
      .catch(() => {});
  }, []);

  const toggleEngine = (id) =>
    setSelectedEngines((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const toggleExpand = (id) =>
    setExpandedEngines((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim() || selectedEngines.length === 0) return;
    if (effectiveIsGuest && effectiveHasReachedLimit) { setShowLimitModal(true); return; }
    if (effectiveIsGuest && !incrementUsage()) return;

    setError("");
    setLoading(true);
    setResult(null);
    setExpandedEngines({});

    try {
      const data = await runAITestingLab(query.trim(), url.trim(), selectedEngines);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8" data-testid="ai-testing-lab-page">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          AI Testing{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Lab
          </span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Analyze citation readiness per-engine using each AI engine's unique weighting system.
        </p>
      </div>

      {effectiveIsGuest && (
        <GuestBanner remainingUses={remainingUses} onSignUp={onSignUp || (() => {})} />
      )}

      {/* ── Engine Selection + Form ─────────────────────────────── */}
      <div className="glass-card p-6 space-y-6">

        {/* Engine grid */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">
            Select AI Engines
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {engines.map((engine) => {
              const Icon     = ENGINE_ICONS[engine.id] || Brain;
              const selected = selectedEngines.includes(engine.id);
              return (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => toggleEngine(engine.id)}
                  disabled={effectiveIsGuest && effectiveHasReachedLimit}
                  className={`p-3 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    selected
                      ? "border-indigo-500/40 bg-indigo-500/10 text-white"
                      : "text-gray-500 hover:text-gray-400"
                  }`}
                  style={{ borderColor: selected ? undefined : "var(--border)", background: selected ? undefined : "transparent" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-white rounded-md p-1 flex items-center justify-center shadow-sm shrink-0">
                      {ENGINE_LOGOS[engine.id]
                        ? <img src={ENGINE_LOGOS[engine.id]} alt={engine.name} className="w-4 h-4 object-contain" />
                        : <Icon className={`w-4 h-4 ${selected ? "text-indigo-400" : "text-gray-600"}`} />}
                    </div>
                    <span className="text-xs font-semibold">{engine.name}</span>
                    {selected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </div>
                  <p
                    className="text-[10px] leading-snug"
                    style={{ color: selected ? "var(--text-muted)" : "#3a3a5a" }}
                  >
                    {engine.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex gap-4">
            <div className="flex-1">
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
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || selectedEngines.length === 0}
                className="btn-primary h-12 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <BarChart2 className="w-4 h-4" />}
                {loading
                  ? "Analyzing..."
                  : effectiveIsGuest && effectiveHasReachedLimit
                    ? "Sign In to Continue"
                    : "Analyze"}
              </button>
            </div>
          </div>
          {selectedEngines.length === 0 && (
            <p className="text-xs text-amber-400">Select at least one engine to analyze.</p>
          )}
        </form>
      </div>

      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={onSignUp || (() => {})}
        feature="AI Testing Lab analyses"
      />

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="glass-card border-red-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
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

      {/* ── Results ─────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-6">

          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Average Score</p>
              <p
                className="text-4xl font-bold"
                style={{ color: getScoreColor(result.overall_stats.average_score) }}
              >
                {result.overall_stats.average_score}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                across {result.overall_stats.engines_analyzed} engine{result.overall_stats.engines_analyzed !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Best Engine</p>
              {result.overall_stats.best_engine ? (
                <>
                  <p className="text-base font-semibold text-white mt-0.5">
                    {result.overall_stats.best_engine.name}
                  </p>
                  <p
                    className="text-3xl font-bold mt-1"
                    style={{ color: getScoreColor(result.overall_stats.best_engine.score) }}
                  >
                    {result.overall_stats.best_engine.score}
                  </p>
                </>
              ) : (
                <p className="text-gray-600">—</p>
              )}
            </div>

            <div className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Query Relevance</p>
              <p
                className="text-4xl font-bold"
                style={{ color: getScoreColor(result.relevance.relevance_score) }}
              >
                {result.relevance.relevance_score}
              </p>
              <p className="text-xs text-gray-600 mt-1">page-to-query match</p>
            </div>
          </div>

          {/* Relevance feedback */}
          <div
            className="glass-card p-4 flex items-start gap-3"
            style={{ borderColor: "rgba(99,102,241,0.25)" }}
          >
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white">Relevance Analysis</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {result.relevance.feedback}
              </p>
              <div className="flex gap-4 pt-0.5">
                {[
                  ["Title", result.relevance.title_match],
                  ["Headings", result.relevance.heading_match],
                  ["Content", result.relevance.content_match],
                ].map(([label, val]) => (
                  <span key={label} className="text-xs text-gray-600">
                    {label}: <span className="text-white font-medium">{val}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Engine result cards */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Engine Results</h2>

            {result.results.map((r) => {
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
                          <span
                            className="text-3xl font-bold"
                            style={{ color: getScoreColor(r.readiness_score) }}
                          >
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

                    {/* Expanded: Strengths + Weaknesses + Priority signals */}
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

          {/* Page information */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Page Information</span>
              <a
                href={result.url}
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
                  {result.page_info?.word_count?.toLocaleString() || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Has Schema</p>
                <p
                  className="text-sm font-medium"
                  style={{ color: result.page_info?.has_schema ? "#34d399" : "#f87171" }}
                >
                  {result.page_info?.has_schema ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Schema Types</p>
                <p className="text-sm font-medium text-white truncate">
                  {result.page_info?.schema_types?.length
                    ? result.page_info.schema_types.join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
