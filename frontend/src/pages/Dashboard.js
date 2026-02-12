import React, { useState, useEffect } from "react";
import { getOverview } from "../api";
import { useAuth } from "../context/AuthContext";
import { ScoreBadge, getScoreColor } from "../components/ui/ScoreRing";
import {
  FileSearch, Search, Eye, Activity,
  CheckCircle2, XCircle, TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/health`)
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error", database: "disconnected" }));

    getOverview()
      .then(setOverview)
      .catch(() => {});
  }, []);

  const s = overview?.summary || {};

  const cards = [
    { title: "Page Audits", desc: "Analyze AEO signals", icon: FileSearch, value: s.total_audits ?? 0, label: "audits run", nav: "audits" },
    { title: "AI Citation Tests", desc: "Test AI engine citations", icon: Search, value: s.total_ai_tests ?? 0, label: "tests completed", nav: "ai-tests" },
    { title: "Monitored Pages", desc: "Track signal changes", icon: Eye, value: s.total_monitored_pages ?? 0, label: "pages tracked", nav: "monitor" },
    { title: "Change Detections", desc: "Signal change alerts", icon: Activity, value: s.total_changes_detected ?? 0, label: "changes detected", nav: "changes" },
  ];

  return (
    <div className="max-w-6xl" data-testid="dashboard-page">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Overview</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">Your AI discoverability command center.</p>
      </div>

      {/* Health + Avg Scores */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md" data-testid="health-status">
          {health?.database === "connected" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : health ? (
            <XCircle className="w-4 h-4 text-destructive" />
          ) : (
            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          )}
          <span className="text-xs font-mono text-muted-foreground">
            {health?.database === "connected" ? "System Operational" : health ? "Connection Issue" : "Checking..."}
          </span>
        </div>
        {s.average_aeo_score > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md" data-testid="avg-aeo-score">
            <span className="text-xs font-mono text-muted-foreground">Avg AEO:</span>
            <span className="font-heading font-bold text-sm" style={{ color: getScoreColor(s.average_aeo_score) }}>
              {s.average_aeo_score}
            </span>
          </div>
        )}
        {s.average_citation_probability > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md" data-testid="avg-citation">
            <span className="text-xs font-mono text-muted-foreground">Avg Citation:</span>
            <span className="font-heading font-bold text-sm" style={{ color: getScoreColor(s.average_citation_probability) }}>
              {s.average_citation_probability}%
            </span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => onNavigate && onNavigate(card.nav)}
              data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-left bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-6">
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
              <p className="font-heading font-bold text-2xl tracking-tight mb-1">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-heading font-semibold text-sm mb-4">Recent Audits</h2>
            {overview.recent_audits?.length === 0 ? (
              <p className="text-xs text-muted-foreground">Run your first audit to see results here.</p>
            ) : (
              <div className="space-y-3">
                {overview.recent_audits?.map((a, i) => (
                  <div key={i} className="flex items-center justify-between" data-testid={`recent-audit-${i}`}>
                    <span className="text-xs text-muted-foreground truncate max-w-[220px]">{a.url}</span>
                    <ScoreBadge score={a.overall_score} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-heading font-semibold text-sm mb-4">Recent AI Tests</h2>
            {overview.recent_ai_tests?.length === 0 ? (
              <p className="text-xs text-muted-foreground">Run your first citation test to see results here.</p>
            ) : (
              <div className="space-y-3">
                {overview.recent_ai_tests?.map((t, i) => (
                  <div key={i} className="flex items-center justify-between" data-testid={`recent-test-${i}`}>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-muted-foreground truncate block max-w-[180px]">{t.url}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono">"{t.query}"</span>
                    </div>
                    <ScoreBadge score={t.citation_probability} />
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
