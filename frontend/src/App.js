import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import AppBackground from "./components/ui/AppBackground";
import HistorySlider from "./components/ui/HistorySlider";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import FeatureLockedModal from "./components/modals/FeatureLockedModal";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AuditsPage from "./pages/AuditsPage";
import AITestsPage from "./pages/AITestsPage";
import MonitoringPage from "./pages/MonitoringPage";
import ReportsPage from "./pages/ReportsPage";
import AdvancedAuditPage from "./pages/AdvancedAuditPage";
import SimulatorPage from "./pages/SimulatorPage";
import CompetitorPage from "./pages/CompetitorPage";
import ExecutiveSummaryPage from "./pages/ExecutiveSummaryPage";
import ProfilePage from "./pages/ProfilePage";
import {
  LayoutDashboard, FileSearch, Search, BarChart3, Eye,
} from "lucide-react";

// Pages rendered within the authenticated sidebar layout
const APP_PAGES = ["dashboard","audits","ai-tests","monitor","reports","advanced","simulator","compare","executive","profile"];

// Mobile bottom nav — 5 key destinations
const MOBILE_NAV = [
  { id: "dashboard", label: "Home",    icon: LayoutDashboard },
  { id: "audits",    label: "Audits",  icon: FileSearch },
  { id: "ai-tests",  label: "Tests",   icon: Search },
  { id: "monitor",   label: "Monitor", icon: Eye },
  { id: "reports",   label: "Reports", icon: BarChart3 },
];


function AppContent() {
  const { user, loading, logout: authLogout } = useAuth();
  const [view, setView] = useState("landing");
  const [activePage, setActivePage] = useState("landing");
  const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState(["landing"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const logout = () => {
    authLogout();
    setView("landing");
    setActivePage("landing");
    setNavigationHistory(["landing"]);
    setHistoryIndex(0);
  };

  const handlePageNavigation = (page, skipHistory = false) => {
    if (page === activePage) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePage(page);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (!skipHistory) {
        const newHistory = navigationHistory.slice(0, historyIndex + 1);
        newHistory.push(page);
        setNavigationHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 180);
  };

  const handleNavigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const targetPage = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      if (targetPage === "login") { setView("login"); }
      else if (targetPage === "register") { setView("register"); }
      else { setView("app"); handlePageNavigation(targetPage, true); }
    }
  };

  const handleNavigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const targetPage = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      if (targetPage === "login") { setView("login"); }
      else if (targetPage === "register") { setView("register"); }
      else { setView("app"); handlePageNavigation(targetPage, true); }
    }
  };

  const handleShowFeatureLocked = (feature) => {
    if (user?.is_privileged) return;
    const featureNames = {
      'dashboard': 'Dashboard', 'monitor': 'Monitor Pages',
      'reports': 'Reports', 'advanced': 'Advanced Audit', 'simulator': 'Strategy Simulator',
      'compare': 'Competitor Intel', 'executive': 'Executive Summary', 'profile': 'Profile',
    };
    setLockedFeature(featureNames[feature] || feature);
    setShowFeatureLockedModal(true);
  };

  const navigateToAuth = (authView) => {
    setView(authView);
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(authView);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSignInFromModal = () => {
    setShowFeatureLockedModal(false);
    navigateToAuth("login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#08081A" }} data-testid="loading-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Loading</p>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <>
        <LoginPage onSwitch={() => navigateToAuth("register")} onSuccess={() => { setView("app"); setActivePage("dashboard"); }} />
        <HistorySlider history={navigationHistory} currentIndex={historyIndex} onNavigateBack={handleNavigateBack} onNavigateForward={handleNavigateForward} />
      </>
    );
  }
  if (view === "register") {
    return (
      <>
        <RegisterPage onSwitch={() => navigateToAuth("login")} onSuccess={() => { setView("app"); setActivePage("dashboard"); }} />
        <HistorySlider history={navigationHistory} currentIndex={historyIndex} onNavigateBack={handleNavigateBack} onNavigateForward={handleNavigateForward} />
      </>
    );
  }

  const renderPage = () => {
    if (activePage === "landing") return <LandingPage onGetStarted={() => navigateToAuth("register")} />;
    if (activePage === "audits") return <AuditsPage onSignUp={() => navigateToAuth("register")} />;
    if (activePage === "ai-tests") return <AITestsPage onSignUp={() => navigateToAuth("register")} />;

    if (activePage === "dashboard") {
      if (!user) { handleShowFeatureLocked("dashboard"); return <LandingPage onGetStarted={() => navigateToAuth("register")} />; }
      return <Dashboard onNavigate={handlePageNavigation} />;
    }

    const authPages = ["monitor","reports","advanced","simulator","compare","executive","profile"];
    if (authPages.includes(activePage)) {
      if (!user) { handleShowFeatureLocked(activePage); return <LandingPage onGetStarted={() => navigateToAuth("register")} />; }
      switch (activePage) {
        case "monitor":   return <MonitoringPage />;
        case "reports":   return <ReportsPage />;
        case "advanced":  return <AdvancedAuditPage />;
        case "simulator": return <SimulatorPage />;
        case "compare":   return <CompetitorPage />;
        case "executive": return <ExecutiveSummaryPage />;
        case "profile":   return <ProfilePage />;
        default:          return <Dashboard onNavigate={handlePageNavigation} />;
      }
    }

    return <LandingPage onGetStarted={() => navigateToAuth("register")} />;
  };

  // Authenticated app shell: sidebar + content area (no top navbar, no footer)
  const isAppPage = user && APP_PAGES.includes(activePage);

  if (isAppPage) {
    return (
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Sidebar — hidden on mobile (< md) */}
        <div className="hidden md:block">
          <Sidebar
            activePage={activePage}
            onNavigate={handlePageNavigation}
            onLogout={logout}
          />
        </div>

        {/* Main content — offset by sidebar on md+ */}
        <main
          className={`flex-1 transition-opacity duration-200 pb-20 md:pb-0 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          style={{ marginLeft: "0" }}
        >
          <style>{`@media (min-width: 768px) { .app-main { margin-left: 220px; } }`}</style>
          <div className="app-main max-w-[1120px] mx-auto px-4 md:px-8 py-6 md:py-8">
            {renderPage()}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
            {MOBILE_NAV.map(({ id, label, icon: Icon }) => {
              const isActive = activePage === id;
              return (
                <button
                  key={id}
                  onClick={() => handlePageNavigation(id)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: isActive ? "#818CF8" : "var(--muted)",
                    background: isActive ? "rgba(79,70,229,0.1)" : "transparent",
                    minWidth: "52px",
                  }}
                >
                  <Icon style={{ width: "18px", height: "18px" }} />
                  <span style={{ fontSize: "10px", fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <HistorySlider
          history={navigationHistory}
          currentIndex={historyIndex}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
        />

        <FeatureLockedModal
          isOpen={showFeatureLockedModal}
          onClose={() => setShowFeatureLockedModal(false)}
          onSignIn={handleSignInFromModal}
          feature={lockedFeature}
        />
      </div>
    );
  }

  // Marketing / public shell: top navbar + content + footer
  return (
    <div className="min-h-screen text-white antialiased" style={{ background: "#08081A" }}>
      <AppBackground />
      <Navbar
        activePage={activePage}
        onNavigate={handlePageNavigation}
        isLanding={activePage === "landing" && !user}
        onGetStarted={() => navigateToAuth(user ? "dashboard" : "login")}
        onShowFeatureLocked={handleShowFeatureLocked}
        onLogout={logout}
      />
      <main className={`relative z-10 pt-24 pb-12 px-4 lg:px-0 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <div className="max-w-6xl mx-auto">
          {renderPage()}
        </div>
      </main>
      {activePage !== "landing" && <Footer onNavigate={setActivePage} />}

      <HistorySlider
        history={navigationHistory}
        currentIndex={historyIndex}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
      />

      <FeatureLockedModal
        isOpen={showFeatureLockedModal}
        onClose={() => setShowFeatureLockedModal(false)}
        onSignIn={handleSignInFromModal}
        feature={lockedFeature}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
