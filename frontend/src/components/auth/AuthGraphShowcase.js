import React, { useEffect, useMemo, useState } from "react";

const CARD_LAYOUT = [
  { top: "8%", left: "7%", rotate: -10, w: 236, h: 142, delay: "0s", metric: "Citation Probability", period: "7d" },
  { top: "7%", left: "50%", rotate: 8, w: 226, h: 136, delay: "1.4s", metric: "Brand Retention", period: "7d" },
  { top: "34%", left: "12%", rotate: -6, w: 246, h: 146, delay: "2.1s", metric: "Generative Readiness", period: "30d" },
  { top: "37%", left: "56%", rotate: 10, w: 220, h: 132, delay: "0.9s", metric: "Schema Support", period: "30d" },
  { top: "64%", left: "14%", rotate: 6, w: 232, h: 140, delay: "1.8s", metric: "Authority Score", period: "14d" },
  { top: "66%", left: "55%", rotate: -8, w: 222, h: 134, delay: "2.8s", metric: "Engine Readiness", period: "14d" },
];

const SERIES_COLORS = ["#818CF8", "#A78BFA", "#22D3EE", "#34D399", "#F59E0B", "#F472B6"];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildPath(seed, phase, width = 170, height = 60, points = 9) {
  const step = width / (points - 1);
  let d = "";
  const base = 0.3 + (seededRandom(seed * 0.3) * 0.35);
  const trend = (seededRandom(seed * 0.9) - 0.5) * 0.2;
  const waveAmp = 0.12 + (seededRandom(seed * 1.4) * 0.08);

  for (let i = 0; i < points; i += 1) {
    const progress = i / (points - 1);
    const wave = Math.sin((progress * Math.PI * 2) + phase + (seed * 0.6)) * waveAmp;
    const jitter = (seededRandom(seed + (i * 7.13) + (phase * 10)) - 0.5) * 0.08;
    const raw = base + (progress * trend) + wave + jitter;
    const normalized = Math.min(0.95, Math.max(0.05, raw));
    const y = Math.round(8 + ((1 - normalized) * (height - 16)));
    const x = Math.round(i * step);
    d += `${i === 0 ? "M" : "L"}${x} ${y} `;
  }

  return d.trim();
}

function makeSeries(phase = 0) {
  return CARD_LAYOUT.map((layout, i) => ({
    id: i,
    path: buildPath((i + 1) * 10.7, phase),
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    value: 58 + Math.round(seededRandom((i + 1) * 31.7 + phase) * 31),
    ...layout,
  }));
}

export default function AuthGraphShowcase() {
  const [phase, setPhase] = useState(0);
  const series = useMemo(() => makeSeries(phase), [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => p + 0.42);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:block relative min-h-screen overflow-hidden auth-showcase-bg">
      <div className="absolute inset-0 auth-showcase-grid" />
      <div className="absolute inset-0 auth-showcase-vignette" />

      {series.map((card) => (
        <div
          key={card.id}
          className="auth-graph-card"
          style={{
            top: card.top,
            left: card.left,
            width: `${card.w}px`,
            height: `${card.h}px`,
            "--rot": `${card.rotate}deg`,
            animationDelay: card.delay,
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold" style={{ color: "#DDE2FF" }}>{card.metric}</span>
            <span className="text-[10px]" style={{ color: "#8B90B6" }}>{card.value}%</span>
          </div>
          <svg width="100%" height="76" viewBox="0 0 170 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`authGradient-${card.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={card.color} stopOpacity="0.12" />
                <stop offset="100%" stopColor={card.color} stopOpacity="0.36" />
              </linearGradient>
            </defs>
            <path
              d={`${card.path} L170 60 L0 60 Z`}
              fill={`url(#authGradient-${card.id})`}
              opacity="0.45"
              className="auth-graph-fill"
              style={{ transition: "d 1.2s ease-in-out" }}
            />
            <path
              d={card.path}
              stroke={card.color}
              strokeWidth="2"
              fill="none"
              className="auth-graph-path"
              style={{ transition: "d 1.2s ease-in-out" }}
            />
          </svg>

          <div className="flex items-center justify-between mt-1 text-[10px]" style={{ color: "#7E85AB" }}>
            <span>{card.period}</span>
            <span>updated now</span>
          </div>
        </div>
      ))}

      <div className="absolute bottom-10 right-10 text-right">
        <p className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>Pinnacle insights preview</p>
        <p className="text-xs" style={{ color: "#8B90B6" }}>Real-time visibility indicators</p>
      </div>
    </div>
  );
}
