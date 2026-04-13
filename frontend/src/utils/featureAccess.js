/**
 * Feature access — plan-aware gating for the frontend.
 *
 * Plans hierarchy: discover < optimize < dominate < founder
 */

const PLAN_HIERARCHY = ["discover", "optimize", "dominate", "founder"];

// Legacy plan name migration
const LEGACY_PLAN_MAP = {
  free: "discover",
  pro: "optimize",
  premium: "dominate",
};

export const VALID_PLANS = new Set(["discover", "optimize", "dominate", "founder", "custom"]);

export const PLAN_DISPLAY_NAMES = {
  discover: "Discover",
  optimize: "Optimize",
  dominate: "Dominate",
  founder: "Founder",
  custom: "Custom",
};

// Feature → minimum plan required
export const FEATURE_PLAN_MAP = {
  basic_audit: "discover",
  ai_visibility_score: "discover",
  basic_recommendations: "discover",
  limited_ai_testing: "discover",
  audit_history: "discover",
  advanced_audit: "optimize",
  strategy_simulator: "optimize",
  ai_testing_lab: "optimize",
  full_ai_testing: "optimize",
  competitor_intel_limited: "optimize",
  competitor_intel_full: "dominate",
  monitoring: "dominate",
  cli_access: "dominate",
  unlimited_audits: "dominate",
  enterprise_reports: "dominate",
  executive_summary: "dominate",
  api_access: "founder",
};

// Backward-compatible aliases
const FEATURE_ALIASES = {
  cli_tool: "cli_access",
  competitor_intel: "competitor_intel_limited",
};

// Page ID → feature name (used by Sidebar & Navbar for lock icons)
export const PREMIUM_FEATURE_PAGE_MAP = {
  advanced: "advanced_audit",
  simulator: "strategy_simulator",
  compare: "competitor_intel_limited",
  cli: "cli_access",
  monitor: "monitoring",
  executive: "executive_summary",
};

export const FEATURE_LABELS = {
  advanced_audit: "Advanced Audit",
  strategy_simulator: "Strategy Simulator",
  competitor_intel_limited: "Competitor Intel",
  competitor_intel_full: "Full Competitor Intel",
  cli_access: "CLI Access",
  cli_tool: "CLI Access",
  monitoring: "Monitoring",
  enterprise_reports: "Enterprise Reports",
  executive_summary: "Executive Summary",
  api_access: "API Access",
};

// Upgrade copy per feature
export const FEATURE_UPGRADE_MESSAGES = {
  strategy_simulator:
    "See exactly what changes will improve your citation probability before making them.",
  advanced_audit:
    "Get deep explainability and AI-skip analysis for any page.",
  competitor_intel_full:
    "Compare against up to 5 competitors and see exactly why AI prefers them.",
  competitor_intel_limited:
    "Unlock competitor intelligence to see why AI prefers other sites.",
  cli_access:
    "Run AEO audits directly from your terminal in CI/CD pipelines.",
  cli_tool:
    "Run AEO audits directly from your terminal in CI/CD pipelines.",
  monitoring:
    "Track AI visibility changes over time with automatic alerts.",
  enterprise_reports:
    "Generate comprehensive enterprise reports for stakeholders.",
  executive_summary:
    "Get AI-generated executive summaries across all your audits.",
  api_access:
    "Access the Pinnacle API for programmatic integrations.",
};

function normalizePlan(rawPlan, isFoundingUser = false, isSubscribed = false) {
  if (isFoundingUser) return "founder";
  if (LEGACY_PLAN_MAP[rawPlan]) return LEGACY_PLAN_MAP[rawPlan];
  if (VALID_PLANS.has(rawPlan)) return rawPlan;
  if (isSubscribed) return "optimize";
  return "discover";
}

function planRank(plan) {
  const idx = PLAN_HIERARCHY.indexOf(plan);
  if (idx >= 0) return idx;
  if (plan === "custom") return PLAN_HIERARCHY.indexOf("dominate");
  return 0;
}

/**
 * Check if a user has access to a given feature.
 */
export function canAccessFeature(user, feature) {
  feature = FEATURE_ALIASES[feature] || feature;

  const required = FEATURE_PLAN_MAP[feature];
  if (!required) return true; // unknown feature — allow

  const userPlan = normalizePlan(
    user?.plan,
    user?.isFoundingUser === true,
    user?.isSubscribed === true,
  );

  return planRank(userPlan) >= planRank(required);
}

/**
 * Get the minimum plan name required for a feature.
 */
export function getMinimumPlanForFeature(feature) {
  feature = FEATURE_ALIASES[feature] || feature;
  const planKey = FEATURE_PLAN_MAP[feature] || "discover";
  return PLAN_DISPLAY_NAMES[planKey] || planKey;
}

/**
 * Normalise a raw user object from the API, ensuring plan fields are correct.
 */
export function normalizeUserAccess(user) {
  const isFoundingUser = Boolean(user?.isFoundingUser || user?.is_privileged);
  const isSubscribed = Boolean(user?.isSubscribed);

  const plan = normalizePlan(user?.plan, isFoundingUser, isSubscribed);
  const plan_name = PLAN_DISPLAY_NAMES[plan] || plan;

  return {
    ...user,
    plan,
    plan_name,
    isSubscribed,
    isFoundingUser,
  };
}
