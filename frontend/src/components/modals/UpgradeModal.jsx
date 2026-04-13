import React from "react";
import { Lock, X, TrendingUp, Rocket, Calendar } from "lucide-react";
import {
  FEATURE_UPGRADE_MESSAGES,
  PLAN_DISPLAY_NAMES,
} from "../../utils/featureAccess";
import { useNavigate } from "react-router-dom";

const DEFAULT_MESSAGE = "Unlock this feature by upgrading your plan.";

/**
 * UpgradeModal — handles 3 distinct states from the API:
 *
 *  "feature_locked"      → 403: wrong plan entirely
 *  "usage_limit_reached" → 429: hit monthly cap
 *  "no_active_plan"      → 403: free user hitting any paid feature
 */
export default function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  // State discriminator — "feature_locked" | "usage_limit_reached" | "no_active_plan"
  errorType = "feature_locked",
  featureName = "",
  requiredPlan = "discover",
  currentPlan = "free",
  upgradeMessage = "",
  // usage_limit_reached props
  usedCount = 0,
  limitCount = 0,
  resetsAt = null,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const displayPlan = PLAN_DISPLAY_NAMES[requiredPlan] || requiredPlan || "Discover";
  const message =
    upgradeMessage ||
    FEATURE_UPGRADE_MESSAGES[featureName] ||
    DEFAULT_MESSAGE;

  // Compute "resets in X days"
  const resetsInDays = resetsAt
    ? Math.max(0, Math.ceil((new Date(resetsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const resetsLabel = resetsAt
    ? new Date(resetsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : null;

  // --- Feature Locked (403 feature_locked) ---
  if (errorType === "feature_locked") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D0D1F] shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 mb-6">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Unlock {featureName
                ? featureName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                : "this feature"}
            </h2>

            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              {message}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => onUpgrade(requiredPlan)}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                Upgrade to {displayPlan}
              </button>
              <button
                onClick={() => { onClose(); navigate("/pricing"); }}
                className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                See all plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Usage Limit Reached (429 usage_limit_reached) ---
  if (errorType === "usage_limit_reached") {
    const pct = limitCount > 0 ? Math.round((usedCount / limitCount) * 100) : 100;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0D0D1F] shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Monthly limit reached
            </h2>

            <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto leading-relaxed">
              You've used <span className="text-amber-400 font-semibold">{usedCount}/{limitCount}</span> this month.
              {resetsLabel && <span> Resets on <span className="text-white">{resetsLabel}</span>.</span>}
              {" "}Upgrade for more.
            </p>

            {/* Usage bar */}
            <div className="h-2 rounded-full overflow-hidden mb-6 mx-4" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, pct)}%`, background: "#F59E0B" }}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { onClose(); navigate("/pricing"); }}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
              >
                Upgrade for more
              </button>
              <div
                className="w-full py-3 text-sm font-medium text-center select-none"
                style={{ color: "var(--muted, #6B7280)" }}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                {resetsInDays !== null
                  ? `Resets in ${resetsInDays} day${resetsInDays !== 1 ? "s" : ""}`
                  : "Resets next month"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- No Active Plan (403 no_active_plan) ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D0D1F] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 mb-6">
            <Rocket className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Choose a plan to continue
          </h2>

          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            You're on a free account. Pick a plan to access this feature and unlock
            everything Pinnacle has to offer.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { onClose(); navigate("/pricing"); }}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
            >
              View Plans
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg border text-sm font-medium text-white transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
