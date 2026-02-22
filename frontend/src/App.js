import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
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

function AppContent() {
  const { user, loading, logout: authLogout } = useAuth();
  const [view, setView] = useState("landing");
  const [activePage, setActivePage] = useState("landing");
  const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasRedirectedRef = React.useRef(false);
  
  // Navigation history tracking
  const [navigationHistory, setNavigationHistory] = useState(["landing"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Custom logout that also redirects
  const logout = () => {
    hasRedirectedRef.current = true;
    authLogout();
    setView("landing");
    setActivePage("landing");
  };

  // Handle logout - redirect to landing (only once)
  useEffect(() => {
    if (!loading && !user && view === "app" && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      setView("landing");
      setActivePage("landing");
    }
    // Reset ref when user logs in
    if (user) {
      hasRedirectedRef.current = false;
    }
  }, [user, loading, view]);

  // Smooth page navigation with fade transition
  const handlePageNavigation = (page, skipHistory = false) => {
    if (page === activePage) return; // Don't transition to same page
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePage(page);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Update navigation history (only if not navigating via back/forward)
      if (!skipHistory) {
        // Remove any forward history when navigating to a new page
        const newHistory = navigationHistory.slice(0, historyIndex + 1);
        newHistory.push(page);
        setNavigationHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 200); // Short fade out before page change
  };

  // Navigate back in history
  const handleNavigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      handlePageNavigation(navigationHistory[newIndex], true);
    }
  };

  // Navigate forward in history
  const handleNavigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      handlePageNavigation(navigationHistory[newIndex], true);
    }
  };

  const handleShowFeatureLocked = (feature) => {
    // Privileged users never see feature locked modals
    if (user?.is_privileged) {
      return; // Do nothing for privileged users
    }
    
    // Map page IDs to user-friendly names
    const featureNames = {
      'dashboard': 'Dashboard',
      'monitor': 'Monitor Pages',
      'changes': 'Change Detection',
      'reports': 'Reports',
      'advanced': 'Advanced Audit',
      'simulator': 'Strategy Simulator',
      'compare': 'Competitor Intel',
      'executive': 'Executive Summary',
      'profile': 'Profile'
    };
    setLockedFeature(featureNames[feature] || feature);
    setShowFeatureLockedModal(true);
  };

  const handleSignInFromModal = () => {
    setShowFeatureLockedModal(false);
    setView("login");
    // Add to navigation history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push("login");
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center" data-testid="loading-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading</p>
        </div>
      </div>
    );
  }

  // Handle auth views (login/register)
  if (view === "login") {
    return (
      <>
        <LoginPage onSwitch={() => setView("register")} onSuccess={() => {
          setView("app");
          setActivePage("dashboard");
        }} />
        <HistorySlider
          history={navigationHistory}
          currentIndex={historyIndex}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
        />
      </>
    );
  }
  if (view === "register") {
    return (
      <>
        <RegisterPage onSwitch={() => setView("login")} onSuccess={() => {
          setView("app");
          setActivePage("dashboard");
        }} />
        <HistorySlider
          history={navigationHistory}
          currentIndex={historyIndex}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
        />
      </>
    );
  }

  // Main app view (landing or app pages)
  const renderPage = () => {
    // Landing page
    if (activePage === "landing") {
      return <LandingPage onGetStarted={() => setView("register")} />;
    }

    // Public pages (accessible to guests)
    if (activePage === "audits") {
      return <AuditsPage onSignUp={() => setView("register")} />;
    }
    if (activePage === "ai-tests") {
      return <AITestsPage onSignUp={() => setView("register")} />;
    }

    // Dashboard - requires auth
    if (activePage === "dashboard") {
      if (!user) {
        handleShowFeatureLocked("dashboard");
        return <LandingPage onGetStarted={() => setView("register")} />;
      }
      return <Dashboard onNavigate={handlePageNavigation} />;
    }

    // Authenticated-only pages
    const authPages = ["monitor", "changes", "reports", "advanced", "simulator", "compare", "executive", "profile"];
    if (authPages.includes(activePage)) {
      if (!user) {
        handleShowFeatureLocked(activePage);
        return <LandingPage onGetStarted={() => setView("register")} />;
      }
      
      switch (activePage) {
        case "monitor": return <MonitoringPage />;
        case "changes": return <MonitoringPage />;
        case "reports": return <ReportsPage />;
        case "advanced": return <AdvancedAuditPage />;
        case "simulator": return <SimulatorPage />;
        case "compare": return <CompetitorPage />;
        case "executive": return <ExecutiveSummaryPage />;
        case "profile": return <ProfilePage />;
        default: return <Dashboard onNavigate={setActivePage} />;
      }
    }

    // Default - back to landing
    return <LandingPage onGetStarted={() => setView("register")} />;
  };

  return (
    <div className="min-h-screen text-white antialiased">
      <AppBackground />
      <Navbar 
        activePage={activePage} 
        onNavigate={handlePageNavigation}
        isLanding={activePage === "landing" && !user}
        onGetStarted={() => setView(user ? "dashboard" : "login")}
        onShowFeatureLocked={handleShowFeatureLocked}
        onLogout={logout}
      />
      <main className="relative z-10 pt-24 pb-12 px-4 lg:px-0">
        <div 
          className={`max-w-6xl mx-auto transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {renderPage()}
        </div>
      </main>
      {activePage !== "landing" && <Footer onNavigate={setActivePage} />}
      
      {/* Navigation History Slider - Visible everywhere */}
      <HistorySlider
        history={navigationHistory}
        currentIndex={historyIndex}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
      />
      
      {/* Feature Locked Modal */}
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
