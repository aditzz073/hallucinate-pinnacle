import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useGuestMode(feature) {
  const { user } = useAuth();
  const [guestUsage, setGuestUsage] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const GUEST_LIMITS = {
    audits: 5,
    ai_tests: 5,
  };

  useEffect(() => {
    if (!user) {
      const stored = sessionStorage.getItem(`guest_${feature}_count`);
      setGuestUsage(parseInt(stored) || 0);
    }
  }, [user, feature]);

  const incrementUsage = () => {
    if (user) return true; // Unlimited for logged-in users

    const newCount = guestUsage + 1;
    const limit = GUEST_LIMITS[feature] || 2;

    if (newCount > limit) {
      setShowLimitModal(true);
      return false;
    }

    sessionStorage.setItem(`guest_${feature}_count`, newCount.toString());
    setGuestUsage(newCount);
    return true;
  };

  const resetUsage = () => {
    sessionStorage.removeItem(`guest_${feature}_count`);
    setGuestUsage(0);
  };

  const getRemainingUses = () => {
    if (user) return Infinity;
    const limit = GUEST_LIMITS[feature] || 2;
    return Math.max(0, limit - guestUsage);
  };

  const hasReachedLimit = () => {
    if (user) return false;
    const limit = GUEST_LIMITS[feature] || 2;
    return guestUsage >= limit;
  };

  return {
    isGuest: !user,
    guestUsage,
    remainingUses: getRemainingUses(),
    hasReachedLimit: hasReachedLimit(),
    incrementUsage,
    resetUsage,
    showLimitModal,
    setShowLimitModal,
  };
}
