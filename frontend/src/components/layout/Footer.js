import React from "react";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-20">
      <div className="max-w-content mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-sm text-gray-500">Pinnacle.ai</span>
        </div>
        <p className="text-xs text-gray-600">AI Engine Optimization Platform</p>
      </div>
    </footer>
  );
}
