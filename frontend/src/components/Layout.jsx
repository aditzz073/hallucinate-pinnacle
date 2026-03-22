import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Eye,
  FileSearch,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import Footer from "./layout/Footer";
import AppBackground from "./ui/AppBackground";
import FeatureLockedModal from "./modals/FeatureLockedModal";
import {
  getPageIdFromPath,
  getPathFromPageId,
  getPathFromPageIdForAuth,
  PRIVATE_PAGE_IDS,
} from "../routes/routeConfig";

const MOBILE_NAV = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "audits", label: "Audits", icon: FileSearch },
  { id: "ai-visibility-lab", label: "AI Lab", icon: Search },
  { id: "monitor", label: "Monitor", icon: Eye },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const FEATURE_NAMES = {
  dashboard: "Dashboard",
  monitor: "Monitor Pages",
  reports: "Reports",
  advanced: "Advanced Audit",
  simulator: "Strategy Simulator",
  compare: "Competitor Intel",
  executive: "Executive Summary",
  profile: "Profile",
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const activePage = useMemo(() => getPageIdFromPath(location.pathname), [location.pathname]);
  const isLandingLike = activePage === "landing" || activePage === "pricing";

  const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [pendingPath, setPendingPath] = useState(null);

  const navigateToPage = (pageId) => {
    navigate(getPathFromPageIdForAuth(pageId, Boolean(user)));
  };

  const handleShowFeatureLocked = (featureIdOrLabel) => {
    const label = FEATURE_NAMES[featureIdOrLabel] || featureIdOrLabel;
    setLockedFeature(label);
    setShowFeatureLockedModal(true);

    if (FEATURE_NAMES[featureIdOrLabel]) {
      setPendingPath(getPathFromPageId(featureIdOrLabel));
    }
  };

  const handleNavigate = (pageId) => {
    const requiresAuth = PRIVATE_PAGE_IDS.includes(pageId);
    if (requiresAuth && !user) {
      handleShowFeatureLocked(pageId);
      return;
    }
    navigateToPage(pageId);
  };

  const handleSignInFromModal = () => {
    setShowFeatureLockedModal(false);
    navigate("/login", {
      state: pendingPath ? { from: { pathname: pendingPath } } : undefined,
    });
  };

  const logout = () => {
    authLogout();
    navigate(getPathFromPageId("landing"));
  };

  return (
    <div
      className="min-h-screen text-white antialiased"
      style={{
        background: isLandingLike
          ? "radial-gradient(1200px 700px at 72% 18%, rgba(79,70,229,0.28), transparent 60%), radial-gradient(900px 620px at 22% 10%, rgba(124,58,237,0.22), transparent 65%), #070716"
          : "#08081A",
      }}
    >
      {!isLandingLike && <AppBackground />}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        isLanding={isLandingLike && !user}
        onGetStarted={() => navigate(user ? "/dashboard" : "/register")}
        onShowFeatureLocked={handleShowFeatureLocked}
        onLogout={logout}
      />

      <main className={`relative z-10 ${isLandingLike ? "pt-0 pb-0 px-0" : "pt-24 pb-12 px-4 lg:px-0"}`}>
        {isLandingLike ? (
          <Outlet />
        ) : (
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        )}
      </main>

      {!isLandingLike && <Footer onNavigate={handleNavigate} />}

      <FeatureLockedModal
        isOpen={showFeatureLockedModal}
        onClose={() => setShowFeatureLockedModal(false)}
        onSignIn={handleSignInFromModal}
        feature={lockedFeature}
      />
    </div>
  );
}

export function AppShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const activePage = useMemo(() => getPageIdFromPath(location.pathname), [location.pathname]);

  const handleNavigate = (pageId) => {
    navigate(getPathFromPageIdForAuth(pageId, true));
  };

  const logout = () => {
    authLogout();
    navigate(getPathFromPageId("landing"));
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden md:block">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} onLogout={logout} />
      </div>

      <main className="flex-1 pb-20 md:pb-0" style={{ marginLeft: "0" }}>
        <style>{`@media (min-width: 768px) { .app-main { margin-left: 220px; } }`}</style>
        <div className="app-main max-w-[1120px] mx-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

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
                onClick={() => handleNavigate(id)}
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
    </div>
  );
}
