import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import {
  LayoutDashboard,
  Search,
  FileSearch,
  Eye,
  BarChart3,
  Sparkles,
  FlaskConical,
  Swords,
  Crown,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard",  label: "Dashboard",         icon: LayoutDashboard },
      { id: "executive",  label: "Executive Summary",  icon: Crown },
    ],
  },
  {
    label: "Analysis",
    items: [
      { id: "audits",    label: "Page Audits",     icon: FileSearch },
      { id: "ai-tests",  label: "AI Citation Tests", icon: Search },
      { id: "advanced",  label: "Advanced Audit",  icon: Sparkles },
    ],
  },
  {
    label: "Strategy",
    items: [
      { id: "simulator", label: "Strategy Simulator", icon: FlaskConical },
      { id: "compare",   label: "Competitor Intel",   icon: Swords },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { id: "monitor",  label: "Monitor Pages", icon: Eye },
      { id: "reports",  label: "Reports",       icon: BarChart3 },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-testid="sidebar"
      className={`fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 ${
        collapsed ? "w-16" : "w-[220px]"
      }`}
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo / Brand */}
      <div
        className={`h-14 flex items-center shrink-0 ${collapsed ? "justify-center px-0" : "gap-2.5 px-4"}`}
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Logo size="sm" />
        {!collapsed && (
          <span className="font-display font-bold text-sm tracking-tight text-white whitespace-nowrap">
            Pinnacle<span className="text-indigo-400">.ai</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest"
                 style={{ color: "var(--text-subtle)" }}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    data-testid={`nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-md text-sm font-medium transition-all duration-150 group relative ${
                      collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
                    } ${
                      isActive
                        ? "text-white"
                        : "text-[#7070A0] hover:text-white"
                    }`}
                    style={
                      isActive
                        ? {
                            background: "rgba(79,70,229,0.12)",
                            borderLeft: "2px solid #4F46E5",
                            paddingLeft: collapsed ? undefined : "calc(0.75rem - 2px)",
                          }
                        : { background: "transparent", borderLeft: "2px solid transparent" }
                    }
                  >
                    <Icon
                      className={`shrink-0 transition-colors ${collapsed ? "w-4.5 h-4.5" : "w-4 h-4"} ${
                        isActive ? "text-indigo-400" : "text-[#4A4A70] group-hover:text-[#7070A0]"
                      }`}
                      style={{ width: "16px", height: "16px" }}
                    />
                    {!collapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text)" }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: profile + logout + collapse */}
      <div className="shrink-0 p-2 space-y-0.5" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          data-testid="nav-profile"
          onClick={() => onNavigate("profile")}
          className={`w-full flex items-center gap-2.5 rounded-md text-sm font-medium transition-all duration-150 group ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
          } ${activePage === "profile" ? "text-white" : "text-[#7070A0] hover:text-white hover:bg-[#1A1A30]"}`}
          style={activePage === "profile" ? { background: "rgba(79,70,229,0.12)", borderLeft: "2px solid #4F46E5", paddingLeft: collapsed ? undefined : "calc(0.75rem - 2px)" } : { borderLeft: "2px solid transparent" }}
        >
          <User style={{ width: "16px", height: "16px" }} className="shrink-0" />
          {!collapsed && <span>Profile</span>}
        </button>

        <button
          data-testid="logout-button"
          onClick={onLogout}
          className={`w-full flex items-center gap-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
          } text-[#7070A0] hover:text-red-400 hover:bg-red-500/10`}
          style={{ borderLeft: "2px solid transparent" }}
        >
          <LogOut style={{ width: "16px", height: "16px" }} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* User email */}
        {!collapsed && user && (
          <div className="px-3 pt-2 pb-1">
            <p className="text-[11px] truncate" style={{ color: "var(--text-subtle)" }}>{user.email}</p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          data-testid="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded-md transition-colors duration-150"
          style={{ color: "var(--text-subtle)" }}
        >
          {collapsed
            ? <ChevronRight style={{ width: "14px", height: "14px" }} />
            : <ChevronLeft  style={{ width: "14px", height: "14px" }} />
          }
        </button>
      </div>
    </aside>
  );
}
