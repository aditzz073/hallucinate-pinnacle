export const PREMIUM_FEATURES = [
  "advanced_audit",
  "strategy_simulator",
  "competitor_intel",
  "cli_tool",
];

export const PREMIUM_FEATURE_PAGE_MAP = {
  advanced: "advanced_audit",
  simulator: "strategy_simulator",
  compare: "competitor_intel",
  cli: "cli_tool",
};

export const FEATURE_LABELS = {
  advanced_audit: "Advanced Audit",
  strategy_simulator: "Strategy Simulator",
  competitor_intel: "Competitor Intel",
  cli_tool: "CLI Tool",
};

export function canAccessFeature(user, feature) {
  if (!PREMIUM_FEATURES.includes(feature)) {
    return true;
  }

  if (user?.isFoundingUser === true) {
    return true;
  }

  if (user?.isSubscribed === true) {
    return true;
  }

  return false;
}

export function normalizeUserAccess(user) {
  const isFoundingUser = Boolean(user?.isFoundingUser || user?.is_privileged);
  const isSubscribed = Boolean(user?.isSubscribed);

  let plan = user?.plan;
  if (!plan) {
    if (isFoundingUser) {
      plan = "founder";
    } else if (isSubscribed) {
      plan = "pro";
    } else {
      plan = "free";
    }
  }

  return {
    ...user,
    plan,
    isSubscribed,
    isFoundingUser,
  };
}
