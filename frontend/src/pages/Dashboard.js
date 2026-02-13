import React, { useState, useEffect } from "react";
import { getOverview } from "../api";
import { useAuth } from "../context/AuthContext";
import { getScoreColor } from "../components/ui/ScoreRing";
import {
  FileSearch, Search, Eye, Activity, TrendingUp, TrendingDown,
  ArrowRight, Zap, Target, ChevronRight, Sparkles,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getHealthStatus = (score) => {
  if (score >= 60) return { label: "Strong", color: "text-emerald-400", dotColor: "bg-emerald-400" };
  if (score >= 40) return { label: "Moderate", color: "text-amber-400", dotColor: "bg-amber-400" };
  return { label: "Needs Work", color: "text-red-400", dotColor: "bg-red-400" };
};

const generateCopilotInsight = (overview) => {
  const recentTest = overview?.recent_ai_tests?.[0];
  if (!recentTest) {
    const onboardingMessages = [
      "🎯 Ready to dominate AI search? Launch your first test and unlock optimization superpowers.",
      "💡 Your AI visibility journey starts here. Run a test to see where you stand.",
      "🚀 Let's decode how AI engines see your content. Fire up your first analysis.",
    ];
    return onboardingMessages[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % onboardingMessages.length];
  }
  
  const avgScore = ((recentTest.citation_probability || 0) + (recentTest.geo_score || 0)) / 2;
  const citationScore = recentTest.citation_probability || 0;
  const geoScore = recentTest.geo_score || 0;
  
  // Critical issues (< 30)
  if (avgScore < 30) {
    return `⚠️ Alert: Your content isn't AI-friendly yet. Score ${Math.round(avgScore)}% means you're invisible to Claude, ChatGPT & Perplexity. Priority: Add structured data and clear definitions.`;
  }
  
  // Needs improvement (30-50)
  if (avgScore < 50) {
    if (citationScore < 40) {
      return `📊 Citation gap detected: ${citationScore}% means AI rarely cites you. Quick win: Add FAQ schema and attributable content blocks.`;
    }
    if (geoScore < 40) {
      return `🎨 Content structure needs polish: ${geoScore}% GEO score. AI can't extract your message cleanly. Add summaries and bullet-point key facts.`;
    }
    return `💪 You're getting there: ${Math.round(avgScore)}% puts you in the middle pack. Push to 60%+ by strengthening schema markup and brand mentions.`;
  }
  
  // Good performance (50-70)
  if (avgScore < 70) {
    const strength = citationScore > geoScore ? 'citation' : 'content structure';
    const weakness = citationScore > geoScore ? 'GEO' : 'citation';
    return `✨ Solid foundation: ${Math.round(avgScore)}% visibility. Your ${strength} shines, but boost your ${weakness} score for elite status.`;
  }
  
  // Excellent (70+)
  return `🏆 Crushing it: ${Math.round(avgScore)}% puts you in the top tier. AI engines love your content. Now fine-tune brand attribution to own every mention.`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.email?.split("@")[0] || "there";

  // Dynamic welcome messages that rotate
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const messages = {
      morning: [
        { greeting: "Rise and optimize", subtitle: "Your AI visibility command center awaits" },
        { greeting: "Morning, strategist", subtitle: "Let's dominate AI-generated results today" },
        { greeting: "Fresh start", subtitle: "Ready to boost your AI discoverability?" },
      ],
      afternoon: [
        { greeting: "Back to conquer", subtitle: "Your content's AI performance at a glance" },
        { greeting: "Afternoon sync", subtitle: "See how AI engines are discovering you" },
        { greeting: "Keep the momentum", subtitle: "Your AI optimization intel center" },
      ],
      evening: [
        { greeting: "Evening check-in", subtitle: "Track your AI visibility metrics" },
        { greeting: "Late-night optimization", subtitle: "Because great content never sleeps" },
        { greeting: "Wrapping up strong", subtitle: "Your AI performance snapshot" },
      ],
    };

    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const pool = messages[timeOfDay];
    const index = Math.floor(Date.now() / (1000 * 60 * 60 * 8)) % pool.length; // Rotates every 8 hours
    return pool[index];
  };

  const { greeting, subtitle } = getWelcomeMessage();

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Hero Section - Clean & Minimal */}
      <div className="space-y-6" data-testid="hero-panel">
        {/* Welcome & Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-1">
              {greeting}, <span className="capitalize bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${healthStatus.dotColor}`}></span>
            <span className={`text-sm font-medium ${healthStatus.color}`}>{healthStatus.label}</span>
            {health?.database === "connected" && (
              <span className="text-xs text-gray-600 ml-2">• System Online</span>
            )}
          </div>
        </div>

        {/* Main Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AI Visibility Score */}
          <div className="lg:col-span-1 glass-card p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">AI Visibility Score</p>
            <div className="relative mb-3">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="url(#scoreGradient)" 
                  strokeWidth="8" 
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${aiVisibilityScore * 3.52} 352`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#22D3D1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{aiVisibilityScore}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">out of 100</p>
          </div>

          {/* Copilot Insight */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">AI Copilot Insight</span>
              </div>
              <p className="text-lg text-white font-medium leading-relaxed mb-4">{copilotInsight}</p>
            </div>
            {priorityActions.length > 0 && (
              <button 
                onClick={() => onNavigate && onNavigate("ai-tests")}
                className="self-start flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors group"
                data-testid="view-priority-fix-btn"
              >
                View recommendations 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Performance Metrics Row */}
        {performanceMetrics.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {performanceMetrics.map((metric, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{metric.label}</span>
                  <span className="text-lg font-semibold" style={{ color: getScoreColor(metric.value) }}>{metric.value}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${Math.min(100, metric.value)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-2">{metric.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Priority Actions */}
      {priorityActions.length > 0 && (
        <div className="space-y-4" data-testid="priority-actions">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-medium text-white">Priority Actions</h2>
            <span className="text-xs text-gray-600">{priorityActions.length} recommendations</span>
          </div>
          
          <div className="grid gap-3 md:grid-cols-3">
            {priorityActions.map((action, i) => (
              <button
                key={i}
                onClick={() => onNavigate && onNavigate("ai-tests")}
                className="group text-left glass-card p-4 hover:border-white/20 transition-all"
                data-testid={`priority-action-${i}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    action.impact === "High" ? "bg-red-400/10 text-red-400" :
                    action.impact === "Medium" ? "bg-amber-400/10 text-amber-400" :
                    "bg-emerald-400/10 text-emerald-400"
                  }`}>
                    {action.impact}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">{action.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{action.detail?.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Operational Overview */}
      <div className="space-y-4" data-testid="operational-data">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {operationalCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => onNavigate && onNavigate(card.nav)}
                className="group glass-card p-4 text-left hover:border-white/20 transition-all"
                data-testid={`op-card-${card.title.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  <span className="text-2xl font-light text-white">{card.value}</span>
                </div>
                <p className="text-xs text-gray-600">{card.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {overview && (overview.recent_audits?.length > 0 || overview.recent_ai_tests?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Audits */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Recent Audits</h3>
              <button onClick={() => onNavigate && onNavigate("audits")} className="text-xs text-blue-400 hover:text-blue-300">
                View all
              </button>
            </div>
            {overview.recent_audits?.length === 0 ? (
              <p className="text-xs text-gray-600">No audits yet</p>
            ) : (
              <div className="space-y-2">
                {overview.recent_audits?.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-400 truncate max-w-[180px]">{a.url}</span>
                    <span className="text-sm font-medium" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent AI Tests */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Recent AI Tests</h3>
              <button onClick={() => onNavigate && onNavigate("ai-tests")} className="text-xs text-blue-400 hover:text-blue-300">
                View all
              </button>
            </div>
            {overview.recent_ai_tests?.length === 0 ? (
              <p className="text-xs text-gray-600">No tests yet</p>
            ) : (
              <div className="space-y-2">
                {overview.recent_ai_tests?.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-400 truncate max-w-[140px]">{t.url}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</span>
                      {t.geo_score !== undefined && (
                        <span className="text-gray-600">|</span>
                      )}
                      {t.geo_score !== undefined && (
                        <span style={{ color: getScoreColor(t.geo_score) }}>{t.geo_score}%</span>
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
