import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import UpgradeModal from "./modals/UpgradeModal";
import { setOnFeatureLocked } from "../api";
import {
  getPageIdFromPath,
  getPathFromPageId,
  getPathFromPageIdForAuth,
  PRIVATE_PAGE_IDS,
} from "../routes/routeConfig";
import {
  PREMIUM_FEATURE_PAGE_MAP,
  canAccessFeature,
  getMinimumPlanForFeature,
  FEATURE_UPGRADE_MESSAGES,
} from "../utils/featureAccess";

const MOBILE_NAV = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "audits", label: "Audits", icon: FileSearch },
  { id: "ai-visibility-lab", label: "AI Lab", icon: Search },
  { id: "monitor", label: "Monitor", icon: Eye },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const activePage = useMemo(() => getPageIdFromPath(location.pathname), [location.pathname]);
  const isLandingLike = activePage === "landing" || activePage === "pricing";

  // Upgrade modal state
  const [modalState, setModalState] = useState({
    open: false,
    errorType: "feature_locked",
    featureName: "",
    requiredPlan: "",
    currentPlan: "",
    upgradeMessage: "",
    usedCount: 0,
    limitCount: 0,
    resetsAt: null,
  });
  const [pendingPath, setPendingPath] = useState(null);

  // Register global interceptor callback
  const handleApiFeatureLocked = useCallback(({
    errorType = "feature_locked",
    feature, requiredPlan, currentPlan, upgradeMessage,
    usedCount, limitCount, resetsAt,
  }) => {
    setModalState({
      open: true,
      errorType,
      featureName: feature || "",
      requiredPlan: requiredPlan || "discover",
      currentPlan: currentPlan || user?.plan || "free",
      upgradeMessage: upgradeMessage || "",
      usedCount: usedCount || 0,
      limitCount: limitCount || 0,
      resetsAt: resetsAt || null,
    });
  }, [user]);

  useEffect(() => {
    setOnFeatureLocked(handleApiFeatureLocked);
    return () => setOnFeatureLocked(null);
  }, [handleApiFeatureLocked]);

  const navigateToPage = (pageId) => {
    navigate(getPathFromPageIdForAuth(pageId, Boolean(user)));
  };

  const handleShowFeatureLocked = (featureIdOrLabel) => {
    const feature = PREMIUM_FEATURE_PAGE_MAP[featureIdOrLabel] || featureIdOrLabel;
    const requiredPlan = getMinimumPlanForFeature(feature);
    const message = FEATURE_UPGRADE_MESSAGES[feature] || "";

    setModalState({
      open: true,
      featureName: feature,
      requiredPlan,
      currentPlan: user?.plan || "discover",
      upgradeMessage: message,
    });
    setPendingPath(getPathFromPageId(featureIdOrLabel));
  };

  const handleNavigate = (pageId) => {
    const requiresAuth = PRIVATE_PAGE_IDS.includes(pageId);
    if (requiresAuth && !user) {
      navigate("/login", {
        state: { from: { pathname: getPathFromPageId(pageId) } },
      });
      return;
    }

    const premiumFeature = PREMIUM_FEATURE_PAGE_MAP[pageId];
    if (premiumFeature && !canAccessFeature(user, premiumFeature)) {
      handleShowFeatureLocked(pageId);
      return;
    }

    navigateToPage(pageId);
  };

  const handleUpgradeFromModal = (plan) => {
    setModalState((s) => ({ ...s, open: false }));
    navigate("/pricing", {
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

      <UpgradeModal
        isOpen={modalState.open}
        onClose={() => setModalState((s) => ({ ...s, open: false }))}
        onUpgrade={handleUpgradeFromModal}
        errorType={modalState.errorType}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        currentPlan={modalState.currentPlan}
        upgradeMessage={modalState.upgradeMessage}
        usedCount={modalState.usedCount}
        limitCount={modalState.limitCount}
        resetsAt={modalState.resetsAt}
      />
    </div>
  );
}

export function AppShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const activePage = useMemo(() => getPageIdFromPath(location.pathname), [location.pathname]);

  const [modalState, setModalState] = useState({
    open: false,
    errorType: "feature_locked",
    featureName: "",
    requiredPlan: "",
    currentPlan: "",
    upgradeMessage: "",
    usedCount: 0,
    limitCount: 0,
    resetsAt: null,
  });

  // Register global interceptor callback for app shell too
  const handleApiFeatureLocked = useCallback(({
    errorType = "feature_locked",
    feature, requiredPlan, currentPlan, upgradeMessage,
    usedCount, limitCount, resetsAt,
  }) => {
    setModalState({
      open: true,
      errorType,
      featureName: feature || "",
      requiredPlan: requiredPlan || "discover",
      currentPlan: currentPlan || user?.plan || "free",
      upgradeMessage: upgradeMessage || "",
      usedCount: usedCount || 0,
      limitCount: limitCount || 0,
      resetsAt: resetsAt || null,
    });
  }, [user]);

  useEffect(() => {
    setOnFeatureLocked(handleApiFeatureLocked);
    return () => setOnFeatureLocked(null);
  }, [handleApiFeatureLocked]);

  const handleNavigate = (pageId) => {
    const premiumFeature = PREMIUM_FEATURE_PAGE_MAP[pageId];
    if (premiumFeature && !canAccessFeature(user, premiumFeature)) {
      const feature = premiumFeature;
      const requiredPlan = getMinimumPlanForFeature(feature);
      setModalState({
        open: true,
        featureName: feature,
        requiredPlan,
        currentPlan: user?.plan || "discover",
        upgradeMessage: FEATURE_UPGRADE_MESSAGES[feature] || "",
      });
      return;
    }
    navigate(getPathFromPageIdForAuth(pageId, true));
  };

  const handleFeatureLocked = (featureIdOrLabel) => {
    const feature = PREMIUM_FEATURE_PAGE_MAP[featureIdOrLabel] || featureIdOrLabel;
    const requiredPlan = getMinimumPlanForFeature(feature);
    setModalState({
      open: true,
      errorType: "feature_locked",
      featureName: feature,
      requiredPlan,
      currentPlan: user?.plan || "free",
      upgradeMessage: FEATURE_UPGRADE_MESSAGES[feature] || "",
      usedCount: 0,
      limitCount: 0,
      resetsAt: null,
    });
  };

  const logout = () => {
    authLogout();
    navigate(getPathFromPageId("landing"));
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden md:block">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onFeatureLocked={handleFeatureLocked}
          onLogout={logout}
        />
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

      <UpgradeModal
        isOpen={modalState.open}
        onClose={() => setModalState((s) => ({ ...s, open: false }))}
        onUpgrade={() => {
          setModalState((s) => ({ ...s, open: false }));
          navigate("/pricing");
        }}
        errorType={modalState.errorType}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        currentPlan={modalState.currentPlan}
        upgradeMessage={modalState.upgradeMessage}
        usedCount={modalState.usedCount}
        limitCount={modalState.limitCount}
        resetsAt={modalState.resetsAt}
      />
    </div>
  );
}
