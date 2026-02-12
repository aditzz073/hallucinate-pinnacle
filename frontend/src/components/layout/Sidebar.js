import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Search,
  FileSearch,
  Eye,
  Activity,
  BarChart3,
  Sparkles,
  FlaskConical,
  Swords,
  Crown,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "audits", label: "Page Audits", icon: FileSearch },
  { id: "ai-tests", label: "AI Citation Tests", icon: Search },
  { id: "monitor", label: "Monitoring", icon: Eye },
  { id: "changes", label: "Change Log", icon: Activity },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "advanced", label: "Advanced Audit", icon: Sparkles },
  { id: "simulator", label: "Strategy Sim", icon: FlaskConical },
  { id: "compare", label: "Competitor Intel", icon: Swords },
  { id: "executive", label: "Executive Summary", icon: Crown },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-testid="sidebar"
      className={`fixed top-0 left-0 h-screen bg-background/95 backdrop-blur border-r border-border flex flex-col z-40 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-sm tracking-tight whitespace-nowrap" data-testid="sidebar-title">
            Pinnacle.AI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(79,70,229,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2 space-y-1 shrink-0">
        <button
          data-testid="nav-settings"
          onClick={() => onNavigate("settings")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          data-testid="logout-button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* User */}
        {!collapsed && user && (
          <div className="px-3 py-3 mt-2" data-testid="sidebar-user-info">
            <p className="text-xs font-mono text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          data-testid="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
