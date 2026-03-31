import React from "react";

/**
 * RAG (Red / Amber / Green) status indicator.
 * Thresholds: Red (0–39), Amber (40–69), Green (70–100)
 */

const RAG_LEVELS = [
  { max: 39, label: "Red", color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  { max: 69, label: "Amber", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  { max: 100, label: "Green", color: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
];

export function getRAGLevel(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));
  return RAG_LEVELS.find((l) => s <= l.max) || RAG_LEVELS[2];
}

export default function RAGIndicator({ score, label, compact = false }) {
  const level = getRAGLevel(score);
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  if (compact) {
    return (
      <div className="flex items-center gap-2" title={`${label}: ${s} (${level.label})`}>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: level.color, boxShadow: `0 0 6px ${level.color}40` }}
        />
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-semibold" style={{ color: level.color }}>{s}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-xl"
      style={{ background: level.bg, border: `1px solid ${level.border}` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: level.color, boxShadow: `0 0 8px ${level.color}50` }}
        />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ color: level.color, background: `${level.color}15` }}
        >
          {level.label}
        </span>
        <span className="text-sm font-bold" style={{ color: level.color }}>{s}</span>
      </div>
    </div>
  );
}

export function RAGChart({ scores, className = "" }) {
  if (!scores || Object.keys(scores).length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(scores).map(([key, value]) => (
        <RAGIndicator
          key={key}
          label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          score={value}
        />
      ))}
    </div>
  );
}
