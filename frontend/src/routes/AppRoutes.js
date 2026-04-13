import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";
import { createCheckoutSession } from "../api";
import { useAuth } from "../context/AuthContext";
import { canAccessFeature, getMinimumPlanForFeature, PLAN_DISPLAY_NAMES } from "../utils/featureAccess";
import Layout, { AppShellLayout } from "../components/Layout";
import ScrollToTop from "../components/ScrollToTop";
import PrivateRoute from "../components/PrivateRoute";
import LoginPage from "../components/auth/LoginPage";
import RegisterPage from "../components/auth/RegisterPage";
import LandingPage from "../pages/LandingPage";
import PricingPage from "../pages/PricingPage";
import Dashboard from "../pages/Dashboard";
import AuditsPage from "../pages/AuditsPage";
import AITestsPage from "../pages/AITestsPage";
import AITestingLabPage from "../pages/AITestingLabPage";
import AIVisibilityLabPage from "../pages/AIVisibilityLabPage";
import CLIPage from "../pages/CLIPage";
import MonitoringPage from "../pages/MonitoringPage";
import ReportsPage from "../pages/ReportsPage";
import AdvancedAuditPage from "../pages/AdvancedAuditPage";
import SimulatorPage from "../pages/SimulatorPage";
import CompetitorPage from "../pages/CompetitorPage";
import ExecutiveSummaryPage from "../pages/ExecutiveSummaryPage";
import ProfilePage from "../pages/ProfilePage";
import { getPathFromPageIdForAuth, getTitleFromPath } from "./routeConfig";

const AboutPage = lazy(() => import("../pages/AboutPage"));
const BlogPage = lazy(() => import("../pages/BlogPage"));
const CareersPage = lazy(() => import("../pages/CareersPage"));
const PressPage = lazy(() => import("../pages/PressPage"));
const TermsDataPolicyPage = lazy(() => import("../pages/TermsDataPolicyPage"));
const CookiePolicyPage = lazy(() => import("../pages/CookiePolicyPage"));

function SuspensePage({ children }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
      {children}
    </Suspense>
  );
}

function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitleFromPath(pathname);
  }, [pathname]);

  return null;
}

function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  return <LoginPage onSwitch={() => navigate("/register", { state: location.state })} onSuccess={() => navigate(redirectTo, { replace: true })} />;
}

function RegisterRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  return <RegisterPage onSwitch={() => navigate("/login", { state: location.state })} onSuccess={() => navigate(redirectTo, { replace: true })} />;
}

function PricingRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleSelectPlan = async (plan) => {
    // If user picks discover (lowest tier), just redirect
    if (plan === "discover") {
      if (user?.isLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/register", { state: { from: { pathname: "/pricing" } } });
      }
      return;
    }

    if (!user?.isLoggedIn) {
      navigate("/login", { state: { from: { pathname: "/pricing" } } });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const session = await createCheckoutSession(plan);
      window.location.href = session.url || session.checkout_url;
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to start checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <PricingPage
      user={user}
      isCheckoutLoading={isCheckoutLoading}
      onSelectPlan={handleSelectPlan}
    />
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigateToPage = (pageId) => navigate(getPathFromPageIdForAuth(pageId, Boolean(user)));

  const handleSelectPlan = async (plan) => {
    if (plan === "discover") {
      if (user?.isLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/register", { state: { from: { pathname: "/pricing" } } });
      }
      return;
    }

    if (!user?.isLoggedIn) {
      navigate("/login", { state: { from: { pathname: "/pricing" } } });
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const session = await createCheckoutSession(plan);
      window.location.href = session.url || session.checkout_url;
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to start checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <LandingPage
      onGetStarted={() => navigate(user ? "/dashboard" : "/register")}
      onNavigate={navigateToPage}
      onSelectPlan={handleSelectPlan}
      isCheckoutLoading={isCheckoutLoading}
      user={user}
    />
  );
}

function DashboardRoute() {
  const navigate = useNavigate();
  const navigateToPage = (pageId) => navigate(getPathFromPageIdForAuth(pageId, true));

  return <Dashboard onNavigate={navigateToPage} />;
}

function AuditsRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <AuditsPage onSignUp={() => navigate(user?.isLoggedIn ? "/pricing" : "/login")} />;
}

function AITestsRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <AITestsPage onSignUp={() => navigate(user?.isLoggedIn ? "/pricing" : "/login")} />;
}

function AITestingLabRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <AITestingLabPage onSignUp={() => navigate(user?.isLoggedIn ? "/pricing" : "/login")} />;
}

function AIVisibilityLabRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <AIVisibilityLabPage onSignUp={() => navigate(user?.isLoggedIn ? "/pricing" : "/login")} />;
}

function CLIRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <CLIPage onGetStarted={() => navigate(user?.isLoggedIn ? "/pricing" : "/login")} />;
}

function PremiumFeatureRoute({ feature, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (canAccessFeature(user, feature)) {
    return children;
  }

  const requiredPlan = getMinimumPlanForFeature(feature);

  return (
    <div className="max-w-[760px] mx-auto pt-12">
      <div
        className="rounded-2xl p-7"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#818CF8" }}>
          Available in {requiredPlan}
        </p>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Upgrade to unlock
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          This feature is available on the {requiredPlan} plan.
        </p>
        <div
          className="rounded-xl px-4 py-3 mb-5"
          style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.22)" }}
        >
          <p className="text-sm" style={{ color: "#C7D2FE" }}>
            Your account is on the {PLAN_DISPLAY_NAMES[user?.plan] || "Discover"} plan. Upgrade to unlock full access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary rounded-lg px-4 py-2.5 text-sm font-semibold" onClick={() => navigate("/pricing")}>
            Choose your plan
          </button>
          <button
            className="rounded-lg px-4 py-2.5 text-sm font-medium"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const { loading } = useAuth();

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

  return (
    <>
      <ScrollToTop />
      <TitleManager />

      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />

        <Route element={<Layout />}>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/pricing" element={<PricingRoute />} />
          <Route path="/trial/audits" element={<AuditsRoute />} />
          <Route path="/trial/ai-visibility-lab" element={<AIVisibilityLabRoute />} />
          <Route path="/ai-tests" element={<AITestsRoute />} />
          <Route path="/ai-testing-lab" element={<AITestingLabRoute />} />
          <Route path="/tools" element={<AITestingLabRoute />} />

          <Route path="/about" element={<SuspensePage><AboutPage /></SuspensePage>} />
          <Route path="/blog" element={<SuspensePage><BlogPage /></SuspensePage>} />
          <Route path="/careers" element={<SuspensePage><CareersPage /></SuspensePage>} />
          <Route path="/press" element={<SuspensePage><PressPage /></SuspensePage>} />
          <Route path="/terms-and-data-policy" element={<SuspensePage><TermsDataPolicyPage /></SuspensePage>} />
          <Route path="/privacy" element={<Navigate to="/terms-and-data-policy" replace />} />
          <Route path="/terms" element={<Navigate to="/terms-and-data-policy" replace />} />
          <Route path="/cookies" element={<SuspensePage><CookiePolicyPage /></SuspensePage>} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<AppShellLayout />}>
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/audits" element={<AuditsRoute />} />
            <Route path="/ai-visibility-lab" element={<AIVisibilityLabRoute />} />
            <Route path="/cli" element={<PremiumFeatureRoute feature="cli_access"><CLIRoute /></PremiumFeatureRoute>} />
            <Route path="/monitor" element={<PremiumFeatureRoute feature="monitoring"><MonitoringPage /></PremiumFeatureRoute>} />
            <Route path="/changes" element={<PremiumFeatureRoute feature="monitoring"><MonitoringPage /></PremiumFeatureRoute>} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/advanced-audit" element={<PremiumFeatureRoute feature="advanced_audit"><AdvancedAuditPage /></PremiumFeatureRoute>} />
            <Route path="/simulator" element={<PremiumFeatureRoute feature="strategy_simulator"><SimulatorPage /></PremiumFeatureRoute>} />
            <Route path="/competitor-intel" element={<PremiumFeatureRoute feature="competitor_intel_limited"><CompetitorPage /></PremiumFeatureRoute>} />
            <Route path="/executive-summary" element={<PremiumFeatureRoute feature="executive_summary"><ExecutiveSummaryPage /></PremiumFeatureRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
