/**
 * UsageWidget — compact progress bars for dashboard.
 * Shows the 2 most relevant limits for the user's plan.
 * Requires billingStatus from GET /api/billing/status.
 */
import React from "react";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PLAN_LIMITS, getUsageBarColor } from "../../utils/featureAccess";

function UsageBar({ label, used, limit, resetsLabel }) {
  if (limit === null || limit === undefined) return null;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = getUsageBarColor(used, limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: pct >= 90 ? "#EF4444" : "var(--foreground)" }}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function UsageWidget({ plan, usage, resetsAt }) {
  const navigate = useNavigate();
  const planLimits = PLAN_LIMITS[plan] || PLAN_LIMITS["free"];

  const resetsLabel = resetsAt
    ? new Date(resetsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : null;

  // Dominate/founder: show total stats, no progress bars
  if (plan === "dominate" || plan === "founder" || plan === "custom") {
    return (
      <div
        className="metric-card"
        style={{ padding: "12px 16px", background: "rgba(79,70,229,0.04)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
          <span className="text-xs font-semibold" style={{ color: "#818CF8" }}>Usage</span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Unlimited — {usage?.aeo_audits_used || 0} audits run this month
        </p>
      </div>
    );
  }

  // Determine which 2 limits to show per plan
  const bars = {
    free: [
      { label: "Audits", key: "aeo_audits", usedKey: "aeo_audits_used" },
      { label: "AI Tests", key: "ai_lab_tests", usedKey: "ai_lab_tests_used" },
    ],
    discover: [
      { label: "Audits", key: "aeo_audits", usedKey: "aeo_audits_used" },
      { label: "Advanced", key: "advanced_audits", usedKey: "advanced_audits_used" },
    ],
    optimize: [
      { label: "Audits", key: "aeo_audits", usedKey: "aeo_audits_used" },
      { label: "Simulator", key: "strategy_simulator", usedKey: "strategy_simulator_used" },
    ],
  };

  const planBars = bars[plan] || bars["free"];

  return (
    <div
      className="metric-card"
      style={{ padding: "12px 16px", background: "rgba(79,70,229,0.04)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
          <span className="text-xs font-semibold" style={{ color: "#818CF8" }}>Usage</span>
        </div>
        {resetsLabel && (
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            Resets {resetsLabel}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {planBars.map(({ label, key, usedKey }) => (
          <UsageBar
            key={key}
            label={label}
            used={usage?.[usedKey] || 0}
            limit={planLimits[key]}
            resetsLabel={resetsLabel}
          />
        ))}
      </div>

      {plan === "free" && (
        <button
          onClick={() => navigate("/pricing")}
          className="mt-3 text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ color: "#818CF8" }}
        >
          Upgrade for unlimited →
        </button>
      )}
    </div>
  );
}
