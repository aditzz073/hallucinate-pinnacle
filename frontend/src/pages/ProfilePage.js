import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getOverview, getBillingStatus } from "../api";
import { changePassword, createPortalSession, generateApiKey } from "../api";
import { canAccessFeature, PLAN_DISPLAY_NAMES, getUsageBarColor } from "../utils/featureAccess";
import {
  User,
  Mail,
  Shield,
  FileSearch,
  Search,
  Clock,
  TrendingUp,
  ChevronDown,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Check,
  Key,
  Copy,
  UserRound,
  Settings,
  PencilLine,
  CreditCard,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwVisibility, setPwVisibility] = useState({ current: false, next: false, confirm: false });
  const [pwStatus, setPwStatus] = useState(null); // null | "loading" | "success" | "error"
  const [pwError, setPwError] = useState("");
  
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [openingBillingPortal, setOpeningBillingPortal] = useState(false);
  const [openSettings, setOpenSettings] = useState({
    security: false,
    billing: false,
    preferences: false,
  });
  const canUseCliTool = canAccessFeature(user, "cli_access");
  const canManageSubscription = Boolean(user?.isSubscribed && user?.stripeCustomerId);

  const handleOpenBilling = async () => {
    if (!canManageSubscription) {
      navigate("/pricing");
      return;
    }

    setOpeningBillingPortal(true);
    try {
      const session = await createPortalSession();
      window.location.href = session.url || session.portal_url;
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Unable to open billing portal right now.");
    } finally {
      setOpeningBillingPortal(false);
    }
  };

  const openSettingsPanel = (panel) => {
    setOpenSettings((prev) => ({ ...prev, [panel]: true }));
    setTimeout(() => {
      const el = document.getElementById("settings-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const togglePanel = (panel) => {
    setOpenSettings((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    setKeyCopied(false);
    setApiKeyError("");
    try {
      const res = await generateApiKey();
      setGeneratedKey(res.api_key);
    } catch (err) {
      setApiKeyError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to generate API key"
      );
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyKeyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getBillingStatus().catch(() => null),
    ]).then(([overviewData, billing]) => {
      setOverview(overviewData);
      setBillingData(billing);
    }).finally(() => setLoading(false));
  }, []);

  const stats = overview?.summary || {};
  
  // Determine role display
  const getRoleInfo = () => {
    const plan = user?.plan || "free";
    if (user?.isFoundingUser) {
      return { text: "Founding Access", color: "from-amber-300 to-yellow-500", icon: Shield };
    }
    if (plan === "dominate") {
      return { text: "Dominate", color: "from-violet-400 to-purple-400", icon: Shield };
    }
    if (plan === "optimize") {
      return { text: "Optimize", color: "from-blue-400 to-cyan-400", icon: Shield };
    }
    if (plan === "discover") {
      return { text: "Discover", color: "from-indigo-400 to-violet-400", icon: Shield };
    }
    if (plan === "free" && user) {
      return { text: "Free", color: "from-slate-300 to-slate-500", icon: User };
    }
    return { text: "Guest", color: "from-gray-400 to-gray-500", icon: User };
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  // Usage data
  const usage = billingData?.usage || {};
  // New embedded doc fields
  const auditsUsed    = usage.aeo_audits_used    || usage.audits_this_month    || 0;
  const auditsLimit   = usage.aeo_audits_limit   ?? usage.audits_limit;
  const aiTestsUsed   = usage.ai_lab_tests_used  || usage.ai_tests_this_month  || 0;
  const aiTestsLimit  = usage.ai_lab_tests_limit ?? usage.ai_tests_limit;
  const advancedUsed  = usage.advanced_audits_used  || 0;
  const advancedLimit = usage.advanced_audits_limit ?? null;
  const simUsed       = usage.strategy_simulator_used || 0;
  const simLimit      = usage.strategy_simulator_limit ?? null;
  const resetsAt      = usage.current_period_end || null;
  const resetsLabel   = resetsAt
    ? new Date(resetsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : null;
  const subscriptionStatus = billingData?.status || user?.subscription_status || "none";
  const nextBillingDate = billingData?.next_billing_date;
  const planName = billingData?.plan_name || PLAN_DISPLAY_NAMES[user?.plan] || "Discover";

  const statItems = [
    { icon: FileSearch, label: "Total Audits", value: stats.total_audits || 0, tint: "#60A5FA" },
    { icon: Search, label: "AI Tests", value: stats.total_ai_tests || 0, tint: "#C084FC" },
    { icon: TrendingUp, label: "Avg Score", value: stats.avg_score || "N/A", tint: "#34D399" },
    { icon: Clock, label: "Last Active", value: "Today", tint: "#FBBF24" },
  ];

  const statusColors = {
    active: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#34D399" },
    past_due: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#FBBF24" },
    canceled: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#F87171" },
    trialing: { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)", text: "#818CF8" },
    none: { bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.2)", text: "#A1A1AA" },
    pending: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#FBBF24" },
  };
  const statusStyle = statusColors[subscriptionStatus] || statusColors.none;

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-6" data-testid="profile-page">
      <section
        className="rounded-xl border p-5 md:p-6"
        style={{
          background: "linear-gradient(180deg, #1D1D2A 0%, #181824 100%)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="h-16 w-16 md:h-20 md:w-20 rounded-full border flex items-center justify-center shrink-0"
              style={{ background: "rgba(79,70,229,0.14)", borderColor: "rgba(255,255,255,0.12)" }}
            >
              <div
                className="h-12 w-12 md:h-14 md:w-14 rounded-full border flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" }}
              >
                <UserRound className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={1.8} />
              </div>
            </div>

            <div className="min-w-0">
              <h1 className="font-display text-2xl md:text-[30px] font-bold text-white leading-tight">
                {user?.nickname || user?.email?.split("@")[0] || "User"}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm truncate" style={{ color: "#9CA3AF" }}>
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user?.email || "guest@pinnacle.ai"}</span>
              </p>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}>
                <RoleIcon className="w-4 h-4" style={{ color: "#FCD34D" }} />
                <span className="text-xs md:text-sm font-semibold" style={{ color: "#F3F4F6" }}>
                  {roleInfo.text}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={() => openSettingsPanel("security")}
              className="h-10 px-3 rounded-lg border text-sm font-medium text-white inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-[2px]"
              style={{ background: "#202032", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <PencilLine className="w-4 h-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => openSettingsPanel("preferences")}
              className="h-10 px-3 rounded-lg border text-sm font-medium text-white inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-[2px]"
              style={{ background: "#202032", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </section>

      {/* ─── Billing Section ─── */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#9CA3AF" }}>
          Billing & Plan
        </h2>
        <div
          className="rounded-xl border p-5"
          style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Plan badge */}
              <div
                className="px-3 py-1.5 rounded-lg border text-sm font-bold"
                style={{ background: "rgba(79,70,229,0.12)", borderColor: "rgba(79,70,229,0.3)", color: "#A5B4FC" }}
              >
                {planName}
              </div>

              {/* Status badge */}
              <div
                className="px-2.5 py-1 rounded-md border text-xs font-semibold capitalize"
                style={{ background: statusStyle.bg, borderColor: statusStyle.border, color: statusStyle.text }}
              >
                {subscriptionStatus}
              </div>

              {nextBillingDate && (
                <p className="text-xs text-zinc-400">
                  Next billing: {nextBillingDate}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenBilling}
                disabled={openingBillingPortal}
                className="h-9 px-4 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-2 disabled:opacity-60 transition-all hover:brightness-110"
                style={{ background: "#4F46E5" }}
              >
                {openingBillingPortal ? "Opening..." : "Manage Billing"}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/pricing")}
                className="h-9 px-4 rounded-lg border text-xs font-semibold text-white transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Usage bars */}
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Audits this month</span>
                <span className="text-zinc-300 font-medium">
                  {auditsUsed} / {auditsLimit ?? "∞"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: auditsLimit ? `${Math.min((auditsUsed / auditsLimit) * 100, 100)}%` : "5%",
                    background: auditsLimit && auditsUsed >= auditsLimit ? "#F87171" : "#818CF8",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">AI Tests this month</span>
                <span className="text-zinc-300 font-medium">
                  {aiTestsUsed} / {aiTestsLimit ?? "∞"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: aiTestsLimit ? `${Math.min((aiTestsUsed / aiTestsLimit) * 100, 100)}%` : "5%",
                    background: aiTestsLimit && aiTestsUsed >= aiTestsLimit ? "#F87171" : "#34D399",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#9CA3AF" }}>
          Usage Metrics
        </h2>
        {loading ? (
          <div className="rounded-xl border p-8 flex items-center justify-center" style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-7 h-7 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border p-4 min-h-[92px] transition-all duration-200 hover:-translate-y-[2px]"
                  style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#A1A1AA" }}>
                    <Icon className="w-4 h-4" style={{ color: item.tint }} />
                    {item.label}
                  </div>
                  <p className="mt-2 text-xl font-bold text-white leading-tight">{item.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#9CA3AF" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => openSettingsPanel("security")}
            className="rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-[2px]"
            style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Lock className="w-4 h-4 mb-2" style={{ color: "#60A5FA" }} />
            <p className="text-sm font-semibold text-white">Change Password</p>
            <p className="text-xs mt-1 text-zinc-400">Manage account security</p>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("cli-card");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-[2px]"
            style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Key className="w-4 h-4 mb-2" style={{ color: "#818CF8" }} />
            <p className="text-sm font-semibold text-white">CLI Access</p>
            <p className="text-xs mt-1 text-zinc-400">Generate local access key</p>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("cli-card");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-[2px]"
            style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Shield className="w-4 h-4 mb-2" style={{ color: "#22D3EE" }} />
            <p className="text-sm font-semibold text-white">API Keys</p>
            <p className="text-xs mt-1 text-zinc-400">View and copy generated key</p>
          </button>

          <button
            type="button"
            onClick={handleOpenBilling}
            className="rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-[2px]"
            style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <CreditCard className="w-4 h-4 mb-2" style={{ color: "#FBBF24" }} />
            <p className="text-sm font-semibold text-white">Billing</p>
            <p className="text-xs mt-1 text-zinc-400">
              {canManageSubscription ? "Manage subscription and payments" : "Plan and subscription settings"}
            </p>
          </button>
        </div>
      </section>

      <section id="cli-card" className="mt-6">
        <div
          className="rounded-xl border p-4"
          style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Pinnacle CLI</p>
              <p className="text-xs mt-1 text-zinc-400">Generate API key to use locally</p>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-md border"
              style={{ color: "#A5B4FC", borderColor: "rgba(129,140,248,0.28)", background: "rgba(129,140,248,0.10)" }}
            >
              pinnacle login
            </span>
          </div>

          <div className="mt-3">
            {!canUseCliTool ? (
              <div
                className="rounded-lg p-3 border"
                style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.25)" }}
              >
                <p className="text-xs mb-2" style={{ color: "#C4B5FD" }}>
                  Available in Dominate
                </p>
                <button
                  type="button"
                  onClick={handleOpenBilling}
                  className="h-9 px-3 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "#4F46E5" }}
                >
                  {canManageSubscription ? "Manage Subscription" : "Unlock Dominate"}
                </button>
              </div>
            ) : !generatedKey ? (
              <button
                onClick={handleGenerateKey}
                disabled={generatingKey}
                className="w-full sm:w-auto h-9 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 text-white"
                style={{ background: "#4F46E5" }}
              >
                {generatingKey ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Generate API Key</>
                )}
              </button>
            ) : (
              <div className="rounded-lg border p-3" style={{ background: "#0F0F18", borderColor: "rgba(255,255,255,0.10)" }}>
                <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Key generated successfully
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-300 font-mono outline-none"
                  />
                  <button
                    onClick={copyKeyToClipboard}
                    className="p-1.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                  >
                    {keyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            {apiKeyError && <p className="text-xs text-red-400 mt-2">{apiKeyError}</p>}
          </div>
        </div>
      </section>

      <section id="settings-section" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#9CA3AF" }}>
          Settings
        </h2>

        <div className="space-y-3">
          <div className="rounded-xl border" style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              onClick={() => togglePanel("security")}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Security</p>
                  <p className="text-xs text-zinc-400">Password and account protection</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openSettings.security ? "rotate-180" : ""}`} />
            </button>

            {openSettings.security && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((v) => !v);
                    setPwStatus(null);
                    setPwError("");
                    setPwForm({ current: "", next: "", confirm: "" });
                  }}
                  className="mt-3 mb-3 h-9 px-3 rounded-lg border text-xs font-semibold text-white"
                  style={{ background: "#202032", borderColor: "rgba(255,255,255,0.12)" }}
                >
                  {showPasswordForm ? "Cancel Password Update" : "Change Password"}
                </button>

                {showPasswordForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwError("");
                  if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match"); return; }
                  if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters"); return; }
                  setPwStatus("loading");
                  try {
                    await changePassword(pwForm.current, pwForm.next);
                    setPwStatus("success");
                    setPwForm({ current: "", next: "", confirm: "" });
                    setTimeout(() => { setShowPasswordForm(false); setPwStatus(null); }, 1800);
                  } catch (err) {
                    setPwError(err?.response?.data?.detail || "Failed to change password");
                    setPwStatus("error");
                  }
                }}
                className="space-y-3"
              >
                {[{key: "current", label: "Current password"}, {key: "next", label: "New password"}, {key: "confirm", label: "Confirm new password"}].map(({ key, label }) => (
                  <div key={key} className="relative">
                    <input
                      type={pwVisibility[key] ? "text" : "password"}
                      placeholder={label}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      className="w-full h-10 rounded-lg px-3 pr-10 text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setPwVisibility(v => ({ ...v, [key]: !v[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {pwVisibility[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                ))}

                {pwError && <p className="text-xs text-red-400">{pwError}</p>}

                <button
                  type="submit"
                  disabled={pwStatus === "loading" || pwStatus === "success"}
                  className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: pwStatus === "success" ? "rgba(16,185,129,0.2)" : "#4F46E5", color: "white", border: pwStatus === "success" ? "1px solid rgba(16,185,129,0.4)" : "none" }}
                >
                  {pwStatus === "loading" && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {pwStatus === "success" && <><Check className="w-4 h-4 text-emerald-400" /> Password updated</>}
                  {(pwStatus === null || pwStatus === "error") && "Update Password"}
                </button>
              </form>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border" style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              onClick={() => togglePanel("billing")}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-300" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Billing</p>
                  <p className="text-xs text-zinc-400">Plans, features, invoices</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openSettings.billing ? "rotate-180" : ""}`} />
            </button>
            {openSettings.billing && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-sm text-zinc-300 mt-3 mb-3">Manage billing details and feature access from pricing.</p>
                <button
                  type="button"
                  onClick={handleOpenBilling}
                  disabled={openingBillingPortal}
                  className="h-9 px-3 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: "#4F46E5" }}
                >
                  {openingBillingPortal
                    ? "Opening..."
                    : canManageSubscription
                      ? "Manage Subscription"
                      : "Choose your plan"}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border" style={{ background: "#181824", borderColor: "rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              onClick={() => togglePanel("preferences")}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-300" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Preferences</p>
                  <p className="text-xs text-zinc-400">Dashboard and notification defaults</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openSettings.preferences ? "rotate-180" : ""}`} />
            </button>
            {openSettings.preferences && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-sm text-zinc-300 mt-3">Preference controls will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="w-full sm:w-auto rounded-lg border px-4 h-10 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-[2px]"
          style={{ background: "rgba(239,68,68,0.14)", borderColor: "rgba(239,68,68,0.30)", color: "#FECACA" }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </section>
    </div>
  );
}
