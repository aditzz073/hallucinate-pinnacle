import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import {
  LayoutDashboard, FileSearch, Search, Eye, BarChart3,
  Sparkles, FlaskConical, Swords, Crown, LogOut, ChevronDown,
  Layers, Beaker,
} from "lucide-react";

const CORE_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "audits", label: "Audits", icon: FileSearch },
  { id: "ai-tests", label: "AI Tests", icon: Search },
];

const TOOLS_DROPDOWN = [
  { id: "monitor", label: "Monitor Pages", icon: Eye },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "advanced", label: "Advanced Audit", icon: Sparkles },
  { id: "simulator", label: "Strategy Simulator", icon: FlaskConical },
];

const ENTERPRISE_DROPDOWN = [
  { id: "compare", label: "Competitor Intel", icon: Swords },
  { id: "executive", label: "Executive Summary", icon: Crown },
];

function DropdownMenu({ label, icon: Icon, items, activePage, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = items.some((item) => item.id === activePage);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        data-testid={`nav-dropdown-${label.toLowerCase()}`}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
          isActive
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 min-w-[180px] glass-dropdown rounded-xl overflow-hidden animate-fadeIn">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = activePage === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                  isItemActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ItemIcon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ activePage, onNavigate, isLanding = false, onGetStarted }) {
  const { user, logout } = useAuth();

  if (isLanding) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4" data-testid="navbar">
        <nav className="floating-navbar flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-base font-semibold text-white">Pinnacle</span>
            <span className="text-base font-semibold text-gray-400">.ai</span>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            {["Features", "Dashboard", "Pricing"].map((item) => (
              <button key={item} className="nav-link-pill px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300">
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              data-testid="nav-login-btn"
              onClick={onGetStarted}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              Sign In
            </button>
            <button
              data-testid="nav-get-started-btn"
              onClick={onGetStarted}
              className="rounded-full bg-gradient-to-r from-brand-blue to-brand-teal px-5 py-2 text-sm font-medium text-white hover:scale-105 btn-glow transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4" data-testid="navbar">
      <nav className="floating-navbar flex items-center gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10 mr-2">
          <Logo size="sm" />
          <span className="text-sm font-semibold text-white hidden sm:inline">Pinnacle</span>
          <span className="text-sm font-semibold text-gray-400 hidden sm:inline">.ai</span>
        </div>

        {/* Core Navigation */}
        <div className="flex items-center gap-0.5">
          {CORE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Tools Dropdown */}
          <DropdownMenu
            label="Tools"
            icon={Layers}
            items={TOOLS_DROPDOWN}
            activePage={activePage}
            onNavigate={onNavigate}
          />

          {/* Enterprise Dropdown */}
          <DropdownMenu
            label="Enterprise"
            icon={Beaker}
            items={ENTERPRISE_DROPDOWN}
            activePage={activePage}
            onNavigate={onNavigate}
          />
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/10 ml-2">
          <button
            data-testid="logout-button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
