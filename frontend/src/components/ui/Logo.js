import React from "react";

export default function Logo({ size = "md" }) {
  const sizes = { sm: 28, md: 36, lg: 44 };
  const h = sizes[size] || 36;
  const w = Math.round(h * 1.25);

  return (
    <img
      src="/logo.png"
      alt="Pinnacle"
      width={w}
      height={h}
      style={{ objectFit: "contain", display: "block", borderRadius: 6, filter: "invert(1)" }}
    />
  );
}
