import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppBackground from "./components/ui/AppBackground";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
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
  const [activePage, setActivePage] = useState("dashboard");

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

  // Authenticated: show dashboard
  if (user) {
    const renderPage = () => {
      switch (activePage) {
        case "dashboard": return <Dashboard onNavigate={setActivePage} />;
        case "audits": return <AuditsPage />;
        case "ai-tests": return <AITestsPage />;
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
    };

    return (
      <div className="min-h-screen text-white antialiased">
        <AppBackground />
        <Navbar activePage={activePage} onNavigate={setActivePage} />
        <main className="relative z-10 pt-24 pb-12 px-4 lg:px-0">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>
        <Footer onNavigate={setActivePage} />
      </div>
    );
  }

  // Unauthenticated
  if (view === "login") {
    return <LoginPage onSwitch={() => setView("register")} />;
  }
  if (view === "register") {
    return <RegisterPage onSwitch={() => setView("login")} />;
  }

  // Landing
  return (
    <div className="min-h-screen text-white antialiased">
      <Navbar isLanding onGetStarted={() => setView("login")} />
      <LandingPage onGetStarted={() => setView("register")} />
      <Footer />
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
