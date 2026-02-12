import React from "react";

export default function Logo({ size = "md" }) {
  const sizes = { sm: 28, md: 32, lg: 40 };
  const s = sizes[size] || 32;
  return (
    <svg width={s} height={s} viewBox="0 0 756 756" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="378" cy="378" r="378" fill="url(#logo-gradient)" />
      <circle cx="378" cy="378" r="280" fill="white" fillOpacity="0.15" />
      <path d="M378 180L498 480H258L378 180Z" fill="white" fillOpacity="0.9" />
      <path d="M378 240L448 440H308L378 240Z" fill="url(#logo-gradient)" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="756" y2="756">
          <stop stopColor="#3A9BFF" />
          <stop offset="1" stopColor="#60D5C8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
