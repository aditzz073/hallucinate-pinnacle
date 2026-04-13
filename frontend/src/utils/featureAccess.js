/**
 * Feature access — 5-stage plan-aware gating for the frontend.
 *
 * Stages: guest(-1) < free(0) < discover(1) < optimize(2) < dominate(3) < founder(99)
 */

// Plan level integers (mirrors backend)
export const PLAN_LEVELS = {
  guest:    -1,
  free:      0,
  discover:  1,
  optimize:  2,
  dominate:  3,
  founder:  99,
  custom:    3,  // custom ≥ dominate
};

export const PLAN_HIERARCHY = ["free", "discover", "optimize", "dominate", "founder"];

// Legacy plan name migration
const LEGACY_PLAN_MAP = {
  free:    "free",
  pro:     "optimize",
  premium: "dominate",
};

export const VALID_PLANS = new Set(["free", "discover", "optimize", "dominate", "founder", "custom"]);

export const PLAN_DISPLAY_NAMES = {
  guest:    "Guest",
  free:     "Free",
  discover: "Discover",
  optimize: "Optimize",
  dominate: "Dominate",
  founder:  "Founder",
  custom:   "Custom",
};

// ---------------------------------------------------------------------------
// Feature → minimum plan required (boolean lock)
// ---------------------------------------------------------------------------
export const FEATURE_PLAN_MAP = {
  // Free+
  basic_audit:          "free",
  ai_visibility_score:  "free",
  full_recommendations: "free",
  basic_pdf_report:     "free",
  audit_history:        "free",

  // Discover+
  advanced_audit:       "discover",
  ai_testing_lab:       "discover",
  monitoring:           "discover",

  // Optimize+
  strategy_simulator:      "optimize",
  competitor_intel:         "optimize",
  competitor_intel_limited: "optimize",
  branded_pdf_report:       "optimize",

  // Dominate only
  competitor_intel_full: "dominate",
  cli_access:            "dominate",
  executive_summary:     "dominate",
  enterprise_reports:    "dominate",
  ai_skip_reason:        "dominate",
  priority_fixes:        "dominate",
  real_time_alerts:      "dominate",
  api_access:            "dominate",
  unlimited_audits:      "dominate",
};

// Backward-compatible aliases
const FEATURE_ALIASES = {
  cli_tool:              "cli_access",
  competitor_intel:      "competitor_intel_limited",
  full_ai_testing:       "ai_testing_lab",
  limited_ai_testing:    "basic_audit",
  ai_testing_lab_run:    "ai_testing_lab",
  basic_recommendations: "full_recommendations",
};

// Page ID → feature name (used by Sidebar & Navbar for lock icons)
export const PREMIUM_FEATURE_PAGE_MAP = {
  advanced:   "advanced_audit",
  simulator:  "strategy_simulator",
  compare:    "competitor_intel_limited",
  cli:        "cli_access",
  monitor:    "monitoring",
  executive:  "executive_summary",
  "ai-testing-lab": "ai_testing_lab",
};

export const FEATURE_LABELS = {
  basic_audit:              "Page Audit",
  advanced_audit:           "Advanced Audit",
  strategy_simulator:       "Strategy Simulator",
  competitor_intel:         "Competitor Intel",
  competitor_intel_limited: "Competitor Intel",
  competitor_intel_full:    "Full Competitor Intel",
  cli_access:               "CLI Access",
  cli_tool:                 "CLI Access",
  monitoring:               "Monitoring",
  ai_testing_lab:           "AI Testing Lab",
  enterprise_reports:       "Enterprise Reports",
  executive_summary:        "Executive Summary",
  api_access:               "API Access",
};

// Upgrade copy per feature (exact strings from spec)
export const FEATURE_UPGRADE_MESSAGES = {
  advanced_audit:
    "Get deep AI explainability for any page. Available from Discover — ₹8,000/month.",
  ai_testing_lab:
    "Test your content across multiple AI engines simultaneously. Available from Discover — ₹8,000/month.",
  monitoring:
    "Track AI visibility score changes automatically. Available from Discover — ₹8,000/month.",
  strategy_simulator:
    "See exactly what fixes will improve your citation probability before making them. Available from Optimize — ₹15,000/month.",
  competitor_intel:
    "See why competitors outrank you in AI-generated answers. Available from Optimize — ₹15,000/month.",
  competitor_intel_limited:
    "See why competitors outrank you in AI-generated answers. Available from Optimize — ₹15,000/month.",
  branded_pdf_report:
    "Download branded PDF reports for clients. Available from Optimize — ₹15,000/month.",
  cli_access:
    "Run AEO audits from your terminal in CI/CD pipelines. Available in Dominate — ₹40,000/month.",
  cli_tool:
    "Run AEO audits from your terminal in CI/CD pipelines. Available in Dominate — ₹40,000/month.",
  executive_summary:
    "Get a full AI visibility portfolio summary. Available in Dominate — ₹40,000/month.",
  enterprise_reports:
    "Generate comprehensive enterprise reports for stakeholders. Available in Dominate — ₹40,000/month.",
  ai_skip_reason:
    "Understand exactly why AI skips your content. Available in Dominate — ₹40,000/month.",
  priority_fixes:
    "Get prioritized fix recommendations from AI analysis. Available in Dominate — ₹40,000/month.",
  real_time_alerts:
    "Get notified instantly when your AI visibility changes. Available in Dominate — ₹40,000/month.",
  api_access:
    "Access the Pinnacle API for programmatic integrations. Available in Dominate — ₹40,000/month.",
  competitor_intel_full:
    "Compare against up to 5 competitors. Available in Dominate — ₹40,000/month.",
};

// Monthly limits per plan (mirrors backend PLAN_LIMITS exactly)
export const PLAN_LIMITS = {
  free: {
    aeo_audits: 5,
    ai_lab_tests: 3,
    advanced_audits: 0,
    ai_testing_lab: 0,
    strategy_simulator: 0,
    competitor_intel: 0,
    monitoring_urls: 0,
    audit_history_records: 5,
  },
  discover: {
    aeo_audits: 20,
    ai_lab_tests: 10,
    advanced_audits: 5,
    ai_testing_lab: 5,
    strategy_simulator: 0,
    competitor_intel: 0,
    monitoring_urls: 1,
    audit_history_records: 30,
  },
  optimize: {
    aeo_audits: 60,
    ai_lab_tests: 30,
    advanced_audits: 20,
    ai_testing_lab: 25,
    strategy_simulator: 15,
    competitor_intel: 2,
    monitoring_urls: 5,
    audit_history_records: null, // unlimited
  },
  dominate: {
    aeo_audits: null,
    ai_lab_tests: null,
    advanced_audits: null,
    ai_testing_lab: null,
    strategy_simulator: null,
    competitor_intel: 5,
    monitoring_urls: 20,
    audit_history_records: null,
  },
  founder: {
    aeo_audits: null,
    ai_lab_tests: null,
    advanced_audits: null,
    ai_testing_lab: null,
    strategy_simulator: null,
    competitor_intel: null,
    monitoring_urls: null,
    audit_history_records: null,
  },
};

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------
function normalizePlan(rawPlan, isFoundingUser = false, isSubscribed = false) {
  if (isFoundingUser) return "founder";
  if (LEGACY_PLAN_MAP[rawPlan] !== undefined) return LEGACY_PLAN_MAP[rawPlan];
  if (VALID_PLANS.has(rawPlan)) return rawPlan;
  if (isSubscribed) return "optimize";
  return "free";
}

function planLevel(plan) {
  return PLAN_LEVELS[plan] ?? 0;
}

/**
 * Check boolean feature access (plan lock only, not usage limits).
 */
export function canAccessFeature(user, feature) {
  const f = FEATURE_ALIASES[feature] || feature;
  const required = FEATURE_PLAN_MAP[f];
  if (!required) return true; // unknown feature — allow

  if (!user) return false; // not logged in = guest

  const plan = normalizePlan(
    user?.plan,
    user?.isFoundingUser === true,
    user?.isSubscribed === true,
  );

  if (plan === "founder") return true;
  return planLevel(plan) >= planLevel(required);
}

/**
 * Get the minimum plan key required for a feature.
 */
export function getMinimumPlanKeyForFeature(feature) {
  const f = FEATURE_ALIASES[feature] || feature;
  return FEATURE_PLAN_MAP[f] || "free";
}

/**
 * Get the minimum plan display name required for a feature.
 */
export function getMinimumPlanForFeature(feature) {
  const planKey = getMinimumPlanKeyForFeature(feature);
  return PLAN_DISPLAY_NAMES[planKey] || planKey;
}

/**
 * Check if a usage limit is available for the user's current usage.
 * Pass the usage object from ProfilePage or billing/status.
 */
export function checkUsageLimit(plan, limitType, used) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS["free"];
  const limit = limits[limitType];
  if (limit === null || limit === undefined) {
    return { allowed: true, used, limit: null, unlimited: true };
  }
  const allowed = used < limit;
  return { allowed, used, limit, unlimited: false, remaining: Math.max(0, limit - used) };
}

/**
 * Return usage bar color based on percentage.
 */
export function getUsageBarColor(used, limit) {
  if (!limit) return "var(--success, #10B981)";
  const pct = (used / limit) * 100;
  if (pct >= 90) return "#EF4444"; // red
  if (pct >= 70) return "#F59E0B"; // amber
  return "#10B981"; // green
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

/**
 * Returns true if a user is on a paid plan (discover, optimize, dominate, founder, custom).
 */
export function isOnPaidPlan(user) {
  const plan = normalizePlan(user?.plan, user?.isFoundingUser, user?.isSubscribed);
  return planLevel(plan) >= planLevel("discover");
}

/**
 * Returns true if the user is on the free (registered, unpaid) stage.
 */
export function isFreeTier(user) {
  const plan = normalizePlan(user?.plan, user?.isFoundingUser, user?.isSubscribed);
  return plan === "free";
}
