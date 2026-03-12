import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import FoundingAccessBadge from "../ui/FoundingAccessBadge";
import {
  LayoutDashboard, FileSearch, Eye, BarChart3,
  Sparkles, FlaskConical, Swords, Crown, LogOut, ChevronDown,
  Layers, Beaker, User, Microscope,
} from "lucide-react";

const CORE_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
  { id: "audits", label: "Audits", icon: FileSearch, requiresAuth: false },
  { id: "ai-visibility-lab", label: "AI Visibility Lab", icon: Microscope, requiresAuth: false },
];

const TOOLS_DROPDOWN = [
  { id: "monitor", label: "Monitor Pages", icon: Eye, requiresAuth: true },
  { id: "reports", label: "Reports", icon: BarChart3, requiresAuth: true },
  { id: "advanced", label: "Advanced Audit", icon: Sparkles, requiresAuth: true },
  { id: "simulator", label: "Strategy Simulator", icon: FlaskConical, requiresAuth: true, isEnterprise: true },
];

const ENTERPRISE_DROPDOWN = [
  { id: "compare", label: "Competitor Intel", icon: Swords, requiresAuth: true, isEnterprise: true },
  { id: "executive", label: "Executive Summary", icon: Crown, requiresAuth: true, isEnterprise: true },
];

function DropdownMenu({ label, icon: Icon, items, activePage, onNavigate, onShowFeatureLocked }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user } = useAuth();
  const isActive = items.some((item) => item.id === activePage);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    setOpen(false);
    
    if (item.requiresAuth && !user) {
      onShowFeatureLocked && onShowFeatureLocked(item.label);
      return;
    }
    
    onNavigate(item.id);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        data-testid={`nav-dropdown-${label.toLowerCase()}`}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] glass-dropdown rounded-xl overflow-hidden animate-fadeIn z-50">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = activePage === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
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

export default function Navbar({ activePage, onNavigate, isLanding = false, onGetStarted, onShowFeatureLocked, onLogout }) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (isLanding) {
      // On landing page, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to landing page
      onNavigate && onNavigate("landing");
    }
  };

  // Handle navigation with access control
  const handleNavClickWithAuth = (itemId, requiresAuth = false) => {
    // Public items - always allow
    if (!requiresAuth) {
      onNavigate(itemId);
      return;
    }

    // Requires auth but user not logged in
    if (!user) {
      onShowFeatureLocked && onShowFeatureLocked(itemId);
      return;
    }

    // Logged in - navigate
    onNavigate(itemId);
  };

  // Landing page navbar - show full nav for guests to access Audits and AI Tests
  if (isLanding) {
    return (
      <header 
        className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 transition-all duration-1000 ease-in-out"
        data-testid="navbar"
        style={{ transform: 'translateZ(0)' }}
      >
        <nav className={`flex items-center gap-1 rounded-full border px-6 py-2.5 transition-all duration-1000 ease-in-out ${
          scrolled 
            ? 'bg-black/70 backdrop-blur-xl border-white/25 shadow-2xl' 
            : 'bg-black/30 backdrop-blur-lg border-white/15 shadow-lg'
        }`}>
          {/* Logo */}
          <div 
            className="flex items-center gap-2 pr-4 border-r border-white/10 mr-3 cursor-pointer hover:opacity-80 transition-all duration-1000 ease-in-out"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-testid="nav-logo-landing"
          >
            <Logo size="sm" />
            <span className="text-base font-black tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Pinnacle</span>
              <span style={{ color: "#818CF8" }} className="font-light">.ai</span>
            </span>
          </div>

          {/* Core Navigation - accessible to guests */}
          <div className="flex items-center gap-0.5">
            {CORE_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={`nav-${item.id}`}
                  onClick={() => handleNavClickWithAuth(item.id, item.requiresAuth)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
              onShowFeatureLocked={onShowFeatureLocked}
            />

            {/* Enterprise Dropdown */}
            <DropdownMenu
              label="Enterprise"
              icon={Beaker}
              items={ENTERPRISE_DROPDOWN}
              activePage={activePage}
              onNavigate={onNavigate}
              onShowFeatureLocked={onShowFeatureLocked}
            />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-3">
            <button
              data-testid="nav-login-btn"
              onClick={onGetStarted}
              className="btn-secondary text-sm px-5 py-2"
            >
              Sign In
            </button>
            <button
              data-testid="nav-get-started-btn"
              onClick={onGetStarted}
              className="btn-primary text-sm px-5 py-2"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 transition-all duration-1000 ease-in-out"
      data-testid="navbar"
      style={{ transform: 'translateZ(0)' }}
    >
      <nav className={`flex items-center gap-1 rounded-full border px-6 py-2.5 transition-all duration-1000 ease-in-out ${
        scrolled 
          ? 'bg-black/70 backdrop-blur-xl border-white/25 shadow-2xl' 
          : 'bg-black/30 backdrop-blur-lg border-white/15 shadow-lg'
      }`}>
        {/* Logo */}
        <div 
          className="flex items-center gap-2 pr-4 border-r border-white/10 mr-3 cursor-pointer hover:opacity-80 transition-all duration-1000 ease-in-out"
          onClick={handleLogoClick}
          data-testid="nav-logo-app"
          title="Return to home"
        >
          <Logo size="sm" />
          <span className="hidden sm:flex items-baseline text-base font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Pinnacle</span>
            <span style={{ color: "#818CF8" }} className="font-light">.ai</span>
          </span>
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
                onClick={() => handleNavClickWithAuth(item.id, item.requiresAuth)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
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
            onShowFeatureLocked={onShowFeatureLocked}
          />

          {/* Enterprise Dropdown */}
          <DropdownMenu
            label="Enterprise"
            icon={Beaker}
            items={ENTERPRISE_DROPDOWN}
            activePage={activePage}
            onNavigate={onNavigate}
            onShowFeatureLocked={onShowFeatureLocked}
          />
        </div>

        {/* User Section */}
        {user && (
          <div className="flex items-center gap-2 pl-4 border-l border-white/10 ml-3">
            {/* Founding Access Badge - Only for privileged users */}
            {user.is_privileged && <FoundingAccessBadge />}
            
            <button
              data-testid="nav-profile"
              onClick={() => onNavigate("profile")}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activePage === "profile"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </button>
            <button
              data-testid="logout-button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
