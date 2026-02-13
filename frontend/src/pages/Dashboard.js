import React, { useState, useEffect } from "react";
import { getOverview } from "../api";
import { useAuth } from "../context/AuthContext";
import { getScoreColor } from "../components/ui/ScoreRing";
import {
  FileSearch, Search, Eye, Activity, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight, Zap,
  Brain, Target, Award, Shield, ChevronRight, Sparkles,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Utility functions
const getHealthStatus = (score) => {
  if (score >= 60) return { label: "Strong", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
  if (score >= 40) return { label: "Needs Attention", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };
  return { label: "Critical", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" };
};

const getTrendIcon = (current, threshold = 50) => {
  if (current >= threshold) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  return <TrendingDown className="w-3.5 h-3.5 text-amber-400" />;
};

const generateCopilotInsight = (overview) => {
  const s = overview?.summary || {};
  const recentTest = overview?.recent_ai_tests?.[0];
  
  if (!recentTest) {
    return "Run your first AI test to receive personalized optimization insights.";
  }
  
  const geoScore = recentTest.geo_score || 0;
  const citationScore = recentTest.citation_probability || 0;
  const avgScore = (geoScore + citationScore) / 2;
  
  if (avgScore < 30) {
    return `Your content structure needs significant optimization. Focus on adding clear definitions and schema markup to improve AI citation likelihood by 20-30%.`;
  }
  if (avgScore < 50) {
    const topSuggestion = recentTest.geo_insights_json?.improvement_suggestions?.[0];
    if (topSuggestion) {
      return `${topSuggestion.issue}. ${topSuggestion.why_it_matters_for_generation?.slice(0, 100)}...`;
    }
    return `Your pages show moderate AI readiness. Implementing structured data and FAQ sections could boost citation probability by 10-15%.`;
  }
  return `Your content is performing well for AI discoverability. Consider fine-tuning brand attribution to maximize citation retention.`;
};

const getPriorityActions = (overview) => {
  const recentTest = overview?.recent_ai_tests?.[0];
  if (!recentTest?.geo_insights_json?.improvement_suggestions) return [];
  
  return recentTest.geo_insights_json.improvement_suggestions
    .slice(0, 3)
    .map(s => ({
      title: s.issue,
      detail: s.why_it_matters_for_generation,
      action: s.how_to_fix,
      impact: s.impact || "Medium",
    }));
};

// Progress Bar Component
const ProgressBar = ({ value, label, context, color = "brand-blue" }) => {
  const getBarColor = () => {
    if (value >= 60) return "bg-emerald-500";
    if (value >= 40) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-semibold" style={{ color: getScoreColor(value) }}>{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{context}</p>
    </div>
  );
};

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/health`).then(r => r.data).catch(() => ({ status: "error", database: "disconnected" })),
      getOverview().catch(() => null),
    ]).then(([h, o]) => {
      setHealth(h);
      setOverview(o);
      setLoading(false);
    });
  }, []);

  const s = overview?.summary || {};
  const recentTest = overview?.recent_ai_tests?.[0];
  
  // Calculate composite AI Visibility Score
  const aiVisibilityScore = recentTest 
    ? Math.round((recentTest.citation_probability + (recentTest.geo_score || 0)) / 2)
    : s.average_citation_probability || 0;
  
  const healthStatus = getHealthStatus(aiVisibilityScore);
  const copilotInsight = generateCopilotInsight(overview);
  const priorityActions = getPriorityActions(overview);

  // Performance breakdown from most recent test
  const performanceMetrics = recentTest ? [
    { label: "Citation Probability", value: recentTest.citation_probability, context: recentTest.likely_position || "Calculating..." },
    { label: "Generative Readiness", value: recentTest.geo_scores_json?.generative_readiness || 0, context: "How extractable for AI answers" },
    { label: "Brand Retention", value: recentTest.geo_scores_json?.brand_retention_probability || 0, context: "Brand survives in AI output" },
    { label: "Schema Support", value: recentTest.engine_scores_json?.schema_support || 0, context: "Structured data coverage" },
  ] : [];

  const operationalCards = [
    { title: "Audits", icon: FileSearch, value: s.total_audits ?? 0, nav: "audits" },
    { title: "AI Tests", icon: Search, value: s.total_ai_tests ?? 0, nav: "ai-tests" },
    { title: "Monitored", icon: Eye, value: s.total_monitored_pages ?? 0, nav: "monitor" },
    { title: "Changes", icon: Activity, value: s.total_changes_detected ?? 0, nav: "changes" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-brand-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* SECTION 1: AI Visibility Overview (Hero Panel) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/40 border border-white/10 p-8" data-testid="hero-panel">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-brand-teal/5 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Score + Status */}
          <div className="flex items-center gap-6">
            {/* Main Score Ring */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-light" style={{ color: getScoreColor(aiVisibilityScore) }}>
                    {aiVisibilityScore}
                  </span>
                  <span className="text-lg text-gray-500">%</span>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs text-gray-500">AI Visibility</span>
              </div>
            </div>
            
            {/* Score Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-white">
                  Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}
                </h1>
                {health?.database === "connected" && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                  </div>
                )}
              </div>
              
              {/* Health Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${healthStatus.bg} border ${healthStatus.border}`}>
                {healthStatus.label === "Strong" && <Shield className="w-4 h-4 text-emerald-400" />}
                {healthStatus.label === "Needs Attention" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {healthStatus.label === "Critical" && <XCircle className="w-4 h-4 text-red-400" />}
                <span className={`text-sm font-medium ${healthStatus.color}`}>
                  AI Health: {healthStatus.label}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right: Copilot Insight */}
          <div className="flex-1 lg:max-w-md">
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">AI Copilot Insight</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{copilotInsight}</p>
                </div>
              </div>
              {priorityActions.length > 0 && (
                <button 
                  onClick={() => onNavigate && onNavigate("ai-tests")}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-sm font-medium hover:bg-brand-teal/20 transition-colors"
                  data-testid="view-priority-fix-btn"
                >
                  View Priority Fix <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Priority Actions */}
      {priorityActions.length > 0 && (
        <div className="space-y-4" data-testid="priority-actions">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Priority Actions
            </h2>
            <span className="text-xs text-gray-500">{priorityActions.length} high-impact recommendations</span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {priorityActions.map((action, i) => (
              <div 
                key={i} 
                className="group rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-5 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => onNavigate && onNavigate("ai-tests")}
                data-testid={`priority-action-${i}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    action.impact === "High" ? "bg-red-400/10 text-red-400" :
                    action.impact === "Medium" ? "bg-amber-400/10 text-amber-400" :
                    "bg-emerald-400/10 text-emerald-400"
                  }`}>
                    {action.impact} Impact
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-medium text-white mb-2">{action.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{action.detail?.slice(0, 120)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Performance Breakdown */}
      {performanceMetrics.length > 0 && (
        <div className="space-y-4" data-testid="performance-breakdown">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-blue" />
            Performance Breakdown
          </h2>
          
          <div className="glass-card p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {performanceMetrics.map((metric, i) => (
                <ProgressBar 
                  key={i}
                  value={metric.value}
                  label={metric.label}
                  context={metric.context}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Operational Data (Secondary) */}
      <div className="space-y-4" data-testid="operational-data">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Operational Overview</h2>
        
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {operationalCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => onNavigate && onNavigate(card.nav)}
                className="group rounded-xl bg-white/[0.02] border border-white/5 p-4 text-left hover:bg-white/[0.04] hover:border-white/10 transition-all"
                data-testid={`op-card-${card.title.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  <span className="text-xl font-light text-white">{card.value}</span>
                </div>
                <p className="text-xs text-gray-600">{card.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity (Condensed) */}
      {overview && (overview.recent_audits?.length > 0 || overview.recent_ai_tests?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Audits */}
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Recent Audits</h3>
              <button 
                onClick={() => onNavigate && onNavigate("audits")}
                className="text-xs text-brand-blue hover:underline"
              >
                View all
              </button>
            </div>
            {overview.recent_audits?.length === 0 ? (
              <p className="text-xs text-gray-600">No audits yet</p>
            ) : (
              <div className="space-y-2">
                {overview.recent_audits?.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">{a.url}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(a.overall_score)}
                      <span className="text-sm font-medium" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent AI Tests */}
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Recent AI Tests</h3>
              <button 
                onClick={() => onNavigate && onNavigate("ai-tests")}
                className="text-xs text-brand-blue hover:underline"
              >
                View all
              </button>
            </div>
            {overview.recent_ai_tests?.length === 0 ? (
              <p className="text-xs text-gray-600">No tests yet</p>
            ) : (
              <div className="space-y-2">
                {overview.recent_ai_tests?.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-gray-500 truncate block max-w-[150px]">{t.url}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-gray-600">Citation</span>
                        <span className="text-sm font-medium ml-1" style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</span>
                      </div>
                      {t.geo_score !== undefined && (
                        <div className="text-right border-l border-white/10 pl-3">
                          <span className="text-xs text-gray-600">GEO</span>
                          <span className="text-sm font-medium ml-1" style={{ color: getScoreColor(t.geo_score) }}>{t.geo_score}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
