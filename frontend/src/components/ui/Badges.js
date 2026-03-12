import React from "react";

export default function SeverityBadge({ severity }) {
  const config = {
    high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  };
  const c = config[severity] || config.low;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}
      data-testid={`severity-${severity}`}
    >
      {severity}
    </span>
  );
}

export function ImpactBadge({ impact }) {
  const config = {
    positive: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "Positive" },
    negative: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", label: "Negative" },
    neutral: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30", label: "Neutral" },
  };
  const c = config[impact] || config.neutral;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}
      data-testid={`impact-${impact}`}
    >
      {c.label}
    </span>
  );
}
