import React from "react";

export default function Logo({ size = "md" }) {
  const sizes = { sm: 28, md: 36, lg: 44 };
  const s = sizes[size] || 36;
  
  return (
    <svg 
      width={s} 
      height={s} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <circle cx="32" cy="32" r="32" fill="url(#pinnacle-bg)" />
      
      {/* Inner glow ring */}
      <circle cx="32" cy="32" r="26" stroke="url(#pinnacle-ring)" strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Pinnacle peak shape - stylized "A" / mountain */}
      <path 
        d="M32 12L48 44H40L32 28L24 44H16L32 12Z" 
        fill="white"
      />
      
      {/* AI dot at the peak */}
      <circle cx="32" cy="18" r="3" fill="url(#pinnacle-accent)" />
      
      {/* Base line */}
      <rect x="20" y="46" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
      
      {/* Signal waves emanating from peak */}
      <path 
        d="M24 24C24 24 28 20 32 20C36 20 40 24 40 24" 
        stroke="url(#pinnacle-accent)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none"
        opacity="0.7"
      />
      <path 
        d="M20 28C20 28 25 22 32 22C39 22 44 28 44 28" 
        stroke="url(#pinnacle-accent)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none"
        opacity="0.4"
      />
      
      <defs>
        <linearGradient id="pinnacle-bg" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#3A9BFF" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="pinnacle-ring" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#60D5C8" />
          <stop offset="1" stopColor="#3A9BFF" />
        </linearGradient>
        <linearGradient id="pinnacle-accent" x1="20" y1="18" x2="44" y2="28">
          <stop stopColor="#60D5C8" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  );
}
