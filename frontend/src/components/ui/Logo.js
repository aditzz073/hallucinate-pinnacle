import React from "react";

export default function Logo({ size = "md" }) {
  const sizes = { sm: 32, md: 40, lg: 48 };
  const s = sizes[size] || 40;
  return (
    <img 
      src="/logo.png" 
      alt="Pinnacle.ai" 
      width={s} 
      height={s}
      style={{ objectFit: 'contain' }}
    />
  );
}
