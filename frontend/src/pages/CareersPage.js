import React from "react";
import { ArrowRight, MapPin, Clock } from "lucide-react";

const OPEN_ROLES = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "San Francisco / Remote",
    type: "Full-time",
  },
  {
    title: "AI/ML Engineer",
    team: "Engineering",
    location: "San Francisco / Remote",
    type: "Full-time",
  },
  {
    title: "Head of Growth",
    team: "Marketing",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Manager",
    team: "Customer Success",
    location: "Remote",
    type: "Full-time",
  },
];

const PERKS = [
  { label: "Competitive salary + equity" },
  { label: "Remote-first team" },
  { label: "Unlimited PTO" },
  { label: "Health, dental, and vision" },
  { label: "$2,000 home-office stipend" },
  { label: "Learning & development budget" },
];

export default function CareersPage() {
  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Careers</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Help us define{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">the future of discovery.</span>
        </h1>
        <p className="text-base max-w-[560px]" style={{ color: "var(--text-muted)" }}>
          We're a small team moving fast. If you want to work on a genuinely new problem with the people shaping how AI finds information, you're in the right place.
        </p>
      </div>

      {/* Perks */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>What we offer</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PERKS.map(({ label }) => (
            <div
              key={label}
              className="rounded-xl px-4 py-3 flex items-center gap-2.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#818CF8" }} />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
          Open positions
        </p>
        <div className="space-y-3">
          {OPEN_ROLES.map((role) => (
            <div
              key={role.title}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl px-5 py-4 transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
              onClick={() => window.location.href = "mailto:careers@pinnacle.ai?subject=Application: " + role.title}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>{role.title}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(79,70,229,0.12)", color: "#818CF8" }}>
                    {role.team}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <MapPin className="w-3 h-3" /> {role.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Clock className="w-3 h-3" /> {role.type}
                  </span>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0" style={{ color: "#818CF8" }}>
                Apply <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Don't see your role?{" "}
          <a
            href="mailto:careers@pinnacle.ai"
            className="underline"
            style={{ color: "#818CF8" }}
          >
            Send us a note
          </a>{" "}
          , we're always interested in exceptional people.
        </p>
      </div>
    </div>
  );
}
