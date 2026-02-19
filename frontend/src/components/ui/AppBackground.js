import React from "react";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Simple black background */}
      <div className="absolute inset-0 bg-black" />
    </div>
  );
}
