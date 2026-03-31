import React, { useState, useEffect, Suspense, lazy } from "react";
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
import UpgradeModal from "./components/modals/UpgradeModal";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AuditsPage from "./pages/AuditsPage";
import AIVisibilityLabPage from "./pages/AIVisibilityLabPage";
import CLIPage from "./pages/CLIPage";
import MonitoringPage from "./pages/MonitoringPage";
import ReportsPage from "./pages/ReportsPage";
import AdvancedAuditPage from "./pages/AdvancedAuditPage";
import SimulatorPage from "./pages/SimulatorPage";
import PlansPage from "./pages/PlansPage";
import CompetitorPage from "./pages/CompetitorPage";
import ExecutiveSummaryPage from "./pages/ExecutiveSummaryPage";
import ProfilePage from "./pages/ProfilePage";

import {
  LayoutDashboard, FileSearch, Search, BarChart3, Eye,
} from "lucide-react";

// Lazy-load marketing & legal pages , only fetched when first visited
const AboutPage        = lazy(() => import("./pages/AboutPage"));
const BlogPage         = lazy(() => import("./pages/BlogPage"));
const CareersPage      = lazy(() => import("./pages/CareersPage"));
const PressPage        = lazy(() => import("./pages/PressPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage        = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));

// Pages rendered within the authenticated sidebar layout
const APP_PAGES = ["dashboard","audits","ai-visibility-lab","cli","monitor","reports","advanced","simulator","compare","executive","profile"];

// Mobile bottom nav , 5 key destinations
const MOBILE_NAV = [
  { id: "dashboard", label: "Home",    icon: LayoutDashboard },
  { id: "audits",    label: "Audits",  icon: FileSearch },
  { id: "ai-visibility-lab", label: "AI Lab", icon: Search },
  { id: "monitor",   label: "Monitor", icon: Eye },
  { id: "reports",   label: "Reports", icon: BarChart3 },
];


function AppContent() {
  const { user, loading, logout: authLogout, isLoggedIn, showUpgradeModal, setShowUpgradeModal } = useAuth();
  const [view, setView] = useState("landing");
  const [activePage, setActivePage] = useState("landing");
  const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [navigationHistory, setNavigationHistory] = useState(["landing"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingPage, setPendingPage] = useState(null);

  const handleUpgradeRedirect = () => {
    setShowUpgradeModal(false);
    handlePageNavigation("plans");
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      handlePageNavigation("dashboard");
    } else {
      navigateToAuth("register");
    }
  };

  const handleSignUp = () => {
    if (isLoggedIn) {
      setShowUpgradeModal(true);
    } else {
      navigateToAuth("register");
    }
  };

  const logout = () => {
    authLogout();
    setView("landing");
    setActivePage("landing");
    setNavigationHistory(["landing"]);
    setHistoryIndex(0);
  };

  const handlePageNavigation = (page, skipHistory = false) => {
    if (page === activePage) return;
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!skipHistory) {
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(page);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
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

  const navigateToAuthWithRedirect = (authView, redirectPage) => {
    setPendingPage(redirectPage);
    navigateToAuth(authView);
  };

  const handleSignInFromModal = () => {
    setShowFeatureLockedModal(false);
    navigateToAuth("login");
    // pendingPage is already set from renderPage when this fires
  };

  useEffect(() => {
    const premiumPages = ["advanced", "simulator", "compare", "executive"];
    if (isLoggedIn && !user?.isSubscribed && premiumPages.includes(activePage)) {
      setShowUpgradeModal(true);
    }
  }, [activePage, isLoggedIn, user?.isSubscribed, setShowUpgradeModal]);

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
        <LoginPage onSwitch={() => navigateToAuth("register")} onSuccess={() => { setView("app"); setActivePage(pendingPage || "dashboard"); setPendingPage(null); }} />
        <HistorySlider history={navigationHistory} currentIndex={historyIndex} onNavigateBack={handleNavigateBack} onNavigateForward={handleNavigateForward} />
      </>
    );
  }
  if (view === "register") {
    return (
      <>
        <RegisterPage onSwitch={() => navigateToAuth("login")} onSuccess={() => { setView("app"); setActivePage(pendingPage || "dashboard"); setPendingPage(null); }} />
        <HistorySlider history={navigationHistory} currentIndex={historyIndex} onNavigateBack={handleNavigateBack} onNavigateForward={handleNavigateForward} />
      </>
    );
  }

  const renderPage = () => {
    if (activePage === "landing") {
      return (
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onNavigate={handlePageNavigation} 
          onUpgrade={() => isLoggedIn ? handleUpgradeRedirect() : navigateToAuth("login")}
        />
      );
    }

    const lazyPages = { about: AboutPage, blog: BlogPage, careers: CareersPage, press: PressPage, privacy: PrivacyPolicyPage, terms: TermsPage, cookies: CookiePolicyPage };
    if (lazyPages[activePage]) {
      const Page = lazyPages[activePage];
      return (
        <Suspense fallback={<div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
          <Page />
        </Suspense>
      );
    }

    if (activePage === "audits") return <AuditsPage onSignUp={handleSignUp} />;
    if (activePage === "ai-visibility-lab") return <AIVisibilityLabPage onSignUp={handleSignUp} />;
    if (activePage === "cli") return <CLIPage onGetStarted={handleGetStarted} />;
    if (activePage === "plans") return <PlansPage onGetStarted={handleGetStarted} onNavigate={handlePageNavigation} />;

    if (activePage === "dashboard") {
      if (!user) { 
        setPendingPage("dashboard");
        handleShowFeatureLocked("dashboard"); 
        return <LandingPage onGetStarted={handleGetStarted} onNavigate={handlePageNavigation} onUpgrade={() => navigateToAuth("login")} />; 
      }
      return <Dashboard onNavigate={handlePageNavigation} />;
    }

    const authPages = ["monitor","reports","advanced","simulator","compare","executive","profile"];
    if (authPages.includes(activePage)) {
      if (!user) { 
        handleShowFeatureLocked(activePage); 
        setPendingPage(activePage); 
        return <LandingPage onGetStarted={() => navigateToAuthWithRedirect("register", activePage)} onNavigate={handlePageNavigation} onUpgrade={() => navigateToAuth("login")} />; 
      }
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

    return <LandingPage onGetStarted={handleGetStarted} />;
  };

  // Authenticated app shell: sidebar + content area (no top navbar, no footer)
  const isAppPage = user && APP_PAGES.includes(activePage);
  const isLandingPage = activePage === "landing";

  if (isAppPage) {
    return (
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Sidebar , hidden on mobile (< md) */}
        <div className="hidden md:block">
          <Sidebar
            activePage={activePage}
            onNavigate={handlePageNavigation}
            onLogout={logout}
          />
        </div>

        {/* Main content , offset by sidebar on md+ */}
        <main
          className="flex-1 pb-20 md:pb-0"
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

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeRedirect}
        />
      </div>
    );
  }

  // Marketing / public shell: top navbar + content + footer
  return (
    <div
      className="min-h-screen text-white antialiased"
      style={{
        background: isLandingPage
          ? "radial-gradient(1200px 700px at 72% 18%, rgba(79,70,229,0.28), transparent 60%), radial-gradient(900px 620px at 22% 10%, rgba(124,58,237,0.22), transparent 65%), #070716"
          : "#08081A",
      }}
    >
      {!isLandingPage && <AppBackground />}
      <Navbar
        activePage={activePage}
        onNavigate={handlePageNavigation}
        isLanding={isLandingPage && !user}
        onGetStarted={() => navigateToAuth(user ? "dashboard" : "login")}
        onShowFeatureLocked={handleShowFeatureLocked}
        onLogout={logout}
      />
      <main className={`relative z-10 ${isLandingPage ? "pt-0 pb-0 px-0" : "pt-24 pb-12 px-4 lg:px-0"}`}>
        {isLandingPage ? (
          renderPage()
        ) : (
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        )}
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradeRedirect}
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
