export const ROUTES = {
  landing: { path: "/", title: "Pinnacle" },
  dashboard: { path: "/dashboard", title: "Dashboard | Pinnacle" },
  audits: { path: "/audits", title: "Audits | Pinnacle" },
  "ai-visibility-lab": { path: "/ai-visibility-lab", title: "AI Visibility Lab | Pinnacle" },
  "ai-tests": { path: "/ai-tests", title: "AI Tests | Pinnacle" },
  "ai-testing-lab": { path: "/ai-testing-lab", title: "AI Testing Lab | Pinnacle" },
  tools: { path: "/tools", title: "Tools | Pinnacle" },
  cli: { path: "/cli", title: "CLI Tool | Pinnacle" },
  monitor: { path: "/monitor", title: "Monitoring | Pinnacle" },
  changes: { path: "/changes", title: "Monitoring | Pinnacle" },
  reports: { path: "/reports", title: "Reports | Pinnacle" },
  advanced: { path: "/advanced-audit", title: "Advanced Audit | Pinnacle" },
  simulator: { path: "/simulator", title: "Strategy Simulator | Pinnacle" },
  compare: { path: "/competitor-intel", title: "Competitor Intel | Pinnacle" },
  executive: { path: "/executive-summary", title: "Executive Summary | Pinnacle" },
  profile: { path: "/profile", title: "Profile | Pinnacle" },
  about: { path: "/about", title: "About | Pinnacle" },
  blog: { path: "/blog", title: "Blog | Pinnacle" },
  careers: { path: "/careers", title: "Careers | Pinnacle" },
  press: { path: "/press", title: "Press | Pinnacle" },
  privacy: { path: "/privacy", title: "Privacy Policy | Pinnacle" },
  terms: { path: "/terms", title: "Terms of Service | Pinnacle" },
  cookies: { path: "/cookies", title: "Cookie Policy | Pinnacle" },
  pricing: { path: "/pricing", title: "Pricing | Pinnacle" },
  login: { path: "/login", title: "Sign In | Pinnacle" },
  register: { path: "/register", title: "Sign Up | Pinnacle" },
};

const TRIAL_ROUTES = {
  audits: "/trial/audits",
  "ai-visibility-lab": "/trial/ai-visibility-lab",
};

export const APP_PAGE_IDS = [
  "dashboard",
  "audits",
  "ai-visibility-lab",
  "ai-tests",
  "ai-testing-lab",
  "cli",
  "monitor",
  "changes",
  "reports",
  "advanced",
  "simulator",
  "compare",
  "executive",
  "profile",
];

export const PRIVATE_PAGE_IDS = [
  "dashboard",
  "cli",
  "monitor",
  "reports",
  "advanced",
  "simulator",
  "compare",
  "executive",
  "profile",
];

const NORMALIZED_PATH_TO_ID = Object.entries(ROUTES).reduce((acc, [id, cfg]) => {
  acc[cfg.path] = id;
  return acc;
}, {});

NORMALIZED_PATH_TO_ID[TRIAL_ROUTES.audits] = "audits";
NORMALIZED_PATH_TO_ID[TRIAL_ROUTES["ai-visibility-lab"]] = "ai-visibility-lab";

export function normalizePath(pathname = "/") {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function getPageIdFromPath(pathname = "/") {
  const normalized = normalizePath(pathname);
  return NORMALIZED_PATH_TO_ID[normalized] || "landing";
}

export function getPathFromPageId(pageId) {
  return ROUTES[pageId]?.path || ROUTES.landing.path;
}

export function getPathFromPageIdForAuth(pageId, isAuthenticated) {
  if (!isAuthenticated && TRIAL_ROUTES[pageId]) {
    return TRIAL_ROUTES[pageId];
  }

  return getPathFromPageId(pageId);
}

export function getTitleFromPath(pathname = "/") {
  const pageId = getPageIdFromPath(pathname);
  return ROUTES[pageId]?.title || "Pinnacle";
}
