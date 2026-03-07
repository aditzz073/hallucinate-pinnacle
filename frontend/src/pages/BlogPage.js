import React from "react";
import { ArrowRight, Rss } from "lucide-react";

const COMING_SOON_TOPICS = [
  "How LLMs decide what to cite: a technical deep-dive",
  "AEO vs SEO: what actually transfers and what doesn't",
  "The five dimensions of AI discoverability, explained",
  "Case study: 3x citation lift in 60 days",
  "Building an AEO content calendar from scratch",
  "Freshness signals: how often do you need to update content?",
];

export default function BlogPage() {
  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Blog</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Insights on{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI discoverability.</span>
        </h1>
        <p className="text-base max-w-[520px]" style={{ color: "var(--text-muted)" }}>
          Practical guides, case studies, and research from the Pinnacle.ai team on optimizing for LLM retrieval.
        </p>
      </div>

      {/* Coming soon banner */}
      <div
        className="rounded-2xl p-10 mb-12 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(124,58,237,0.06) 100%)",
          border: "1px solid rgba(79,70,229,0.3)",
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(79,70,229,0.15)" }}
        >
          <Rss className="w-5 h-5" style={{ color: "#818CF8" }} />
        </div>
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          First posts dropping soon
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Subscribe to get notified when we publish. No spam — just signal.
        </p>
        <form
          className="flex items-center gap-3 max-w-sm mx-auto"
          onSubmit={e => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(79,70,229,0.5)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
          <button type="submit" className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold shrink-0">
            Notify me <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Upcoming topics */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>
          Topics we're covering
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMING_SOON_TOPICS.map((topic, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span
                className="text-xs font-bold mt-0.5 shrink-0"
                style={{
                  background: "rgba(79,70,229,0.15)",
                  color: "#818CF8",
                  borderRadius: "6px",
                  padding: "2px 7px",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{topic}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
