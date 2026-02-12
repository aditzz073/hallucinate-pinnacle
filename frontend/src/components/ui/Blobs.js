import React from "react";

export default function Blobs({ variant = "default" }) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-purple absolute -top-40 -left-40 animate-float" />
        <div className="blob blob-blue absolute top-20 right-[-10%] animate-float-delayed" />
        <div className="blob blob-pink absolute bottom-[-10%] left-[20%] animate-float-slow" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
      </div>
    );
  }
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="blob blob-purple absolute -top-60 -right-40 opacity-30 animate-float" style={{ width: 400, height: 400 }} />
      <div className="blob blob-blue absolute bottom-[-10%] -left-20 opacity-20 animate-float-delayed" style={{ width: 350, height: 350 }} />
    </div>
  );
}
