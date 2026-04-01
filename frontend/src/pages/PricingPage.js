import React from "react";
import { Check, X } from "lucide-react";

const FREE_FEATURES = [
  "Basic AEO audit",
  "Limited AI testing",
  "No history",
  "No advanced insights",
];

const PRO_FEATURES = [
  "Full AEO + GEO insights",
  "Advanced audit",
  "Strategy simulator",
  "Competitor intelligence",
  "Pinnacle CLI access",
  "Monitoring + reports",
];

const COMPARISON_ROWS = [
  { feature: "Basic AEO audit", free: true, pro: true },
  { feature: "Limited AI testing", free: true, pro: true },
  { feature: "Saved history", free: false, pro: true },
  { feature: "Advanced audit", free: false, pro: true },
  { feature: "Strategy simulator", free: false, pro: true },
  { feature: "Competitor intelligence", free: false, pro: true },
  { feature: "Pinnacle CLI access", free: false, pro: true },
  { feature: "Monitoring + reports", free: false, pro: true },
];

const FAQ_ITEMS = [
  {
    q: "What is AI visibility?",
    a: "AI visibility shows how well AI engines can read, summarize, and cite your content.",
  },
  {
    q: "How is this different from SEO?",
    a: "SEO focuses on search ranking. AI visibility focuses on what AI understands about your site.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your Pro plan anytime from your billing settings.",
  },
];

function BoolCell({ enabled }) {
  if (enabled) {
    return <Check className="w-4 h-4 text-indigo-300" aria-label="included" />;
  }

  return <X className="w-4 h-4 text-zinc-500" aria-label="not included" />;
}

export default function PricingPage({ user, isCheckoutLoading, onSelectPlan }) {
  const isPro = Boolean(user?.isSubscribed || user?.plan === "pro" || user?.isFoundingUser);

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0F", color: "#F4F4F5" }} data-testid="pricing-page">
      <div className="max-w-[1100px] mx-auto px-6 md:px-8">
        <section className="py-16 md:py-24 border-b border-zinc-800/80">
          <p className="text-xs uppercase tracking-[0.18em] text-indigo-300 mb-4">Pricing</p>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight max-w-3xl">
            Understand and optimize your AI visibility
          </h1>
          <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-2xl">
            See how AI engines interpret your content and fix what&apos;s holding you back.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectPlan("free")}
              className="h-11 px-6 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-medium hover:scale-[1.01] hover:brightness-110 transition"
            >
              Start free
            </button>
            <button
              onClick={() => onSelectPlan("pro")}
              disabled={isCheckoutLoading || isPro}
              className="h-11 px-6 rounded-xl bg-indigo-500 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] hover:brightness-110 transition"
            >
              {isPro ? "Current plan" : isCheckoutLoading ? "Redirecting..." : "Upgrade to Pro ->"}
            </button>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm text-zinc-400">
            <p>Test your AI visibility</p>
            <p>See what AI understands about your site</p>
            <p>Fix what AI can&apos;t see</p>
          </div>
        </section>

        <section className="py-16 border-b border-zinc-800/80" id="pricing">
          <div className="grid md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-zinc-800 bg-[#0B0B0F] shadow-[0_10px_30px_rgba(0,0,0,0.22)] p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Free</p>
              <h2 className="mt-3 text-2xl font-semibold">Free</h2>
              <p className="mt-2 text-zinc-400">For teams getting started with AI visibility.</p>

              <ul className="mt-6 space-y-3 text-sm">
                {FREE_FEATURES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-4 h-4 text-indigo-300" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan("free")}
                className="mt-8 w-full h-11 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-medium hover:scale-[1.01] hover:brightness-110 transition"
              >
                Start Free
              </button>
            </article>

            <article className="rounded-xl border border-indigo-500/60 bg-[#0B0B0F] shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_14px_40px_rgba(34,34,59,0.45)] p-7 relative">
              <span className="absolute -top-3 left-6 text-[11px] font-semibold uppercase tracking-[0.16em] px-3 py-1 rounded-full bg-indigo-500 text-white">
                Most Popular
              </span>

              <p className="text-xs uppercase tracking-[0.16em] text-indigo-300">Pro</p>
              <h2 className="mt-3 text-2xl font-semibold">$100/month</h2>
              <p className="mt-2 text-zinc-400">For teams scaling AI-first optimization.</p>

              <ul className="mt-6 space-y-3 text-sm">
                {PRO_FEATURES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-4 h-4 text-indigo-300" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan("pro")}
                disabled={isCheckoutLoading || isPro}
                className="mt-8 w-full h-11 rounded-xl bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] hover:brightness-110 transition"
              >
                {isPro ? "Current plan" : isCheckoutLoading ? "Redirecting..." : "Upgrade to Pro ->"}
              </button>
            </article>
          </div>
        </section>

        <section className="py-16 border-b border-zinc-800/80">
          <h3 className="text-2xl font-semibold">Feature comparison</h3>
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-zinc-300">Feature</th>
                  <th className="text-center px-5 py-3 font-medium text-zinc-300">Free</th>
                  <th className="text-center px-5 py-3 font-medium text-zinc-300">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-t border-zinc-800">
                    <td className="px-5 py-3 text-zinc-300">{row.feature}</td>
                    <td className="px-5 py-3"><div className="flex justify-center"><BoolCell enabled={row.free} /></div></td>
                    <td className="px-5 py-3"><div className="flex justify-center"><BoolCell enabled={row.pro} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="py-16 border-b border-zinc-800/80">
          <h3 className="text-2xl font-semibold">Built for trust</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-sm font-semibold">Built for developers</p>
              <p className="mt-2 text-sm text-zinc-400">Fast setup, clean outputs, and clear scoring.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-sm font-semibold">Used for AI-first optimization</p>
              <p className="mt-2 text-sm text-zinc-400">Understand how AI engines read your pages.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-sm font-semibold">Actionable in minutes</p>
              <p className="mt-2 text-sm text-zinc-400">Fix what AI can&apos;t see with prioritized insights.</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <h3 className="text-2xl font-semibold">FAQ</h3>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                <p className="font-medium">{item.q}</p>
                <p className="mt-2 text-sm text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
