import React from "react";

export default function ScoreRing({ score, size = 80, label, color }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = color || getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2" data-testid={`score-ring-${label?.toLowerCase().replace(/\s+/g, "-") || "default"}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272A"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="font-heading font-bold text-lg">{score}</span>
      </div>
      {label && <span className="text-xs text-muted-foreground font-mono">{label}</span>}
    </div>
  );
}

export function getScoreColor(score) {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export function ScoreBadge({ score, className = "" }) {
  const color = getScoreColor(score);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold ${className}`}
      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
      data-testid="score-badge"
    >
      {score}
    </span>
  );
}
