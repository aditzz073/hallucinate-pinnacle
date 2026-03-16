import React from "react";
import { Download, Mail } from "lucide-react";

const COVERAGE = [
  { outlet: "TechCrunch", headline: "Pinnacle.ai raises seed round to tackle LLM search optimization", date: "Jan 2025" },
  { outlet: "Search Engine Land", headline: "AEO is the new SEO , meet the startups scoring your AI visibility", date: "Feb 2025" },
  { outlet: "Marketing Brew", headline: "How brands are measuring their presence in AI-generated answers", date: "Mar 2025" },
];

export default function PressPage() {
  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Press</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Media &{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">press resources.</span>
        </h1>
        <p className="text-base max-w-[520px]" style={{ color: "var(--text-muted)" }}>
          For press inquiries, interview requests, or to access brand assets, reach out to our media team or download the press kit below.
        </p>
      </div>

      {/* Media contact + kit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Media contact</p>
          <p className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>press@pinnacle.ai</p>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>We respond within one business day.</p>
          <a
            href="mailto:press@pinnacle.ai"
            className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            <Mail className="w-4 h-4" /> Send a note
          </a>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(124,58,237,0.06) 100%)",
            border: "1px solid rgba(79,70,229,0.3)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>Press kit</p>
          <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>Logos, screenshots, and brand guidelines</p>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>Approved assets for editorial use. Please don't modify the logo.</p>
          <button className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            onClick={() => alert("Press kit download coming soon.")}
          >
            <Download className="w-4 h-4" /> Download press kit
          </button>
        </div>
      </div>

      {/* Brand details */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>About the company</p>
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Company name", value: "Pinnacle.ai" },
              { label: "Founded", value: "2024" },
              { label: "Headquarters", value: "San Francisco, CA" },
              { label: "Category", value: "AI Marketing Technology" },
              { label: "Stage", value: "Seed" },
              { label: "Team", value: "12 employees" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>Recent coverage</p>
        <div className="space-y-3">
          {COVERAGE.map(({ outlet, headline, date }) => (
            <div
              key={headline}
              className="flex items-start justify-between gap-4 rounded-xl px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#818CF8" }}>{outlet}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{headline}</p>
              </div>
              <span className="text-xs shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>{date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
