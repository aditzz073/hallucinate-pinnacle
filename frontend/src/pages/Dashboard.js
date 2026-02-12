import React, { useState, useEffect } from "react";
import { getOverview } from "../api";
import { useAuth } from "../context/AuthContext";
import { getScoreColor } from "../components/ui/ScoreRing";
import {
  FileSearch, Search, Eye, Activity,
  CheckCircle2, XCircle, TrendingUp, ArrowRight,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/health`).then((r) => setHealth(r.data)).catch(() => setHealth({ status: "error", database: "disconnected" }));
    getOverview().then(setOverview).catch(() => {});
  }, []);

  const s = overview?.summary || {};

  const cards = [
    { title: "Page Audits", icon: FileSearch, value: s.total_audits ?? 0, label: "audits run", nav: "audits", color: "group-hover:text-blue-400" },
    { title: "AI Citation Tests", icon: Search, value: s.total_ai_tests ?? 0, label: "tests completed", nav: "ai-tests", color: "group-hover:text-purple-400" },
    { title: "Monitored Pages", icon: Eye, value: s.total_monitored_pages ?? 0, label: "pages tracked", nav: "monitor", color: "group-hover:text-teal-400" },
    { title: "Changes Detected", icon: Activity, value: s.total_changes_detected ?? 0, label: "changes detected", nav: "changes", color: "group-hover:text-pink-400" },
  ];

  return (
    <div className="space-y-10" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-thin text-white mb-2">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-gray-400 text-base font-light">Your AI discoverability command center.</p>
      </div>

      {/* Health + Scores */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass-card inline-flex items-center gap-2 px-4 py-2.5" data-testid="health-status">
          {health?.database === "connected" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : health ? <XCircle className="w-4 h-4 text-red-400" /> : <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />}
          <span className="text-xs font-medium text-gray-400">{health?.database === "connected" ? "System Operational" : health ? "Connection Issue" : "Checking..."}</span>
        </div>
        {s.average_aeo_score > 0 && (
          <div className="glass-card inline-flex items-center gap-2 px-4 py-2.5" data-testid="avg-aeo-score">
            <span className="text-xs text-gray-500">Avg AEO</span>
            <span className="text-sm font-semibold" style={{ color: getScoreColor(s.average_aeo_score) }}>{s.average_aeo_score}</span>
          </div>
        )}
        {s.average_citation_probability > 0 && (
          <div className="glass-card inline-flex items-center gap-2 px-4 py-2.5" data-testid="avg-citation">
            <span className="text-xs text-gray-500">Avg Citation</span>
            <span className="text-sm font-semibold" style={{ color: getScoreColor(s.average_citation_probability) }}>{s.average_citation_probability}%</span>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => onNavigate && onNavigate(card.nav)}
              data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="glass-card group text-left p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-5 h-5 text-gray-500 ${card.color} transition-colors duration-300`} />
                <TrendingUp className="w-3.5 h-3.5 text-gray-700" />
              </div>
              <p className={`text-3xl font-light text-white ${card.color} transition-colors duration-300`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              <p className="text-sm font-medium text-gray-300 mt-4 pt-4 border-t border-white/5">{card.title}</p>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Recent Audits</h2>
            {overview.recent_audits?.length === 0 ? (
              <p className="text-xs text-gray-500">Run your first audit to see results here.</p>
            ) : (
              <div className="space-y-3">
                {overview.recent_audits?.map((a, i) => (
                  <div key={i} className="flex items-center justify-between" data-testid={`recent-audit-${i}`}>
                    <span className="text-xs text-gray-400 truncate max-w-[220px]">{a.url}</span>
                    <span className="text-xs font-semibold" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Recent AI Tests</h2>
            {overview.recent_ai_tests?.length === 0 ? (
              <p className="text-xs text-gray-500">Run your first citation test to see results here.</p>
            ) : (
              <div className="space-y-3">
                {overview.recent_ai_tests?.map((t, i) => (
                  <div key={i} className="flex items-center justify-between" data-testid={`recent-test-${i}`}>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-gray-400 truncate block max-w-[180px]">{t.url}</span>
                      <span className="text-[10px] text-gray-600">"{t.query}"</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</span>
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
