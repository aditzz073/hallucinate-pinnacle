import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FileSearch,
  Search,
  Eye,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/health`)
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error", database: "disconnected" }));
  }, []);

  const cards = [
    {
      title: "Page Audits",
      desc: "Analyze AEO signals",
      icon: FileSearch,
      value: "0",
      label: "audits run",
    },
    {
      title: "AI Citation Tests",
      desc: "Test AI engine citations",
      icon: Search,
      value: "0",
      label: "tests completed",
    },
    {
      title: "Monitored Pages",
      desc: "Track signal changes",
      icon: Eye,
      value: "0",
      label: "pages tracked",
    },
    {
      title: "Change Detections",
      desc: "Signal change alerts",
      icon: Activity,
      value: "0",
      label: "changes detected",
    },
  ];

  return (
    <div className="max-w-6xl" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Overview
        </p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Your AI discoverability command center.
        </p>
      </div>

      {/* Health indicator */}
      <div className="mb-10" data-testid="health-status">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md">
          {health?.database === "connected" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : health ? (
            <XCircle className="w-4 h-4 text-destructive" />
          ) : (
            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          )}
          <span className="text-xs font-mono text-muted-foreground">
            {health?.database === "connected"
              ? "System Operational"
              : health
              ? "Connection Issue"
              : "Checking..."}
          </span>
          <span className="text-xs font-mono text-muted-foreground/50">
            v{health?.version || "..."}
          </span>
        </div>
      </div>

      {/* Stat Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
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
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="font-heading font-semibold text-lg tracking-tight mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            testId="quick-action-audit"
            title="Run Page Audit"
            desc="Analyze a URL for AEO signals"
            disabled
          />
          <QuickAction
            testId="quick-action-test"
            title="AI Citation Test"
            desc="Check if AI engines cite your page"
            disabled
          />
          <QuickAction
            testId="quick-action-monitor"
            title="Add Page to Monitor"
            desc="Start tracking a page for changes"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, desc, disabled, testId }) {
  return (
    <button
      data-testid={testId}
      disabled={disabled}
      className="text-left bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <p className="text-sm font-medium mb-1 group-hover:text-primary transition-colors duration-200">
        {title}
      </p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      {disabled && (
        <p className="text-[10px] font-mono text-muted-foreground/50 mt-3 uppercase tracking-widest">
          Coming Soon
        </p>
      )}
    </button>
  );
}
