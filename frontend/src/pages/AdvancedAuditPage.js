import React, { useState } from "react";
import { fetchAdvancedAuditPriorityFixes, fetchAdvancedAuditSkipReason, runAdvancedAuditWithQuery } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import SeverityBadge from "../components/ui/Badges";
import { Sparkles, ExternalLink, ChevronDown, ChevronUp, Loader2, Shield, Info, Download, AlertTriangle, Eye } from "lucide-react";
import { downloadAdvancedAuditReport } from "../utils/pdfReports";
import { useAuth } from "../context/AuthContext";

export default function AdvancedAuditPage() {
  const { user } = useAuth();
  const isPaidUser = Boolean(user?.isSubscribed || user?.isFoundingUser || user?.isPaidUser);
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);

  const loadAiSkipReason = async (auditId, searchQuery) => {
    try {
      const payload = await fetchAdvancedAuditSkipReason(auditId, searchQuery || null);
      setResult((prev) => {
        if (!prev || prev.id !== auditId) return prev;
        return {
          ...prev,
          ai_skip_reason: payload?.ai_skip_reason || "",
          ai_skip_reason_loading: false,
        };
      });
    } catch {
      setResult((prev) => {
        if (!prev || prev.id !== auditId) return prev;
        return {
          ...prev,
          ai_skip_reason: "We found risk signals that reduce AI visibility, but we could not generate the consultant summary right now.",
          ai_skip_reason_loading: false,
        };
      });
    }
  };

  const loadPriorityFixes = async (auditId) => {
    try {
      const payload = await fetchAdvancedAuditPriorityFixes(auditId, []);
      setResult((prev) => {
        if (!prev || prev.id !== auditId) return prev;
        return {
          ...prev,
          priority_fixes: Array.isArray(payload?.priority_fixes) ? payload.priority_fixes : [],
          priority_fixes_loading: false,
        };
      });
    } catch {
      setResult((prev) => {
        if (!prev || prev.id !== auditId) return prev;
        return {
          ...prev,
          priority_fixes: [],
          priority_fixes_loading: false,
        };
      });
    }
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const trimmedQuery = query.trim();
      const data = await runAdvancedAuditWithQuery(url.trim(), trimmedQuery || null);
      const shouldGenerateSkipReason = isPaidUser && (data?.overall_score || 0) < 80;
      setResult({
        ...data,
        ai_skip_reason: shouldGenerateSkipReason
          ? null
          : "This page has strong AI visibility signals and is generally ready for citation in AI-generated answers.",
        ai_skip_reason_loading: shouldGenerateSkipReason,
        priority_fixes: [],
        priority_fixes_loading: Boolean(isPaidUser),
      });
      if (shouldGenerateSkipReason && data?.id) {
        loadAiSkipReason(data.id, trimmedQuery);
      }
      if (isPaidUser && data?.id) {
        loadPriorityFixes(data.id);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Advanced audit failed");
    }
    setLoading(false);
  };

  const handleDownloadReport = () => {
    if (!result) return;

    setDownloadingReport(true);
    try {
      downloadAdvancedAuditReport({ result });
    } catch {
      setError("Failed to generate PDF report. Please try again.");
    }
    setDownloadingReport(false);
  };

  return (
    <div className="space-y-10" data-testid="advanced-audit-page">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Advanced <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Audit</span></h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Deep audit with explainability, historical intelligence, and integrity metadata.</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleAudit} className="space-y-4" data-testid="advanced-audit-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                Search Query
              </label>
              <input
                data-testid="advanced-audit-query-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., best men's running shoes"
                className="glass-input w-full h-12 px-4 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                Page URL
              </label>
              <input
                data-testid="advanced-audit-url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="glass-input w-full h-12 px-4 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                data-testid="advanced-audit-submit"
                type="submit"
                disabled={loading}
                className="btn-primary h-12 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Analyzing..." : "Deep Audit"}
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={!result || downloadingReport}
                className="btn-secondary h-12 px-5 rounded-xl flex items-center gap-2 disabled:opacity-50"
                data-testid="advanced-audit-download-pdf"
              >
                <Download className="w-4 h-4" />
                {downloadingReport ? "Generating PDF..." : "Download PDF Report"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="advanced-audit-error">{error}</div>}

      {result && <AdvancedResult result={result} isPaidUser={isPaidUser} />}
    </div>
  );
}

function AdvancedResult({ result, isPaidUser }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const ex = result.explainability || {};
  const integrity = result.audit_integrity || {};
  const isLowVisibility = (result.overall_score || 0) < 80;

  return (
    <div className="space-y-6" data-testid="advanced-result">
      {isPaidUser && (
        <AISkipReasonCard
          isLowVisibility={isLowVisibility}
          loading={Boolean(result.ai_skip_reason_loading)}
          text={result.ai_skip_reason}
        />
      )}

      {isPaidUser && (
        <PriorityFixesSection
          loading={Boolean(result.priority_fixes_loading)}
          fixes={Array.isArray(result.priority_fixes) ? result.priority_fixes : []}
        />
      )}

      {/* Score + Integrity */}
      <div className="flex items-start justify-between glass-card p-6">
        <div>
          <span className="text-4xl font-bold" style={{ color: getScoreColor(result.overall_score) }}>{result.overall_score}</span>
          <span className="text-xs text-gray-600 ml-2">/100 AEO Score</span>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary mt-2 hover:underline flex items-center gap-1">
            {result.url} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 text-right" data-testid="audit-integrity">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-green-400">Deterministic</span>
          </div>
          <p className="text-[10px] text-gray-500">v{integrity.scoring_version} | {integrity.total_signals_evaluated} signals</p>
        </div>
      </div>

      {/* Explainability Cards */}
      <div className="space-y-3">
        {Object.entries(ex).map(([category, data]) => (
          <ExplainCard
            key={category}
            category={category}
            data={data}
            expanded={expandedCat === category}
            onToggle={() => setExpandedCat(expandedCat === category ? null : category)}
          />
        ))}
      </div>

      {/* Historical Intelligence */}
      {result.historical_intelligence?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Historical Intelligence</h3>
          <div className="space-y-2">
            {result.historical_intelligence.slice(0, 5).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-md px-4 py-3 text-xs" data-testid={`hist-rec-${i}`}>
                <SeverityBadge severity={rec.severity} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{rec.issue}</p>
                  {rec.historical && (
                    <p className="text-gray-400 mt-1">
                      {rec.historical.is_new_issue ? "New issue" : "Known issue"} - {rec.historical.change_explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function parseGainMidpoint(estimatedGain) {
  if (!estimatedGain) return 0;
  const nums = String(estimatedGain).match(/\d+/g) || [];
  if (nums.length >= 2) {
    const low = Number(nums[0]);
    const high = Number(nums[1]);
    return Math.round((low + high) / 2);
  }
  if (nums.length === 1) {
    return Number(nums[0]);
  }
  return 0;
}

function difficultyTone(difficulty) {
  const d = (difficulty || "medium").toLowerCase();
  if (d === "easy") return "bg-emerald-400";
  if (d === "hard") return "bg-rose-400";
  return "bg-amber-400";
}

function PriorityFixesSection({ loading, fixes }) {
  const totalImprovement = fixes.reduce((sum, fix) => sum + parseGainMidpoint(fix?.estimated_gain), 0);

  return (
    <div className="rounded-2xl bg-white/[0.02] p-5" data-testid="priority-fixes-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Fix This First</h3>
        <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Ranked by AI impact</span>
      </div>

      {loading ? (
        <div className="space-y-3" data-testid="priority-fixes-skeleton">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-xl bg-white/[0.03] p-4 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-3 bg-white/10 rounded w-5/6 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {fixes.slice(0, 6).map((fix, idx) => (
            <div key={`${fix.action}-${idx}`} className="rounded-xl bg-white/[0.03] px-4 py-4" data-testid={`priority-fix-${idx}`}>
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-white/5 text-zinc-200 flex items-center justify-center text-sm font-semibold shrink-0">
                  {fix.rank || idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-6">{fix.action}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-5">{fix.reason}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {(fix.engines_impacted || []).map((engine) => (
                      <span key={engine} className="px-2 py-1 rounded-full text-[10px] bg-white/5 text-zinc-300 border border-white/10">
                        {engine}
                      </span>
                    ))}
                    <span className="px-2 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                      {fix.estimated_gain}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] bg-white/5 text-zinc-300 border border-white/10 capitalize">
                      <span className={`h-1.5 w-1.5 rounded-full ${difficultyTone(fix.difficulty)}`} />
                      {fix.difficulty || "medium"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {fixes.length > 0 && (
            <p className="text-xs text-zinc-400 pt-2" data-testid="priority-fixes-total-improvement">
              Estimated total improvement if all fixes applied: +{totalImprovement} pts
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AISkipReasonCard({ isLowVisibility, loading, text }) {
  if (!isLowVisibility) {
    return (
      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-9 w-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-300/90 mb-1">Good AI Visibility</p>
            <p className="text-sm text-emerald-100/90 leading-6">
              {text || "This page has strong AI visibility signals and is generally ready for citation in AI-generated answers."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300/15 bg-zinc-950/80 pl-0 overflow-hidden">
      <div className="flex">
        <div className="w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-orange-500" />
        <div className="p-5 flex-1">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-300/25 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            </div>
            <div className="w-full">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-200/90 mb-1">Why AI Engines Skip This Page</p>
              {loading ? (
                <div className="space-y-2 mt-2" data-testid="ai-skip-reason-skeleton">
                  <div className="h-3 rounded bg-amber-100/10 animate-pulse w-full" />
                  <div className="h-3 rounded bg-amber-100/10 animate-pulse w-11/12" />
                  <div className="h-3 rounded bg-amber-100/10 animate-pulse w-10/12" />
                  <div className="h-3 rounded bg-amber-100/10 animate-pulse w-9/12" />
                </div>
              ) : (
                <p className="text-sm text-zinc-200/90 leading-6">{text}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplainCard({ category, data, expanded, onToggle }) {
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors duration-200" data-testid={`explain-${category}`}>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-xl" style={{ color: getScoreColor(data.score) }}>{data.score}</span>
          <span className="text-sm font-medium capitalize">{category}</span>
          <span className="text-xs text-gray-600">{data.contributing_factors?.length || 0} factors, {data.penalties?.length || 0} penalties</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4">
          {data.contributing_factors?.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Contributing Factors</p>
              {data.contributing_factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-emerald-400">+{f.contribution}</span>
                  <span className="text-gray-400">{f.reason}</span>
                </div>
              ))}
            </div>
          )}
          {data.penalties?.length > 0 && (
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Penalties</p>
              {data.penalties.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-red-400">-{p.penalty}</span>
                  <span className="text-gray-400">{p.reason}</span>
                </div>
              ))}
            </div>
          )}
          {data.evidence?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Evidence</p>
              {data.evidence.map((e, i) => (
                <p key={i} className="text-xs text-gray-400 py-0.5">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
