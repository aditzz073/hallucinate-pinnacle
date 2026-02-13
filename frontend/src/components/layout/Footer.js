import React from "react";
import Logo from "../ui/Logo";

const FOOTER_LINKS = [
  { label: "Dashboard", id: "dashboard" },
  { label: "Audits", id: "audits" },
  { label: "AI Tests", id: "ai-tests" },
  { label: "Tools", id: "monitor" },
  { label: "Enterprise", id: "compare" },
  { label: "Profile", id: "profile" },
];

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/5 mt-20" data-testid="footer">
      <div className="max-w-content mx-auto px-4 py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
          {/* Left: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Logo size="sm" />
              <span className="text-base font-bold text-white">Pinnacle.ai</span>
            </div>
            <p className="text-sm text-gray-500">AI Engine Optimization Platform</p>
          </div>

          {/* Right: Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate && onNavigate(link.id)}
                className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-xs text-gray-600 text-center md:text-left">
            © 2026 Pinnacle.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
