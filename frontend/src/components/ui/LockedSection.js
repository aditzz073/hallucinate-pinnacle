import React from 'react';
import { Lock, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LockedSection({ title, description, onUnlock, children }) {
  const { isLoggedIn, setShowUpgradeModal } = useAuth();

  const handleAction = () => {
    if (isLoggedIn) {
      setShowUpgradeModal(true);
    } else if (onUnlock) {
      onUnlock();
    }
  };

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden">
      {/* Blurred content */}
      <div className="blur-[6px] opacity-30 pointer-events-none select-none grayscale-[50%]">
        {children || (
          <div className="space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-32 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        )}
      </div>

      {/* Unlock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
        <div className="text-center px-6 max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">{description}</p>
          <button
            onClick={handleAction}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all duration-300 transform hover:scale-105"
          >
            {isLoggedIn ? (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade to Unlock
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Continue
              </>
            )}
          </button>
          
          {!isLoggedIn && (
            <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
              Available on all paid tiers
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
