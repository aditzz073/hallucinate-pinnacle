import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppBackground from "./components/ui/AppBackground";
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
  const { user, loading } = useAuth();
  const [view, setView] = useState("landing");
  const [activePage, setActivePage] = useState("landing");
  const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");

  const handleShowFeatureLocked = (feature) => {
    setLockedFeature(feature);
    setShowFeatureLockedModal(true);
  };

  const handleSignInFromModal = () => {
    setShowFeatureLockedModal(false);
    setView("login");
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
    return <LoginPage onSwitch={() => setView("register")} />;
  }
  if (view === "register") {
    return <RegisterPage onSwitch={() => setView("login")} />;
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
        handleShowFeatureLocked("Dashboard");
        setActivePage("landing");
        return <LandingPage onGetStarted={() => setView("register")} />;
      }
      return <Dashboard onNavigate={setActivePage} />;
    }

    // Authenticated pages
    if (user) {
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

    // Guest trying to access enterprise features
    handleShowFeatureLocked(activePage);
    setActivePage("landing");
    return <LandingPage onGetStarted={() => setView("register")} />;
  };

  return (
    <div className="min-h-screen text-white antialiased">
      <AppBackground />
      <Navbar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        isLanding={activePage === "landing" && !user}
        onGetStarted={() => setView(user ? "dashboard" : "login")}
        onShowFeatureLocked={handleShowFeatureLocked}
      />
      <main className="relative z-10 pt-24 pb-12 px-4 lg:px-0">
        <div className="max-w-6xl mx-auto">
          {renderPage()}
        </div>
      </main>
      {activePage !== "landing" && <Footer onNavigate={setActivePage} />}
      
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
