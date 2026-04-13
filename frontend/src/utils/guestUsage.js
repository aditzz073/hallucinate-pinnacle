/**
 * Guest usage tracking — localStorage-based quota for unauthenticated users.
 *
 * Storage key: "pinnacle_guest_usage"
 * Tracks: aeo_audits (max 2), ai_lab_tests (max 2) per 30-day window.
 */

const GUEST_STORAGE_KEY = "pinnacle_guest_usage";
const GUEST_LIMITS = {
  aeo_audits: 2,
  ai_lab_tests: 2,
};

function _getGuestUsage() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function _saveGuestUsage(data) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable — fail silently
  }
}

function _initUsage() {
  const now = new Date().toISOString();
  const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return {
    aeo_audits: 0,
    ai_lab_tests: 0,
    first_used: now,
    reset_date: resetDate,
  };
}

/**
 * Get current guest usage, resetting if 30-day period has passed.
 */
export function getGuestUsage() {
  const usage = _getGuestUsage();
  if (!usage) return _initUsage();

  // Check if reset window has passed
  if (usage.reset_date && new Date() > new Date(usage.reset_date)) {
    const reset = _initUsage();
    _saveGuestUsage(reset);
    return reset;
  }

  return usage;
}

/**
 * Check if guest can perform an action.
 * @param {"aeo_audits"|"ai_lab_tests"} actionType
 * @returns {{ allowed: boolean, used: number, limit: number, remaining: number }}
 */
export function checkGuestLimit(actionType) {
  const usage = getGuestUsage();
  const used = usage[actionType] || 0;
  const limit = GUEST_LIMITS[actionType] || 0;
  const allowed = used < limit;
  return { allowed, used, limit, remaining: Math.max(0, limit - used) };
}

/**
 * Increment a guest usage counter after successful action.
 * @param {"aeo_audits"|"ai_lab_tests"} actionType
 */
export function incrementGuestUsage(actionType) {
  let usage = getGuestUsage();
  if (!usage.first_used) {
    usage = _initUsage();
  }
  usage[actionType] = (usage[actionType] || 0) + 1;
  _saveGuestUsage(usage);
}

/**
 * Returns true if the guest has used ALL of their limit for a given action.
 */
export function isGuestLimitReached(actionType) {
  const { allowed } = checkGuestLimit(actionType);
  return !allowed;
}

/**
 * Reset all guest usage (e.g. after registration).
 */
export function clearGuestUsage() {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ignore
  }
}
