import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getOverview, getBillingStatus } from "../api";
import { useAuth } from "../context/AuthContext";
import { getScoreColor } from "../components/ui/ScoreRing";
import { isFreeTier } from "../utils/featureAccess";
import UsageWidget from "../components/ui/UsageWidget";
import {
  FileSearch, Search, Eye, Activity,
  ArrowRight, Zap, Target, ChevronRight, Sparkles, Rocket,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getHealthStatus = (score) => {
  if (score >= 80) return { label: "Elite", chipClass: "status-chip success" };
  if (score >= 60) return { label: "Strong", chipClass: "status-chip success" };
  if (score >= 40) return { label: "Building", chipClass: "status-chip warning" };
  if (score >= 20) return { label: "Improving", chipClass: "status-chip warning" };
  return { label: "Critical", chipClass: "status-chip danger" };
};

const generateCopilotInsight = (overview) => {
  const recentTest = overview?.recent_ai_tests?.[0];
  if (!recentTest) {
    return "Run your first AI citation test to see how AI engines like ChatGPT, Claude, and Perplexity discover your content.";
  }
  const avgScore = ((recentTest.citation_probability || 0) + (recentTest.geo_score || 0)) / 2;
  const citationScore = recentTest.citation_probability || 0;
  const geoScore = recentTest.geo_score || 0;
  if (avgScore < 30) {
    return `Your content isn't AI-friendly yet. Score ${Math.round(avgScore)}% means low visibility in generative answers. Priority: add structured data and clear definitions.`;
  }
  if (avgScore < 50) {
    if (citationScore < 40) {
      return `Citation gap detected: ${citationScore}% means AI rarely cites you. Quick win: add FAQ schema and attributable content blocks.`;
    }
    if (geoScore < 40) {
      return `Content structure needs polish: ${geoScore}% GEO score. AI can't extract your message cleanly. Add summaries and bullet-point key facts.`;
    }
    return `You're making progress at ${Math.round(avgScore)}%. Push to 60%+ by strengthening schema markup and brand mentions.`;
  }
  if (avgScore < 70) {
    const strength = citationScore > geoScore ? "citation" : "content structure";
    const weakness = citationScore > geoScore ? "GEO" : "citation";
    return `Solid foundation at ${Math.round(avgScore)}%. Your ${strength} score is a strength. Focus on improving your ${weakness} score for elite status.`;
  }
  return `Top tier at ${Math.round(avgScore)}%. AI engines consistently discover your content. Fine-tune brand attribution to lock in every mention.`;
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const deriveBrandFromUrl = (url) => {
  if (!url) return "Unknown";
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(normalized).hostname.replace(/^www\./i, "");
    const root = host.split(".")[0] || host;
    return toTitleCase(root.replace(/[-_]+/g, " "));
  } catch {
    return "Unknown";
  }
};

const getRecordBrand = (record) => {
  const explicitBrand =
    record?.brand ||
    record?.brand_name ||
    record?.brandName ||
    record?.domain_brand;

  if (explicitBrand && String(explicitBrand).trim()) {
    return String(explicitBrand).trim();
  }
  return deriveBrandFromUrl(record?.url);
};

const getPriorityActions = (overview) => {
  const recentTest = overview?.recent_ai_tests?.[0];
  if (!recentTest?.geo_insights_json?.improvement_suggestions) return [];
  return recentTest.geo_insights_json.improvement_suggestions.slice(0, 3).map(s => ({
    title: s.issue,
    detail: s.why_it_matters_for_generation,
    impact: s.impact || "Medium",
  }));
};

// Skeleton loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-7 w-52 rounded mb-2" />
          <div className="skeleton h-4 w-36 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl lg:col-span-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [overview, setOverview] = useState(null);
  const [billingStatus, setBillingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/health`).then(r => r.data).catch(() => ({ status: "error", database: "disconnected" })),
      getOverview().catch(() => null),
      getBillingStatus().catch(() => null),
    ]).then(([h, o, b]) => {
      setHealth(h);
      setOverview(o);
      setBillingStatus(b);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success") !== "true") return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 5;

    const clearSuccessFlag = () => {
      if (cancelled) return;
      navigate("/dashboard", { replace: true });
    };

    const syncSubscription = async () => {
      try {
        const refreshedUser = await refreshUser();
        if (cancelled) return;

        if (refreshedUser?.isSubscribed) {
          toast.success("Subscription activated");
          clearSuccessFlag();
          return;
        }
      } catch {
        // Continue retry loop for temporary failures.
      }

      attempts += 1;
      if (attempts < maxAttempts && !cancelled) {
        window.setTimeout(syncSubscription, 2500);
        return;
      }

      if (!cancelled) {
        toast.info("Payment received. Subscription activation may take a moment.");
        clearSuccessFlag();
      }
    };

    syncSubscription();

    return () => {
      cancelled = true;
    };
  }, [location.search, navigate, refreshUser]);

  if (loading) return <DashboardSkeleton />;

  const s = overview?.summary || {};
  const recentTest = overview?.recent_ai_tests?.[0];
  const aiVisibilityScore = recentTest
    ? Math.round((recentTest.citation_probability + (recentTest.geo_score || 0)) / 2)
    : s.average_citation_probability || 0;

  const healthStatus = getHealthStatus(aiVisibilityScore);
  const copilotInsight = generateCopilotInsight(overview);
  const priorityActions = getPriorityActions(overview);

  const performanceMetrics = recentTest ? [
    { label: "Citation", value: recentTest.citation_probability, desc: "AI citation likelihood" },
    { label: "Readiness", value: recentTest.geo_scores_json?.generative_readiness || 0, desc: "Content extractability" },
    { label: "Brand", value: recentTest.geo_scores_json?.brand_retention_probability || 0, desc: "Brand retention" },
    { label: "Schema", value: recentTest.engine_scores_json?.schema_support || 0, desc: "Structured data" },
  ] : [];

  const operationalCards = [
    { title: "Audits", icon: FileSearch, value: s.total_audits ?? 0, nav: "audits" },
    { title: "AI Tests", icon: Search, value: s.total_ai_tests ?? 0, nav: "ai-tests" },
    { title: "Monitored", icon: Eye, value: s.total_monitored_pages ?? 0, nav: "monitor" },
    { title: "Changes", icon: Activity, value: s.total_changes_detected ?? 0, nav: "changes" },
  ];

  const userName = user?.nickname || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const isFree = isFreeTier(user);
  const hasRunAudit = (s.total_audits ?? 0) > 0;

  // Billing usage data
  const usage = billingStatus?.usage || null;
  const plan = user?.plan || "free";
  const resetsAt = usage?.current_period_end || null;

  // Preview cards for free users
  const previewCards = [
    {
      title: "Strategy Simulator",
      desc: "See exactly which changes will lift your citation probability before implementing them.",
      plan: "Optimize",
      feature: "strategy_simulator",
    },
    {
      title: "Competitor Intelligence",
      desc: "Discover why competitors appear more in AI-generated answers than you do.",
      plan: "Optimize",
      feature: "competitor_intel",
    },
    {
      title: "AI Testing Lab",
      desc: "Test your content across ChatGPT, Claude, Gemini, and Perplexity simultaneously.",
      plan: "Discover",
      feature: "ai_testing_lab",
    },
    {
      title: "Page Monitoring",
      desc: "Automatically track when your AI visibility score changes over time.",
      plan: "Discover",
      feature: "monitoring",
    },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">

      {/* ── PAGE HEADER ─────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid="hero-panel">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2 capitalize">
            {greeting}, <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{userName}</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your AI visibility command centre
            {health?.database === "connected" && (
              <span style={{ color: "var(--muted-foreground)" }}> · System online</span>
            )}
          </p>
        </div>
        <span className={healthStatus.chipClass}>{healthStatus.label}</span>
      </div>

      {/* ── HERO CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score ring */}
        <div
          className="metric-card flex flex-col items-center justify-center text-center"
          style={{ minHeight: "200px" }}
        >
          <div className="flex items-center gap-1.5 mb-4">
            <Target className="w-3.5 h-3.5" style={{ color: "#4F46E5" }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4F46E5" }}>
              Visibility Index
            </p>
          </div>
          <div className="relative mb-3">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                stroke="url(#scoreGradientIndigo)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${aiVisibilityScore * 3.52} 352`}
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
              <defs>
                <linearGradient id="scoreGradientIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold" style={{ color: "#818CF8" }}>{aiVisibilityScore}</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {aiVisibilityScore < 30 && "Invisible to AI engines"}
            {aiVisibilityScore >= 30 && aiVisibilityScore < 50 && "Getting discovered"}
            {aiVisibilityScore >= 50 && aiVisibilityScore < 70 && "Solid AI presence"}
            {aiVisibilityScore >= 70 && "AI engine favourite"}
          </p>
        </div>

        {/* AI Strategic Insight */}
        <div
          className="lg:col-span-2 metric-card flex flex-col justify-between"
          style={{ minHeight: "200px", borderColor: "rgba(79,70,229,0.2)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: "#818CF8" }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818CF8" }}>
                AI Strategic Insight
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {copilotInsight}
            </p>
          </div>
          {priorityActions.length > 0 && (
            <button
              onClick={() => onNavigate && onNavigate("ai-tests")}
              className="self-start flex items-center gap-1.5 text-xs font-medium mt-4 transition-opacity hover:opacity-70"
              style={{ color: "#818CF8" }}
              data-testid="view-priority-fix-btn"
            >
              View recommendations
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── PERFORMANCE METRICS ─────────────────────────── */}
      {performanceMetrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {performanceMetrics.map((metric, i) => (
            <div key={i} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{ color: "var(--muted)" }}>{metric.label}</span>
                <span className="text-lg font-bold" style={{ color: getScoreColor(metric.value) }}>{metric.value}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, metric.value)}%`,
                    background: "linear-gradient(to right, #4F46E5, #7C3AED)",
                    transition: "width 0.8s ease-out",
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>{metric.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── PRIORITY ACTIONS ─────────────────────────────── */}
      {priorityActions.length > 0 && (
        <div data-testid="priority-actions">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" style={{ color: "#F59E0B" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Priority Actions</h2>
            <span className="text-xs" style={{ color: "var(--muted)" }}>{priorityActions.length} recommendations</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {priorityActions.map((action, i) => (
              <button
                key={i}
                onClick={() => onNavigate && onNavigate("ai-tests")}
                className="text-left metric-card hover:border-indigo-500/30 transition-colors group"
                data-testid={`priority-action-${i}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`status-chip ${action.impact === "High" ? "danger" : action.impact === "Medium" ? "warning" : "success"}`}
                    style={{ fontSize: "10px" }}
                  >
                    {action.impact}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--muted)" }} />
                </div>
                <h3 className="text-sm font-medium mb-1 line-clamp-1" style={{ color: "var(--foreground)" }}>{action.title}</h3>
                <p className="text-xs line-clamp-2" style={{ color: "var(--muted)" }}>{action.detail?.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── USAGE WIDGET (all plans) ─────────────────────── */}
      {usage && (
        <UsageWidget plan={plan} usage={usage} resetsAt={resetsAt} />
      )}

      {/* ── FREE USER: GET STARTED ────────────────────────── */}
      {isFree && (
        <div data-testid="free-user-get-started">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4" style={{ color: "#818CF8" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Unlock more with a plan
            </h2>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              — Choose a plan to access these features
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {previewCards.map((card) => (
              <button
                key={card.feature}
                onClick={() => navigate("/pricing")}
                className="text-left metric-card hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                style={{ opacity: 0.85 }}
              >
                {/* Lock overlay */}
                <div
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  style={{ background: "rgba(79,70,229,0.15)", color: "#818CF8" }}
                >
                  🔒 {card.plan}
                </div>
                <h3 className="text-sm font-medium mb-1.5 pr-16" style={{ color: "var(--foreground)" }}>
                  {card.title}
                </h3>
                <p className="text-xs line-clamp-2" style={{ color: "var(--muted)" }}>
                  {card.desc}
                </p>
                <span
                  className="mt-3 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: "#818CF8" }}
                >
                  View plans <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVITY COUNTS ──────────────────────────────── */}
      <div data-testid="operational-data">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Activity</h2>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {operationalCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => onNavigate && onNavigate(card.nav)}
                className="metric-card text-left hover:border-indigo-500/30 transition-colors group"
                data-testid={`op-card-${card.title.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 transition-colors" style={{ color: "var(--muted)" }} />
                  <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{card.value}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{card.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RECENT ACTIVITY TABLES ───────────────────────── */}
      {overview && (overview.recent_audits?.length > 0 || overview.recent_ai_tests?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Audits */}
          <div className="metric-card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Recent Audits</h3>
              <button
                onClick={() => onNavigate && onNavigate("audits")}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "#818CF8" }}
              >
                View all
              </button>
            </div>
            {overview.recent_audits?.length === 0 ? (
              <p className="px-5 py-4 text-xs" style={{ color: "var(--muted)" }}>No audits yet</p>
            ) : (
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>URL</th>
                    <th className="text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent_audits?.slice(0, 4).map((a, i) => (
                    <tr key={i}>
                      <td className="text-xs" style={{ color: "var(--muted)" }}>{getRecordBrand(a)}</td>
                      <td className="max-w-[170px] truncate font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{a.url}</td>
                      <td className="text-right font-bold text-sm" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent AI Tests */}
          <div className="metric-card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Recent AI Tests</h3>
              <button
                onClick={() => onNavigate && onNavigate("ai-tests")}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "#818CF8" }}
              >
                View all
              </button>
            </div>
            {overview.recent_ai_tests?.length === 0 ? (
              <p className="px-5 py-4 text-xs" style={{ color: "var(--muted)" }}>No tests yet</p>
            ) : (
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>URL</th>
                    <th className="text-right">Citation</th>
                    <th className="text-right">GEO</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent_ai_tests?.slice(0, 4).map((t, i) => (
                    <tr key={i}>
                      <td className="text-xs" style={{ color: "var(--muted)" }}>{getRecordBrand(t)}</td>
                      <td className="max-w-[140px] truncate font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{t.url}</td>
                      <td className="text-right font-bold text-sm" style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</td>
                      <td className="text-right font-bold text-sm" style={{ color: getScoreColor(t.geo_score) }}>
                        {t.geo_score !== undefined ? `${t.geo_score}%` : ","}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
