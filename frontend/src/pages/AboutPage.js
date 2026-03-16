import React from "react";
import { Zap, Shield, TrendingUp, Users, Target, Globe } from "lucide-react";

const VALUES = [
  {
    icon: Zap,
    title: "Speed over ceremony",
    desc: "We build fast, ship often, and iterate based on real user feedback. No committees, no waiting.",
  },
  {
    icon: Shield,
    title: "Determinism by design",
    desc: "Every score we produce is explainable, reproducible, and backed by a clear methodology.",
  },
  {
    icon: TrendingUp,
    title: "Outcome-first",
    desc: "We measure ourselves by whether your content gets recognized, not by dashboard views.",
  },
  {
    icon: Users,
    title: "Built with practitioners",
    desc: "Our roadmap is driven by SEOs, content teams, and growth leads who use the product daily.",
  },
  {
    icon: Target,
    title: "Precision over noise",
    desc: "We surface only the signals that move the needle. Less clutter, more signal.",
  },
  {
    icon: Globe,
    title: "AI-native from day one",
    desc: "We didn't bolt AI on top of legacy SEO tooling. We designed for LLM retrieval from scratch.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-8">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>
          About us
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-6" style={{ color: "var(--foreground)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          We're building the OS for<br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI discoverability.</span>
        </h1>
        <p className="text-base max-w-[600px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Pinnacle.ai was founded on a simple observation: the rules of content discovery changed overnight when LLMs became the default interface for information. We built the tooling to help brands win in this new landscape.
        </p>
      </div>

      {/* Mission */}
      <div
        className="rounded-2xl p-8 mb-16"
        style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(124,58,237,0.06) 100%)",
          border: "1px solid rgba(79,70,229,0.3)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>Our mission</p>
        <p className="text-2xl font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
          Make every piece of quality content findable by AI , and make sure brands get the attribution they deserve.
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
        <div>
          <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>The story</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
            In 2024, we started noticing something: brands with objectively great content were getting zero mentions from AI assistants, while thinner content with better structural signals was being recognized constantly. The problem wasn't quality, it was legibility to AI retrieval systems.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
            We spent months reverse-engineering how systems like ChatGPT, Perplexity, and Gemini select and recognize sources. The result was a deterministic scoring framework across five dimensions: authority, structure, content, technical, and freshness.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Pinnacle.ai is that framework , productized, automated, and continuously updated as the AI retrieval landscape evolves.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { label: "Founded", value: "2024" },
            { label: "Headquartered", value: "San Francisco, CA" },
            { label: "Team size", value: "12 and growing" },
            { label: "Pages analyzed", value: "2.4M+" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-8" style={{ color: "var(--foreground)" }}>What we believe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "rgba(79,70,229,0.12)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#818CF8" }} />
              </div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
