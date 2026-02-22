import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistorySlider({ history, currentIndex, onNavigateBack, onNavigateForward }) {
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;
  
  // Get page display names
  const getPageName = (pageId) => {
    const pageNames = {
      'landing': 'Home',
      'audits': 'Audits',
      'ai-tests': 'AI Tests',
      'dashboard': 'Dashboard',
      'monitor': 'Monitor',
      'reports': 'Reports',
      'advanced': 'Advanced Audit',
      'simulator': 'Strategy Simulator',
      'compare': 'Competitor Intel',
      'executive': 'Executive Summary',
      'profile': 'Profile'
    };
    return pageNames[pageId] || pageId;
  };

  // Don't show if only one page in history
  if (history.length <= 1) return null;

  const currentPage = history[currentIndex];
  const previousPage = canGoBack ? history[currentIndex - 1] : null;
  const nextPage = canGoForward ? history[currentIndex + 1] : null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/20 rounded-full px-4 py-3 shadow-2xl">
        {/* Back Button */}
        <button
          onClick={onNavigateBack}
          disabled={!canGoBack}
          className={`p-2 rounded-full transition-all duration-200 ${
            canGoBack
              ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
          title={previousPage ? `Back to ${getPageName(previousPage)}` : 'No previous page'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Current Page Indicator */}
        <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-white">
              {getPageName(currentPage)}
            </span>
          </div>
        </div>

        {/* Forward Button */}
        <button
          onClick={onNavigateForward}
          disabled={!canGoForward}
          className={`p-2 rounded-full transition-all duration-200 ${
            canGoForward
              ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
          title={nextPage ? `Forward to ${getPageName(nextPage)}` : 'No next page'}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* History Progress Indicator */}
        <div className="ml-2 flex items-center gap-1">
          {history.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-blue-400'
                  : index < currentIndex
                  ? 'w-1.5 bg-white/30'
                  : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          {currentIndex + 1} of {history.length}
        </p>
      </div>
    </div>
  );
}
