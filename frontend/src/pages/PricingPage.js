import React from "react";
import { Check, X, ArrowRight } from "lucide-react";

/* ---------- Feature matrix ---------- */
const DISCOVER_FEATURES = [
  { label: "Basic AEO audit", included: true },
  { label: "AI visibility score", included: true },
  { label: "Basic recommendations", included: true },
  { label: "Limited AI testing (3/mo)", included: true },
  { label: "Audit history (3 records)", included: true },
  { label: "Advanced audit", included: false },
  { label: "Strategy simulator", included: false },
  { label: "AI testing lab", included: false },
  { label: "Competitor intel", included: false },
  { label: "Monitoring", included: false },
  { label: "CLI access", included: false },
];

const OPTIMIZE_FEATURES = [
  { label: "Everything in Discover", included: true },
  { label: "Advanced audit", included: true },
  { label: "Strategy simulator", included: true },
  { label: "AI testing lab (20/mo)", included: true },
  { label: "Full AI testing", included: true },
  { label: "Competitor intel (2 per query)", included: true },
  { label: "Full audit history", included: true },
  { label: "30 audits/month", included: true },
  { label: "Full competitor intel", included: false },
  { label: "Monitoring + alerts", included: false },
  { label: "CLI access", included: false },
];

const DOMINATE_FEATURES = [
  { label: "Everything in Optimize", included: true },
  { label: "Unlimited audits", included: true },
  { label: "Unlimited AI tests", included: true },
  { label: "Full competitor intel (5)", included: true },
  { label: "Monitoring + alerts", included: true },
  { label: "CLI access", included: true },
  { label: "Enterprise reports", included: true },
  { label: "Executive summary", included: true },
];

const CUSTOM_FEATURES = [
  "Everything in Dominate",
  "Done-for-you implementation",
  "1:1 strategy calls",
  "Deep competitor analysis",
  "Custom PDF reports",
  "Dedicated Slack/WhatsApp support",
  "API access",
  "Retainer pricing available",
];

const COMPARISON_ROWS = [
  { feature: "Basic AEO audit", discover: true, optimize: true, dominate: true },
  { feature: "AI visibility score", discover: true, optimize: true, dominate: true },
  { feature: "Basic recommendations", discover: true, optimize: true, dominate: true },
  { feature: "Limited AI testing", discover: true, optimize: true, dominate: true },
  { feature: "Audit history", discover: "3 only", optimize: true, dominate: true },
  { feature: "Advanced audit", discover: false, optimize: true, dominate: true },
  { feature: "Strategy simulator", discover: false, optimize: true, dominate: true },
  { feature: "AI testing lab", discover: false, optimize: true, dominate: true },
  { feature: "Full AI testing", discover: false, optimize: true, dominate: true },
  { feature: "Competitor intel", discover: false, optimize: "Limited", dominate: true },
  { feature: "Full competitor intel", discover: false, optimize: false, dominate: true },
  { feature: "Monitoring + alerts", discover: false, optimize: false, dominate: true },
  { feature: "CLI access", discover: false, optimize: false, dominate: true },
  { feature: "Unlimited audits", discover: false, optimize: false, dominate: true },
  { feature: "Enterprise reports", discover: false, optimize: false, dominate: true },
  { feature: "Executive summary", discover: false, optimize: false, dominate: true },
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
    a: "Yes. You can cancel your plan anytime from your billing settings.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual billing with discounts coming soon. Contact us for details.",
  },
];

function BoolCell({ value }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-green-400" aria-label="included" />;
  }
  if (value === false) {
    return <X className="w-4 h-4 text-zinc-600" aria-label="not included" />;
  }
  // String like "3 only" or "Limited"
  return <span className="text-xs text-amber-300 font-medium">{value}</span>;
}

function FeatureItem({ label, included }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
      ) : (
        <X className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
      )}
      <span className={included ? "text-zinc-300" : "text-zinc-600"}>
        {label}
      </span>
    </li>
  );
}

export default function PricingPage({ user, isCheckoutLoading, onSelectPlan }) {
  const currentPlan = user?.plan || "free";
  const isFounder = user?.isFoundingUser === true;
  const isSubscribed = Boolean(user?.stripeSubscriptionId);

  const PLAN_ORDER = { free: 0, discover: 1, optimize: 2, dominate: 3, founder: 99 };

  // User is "on" a plan only if they are actually subscribed to it (or a founder)
  const isOnPlan = (plan) => {
    if (isFounder) return true;
    return isSubscribed && currentPlan === plan;
  };

  // True when user is subscribed and the target plan is HIGHER than their current one
  const isUpgrade = (plan) => {
    if (!isSubscribed || isFounder) return false;
    return (PLAN_ORDER[plan] || 0) > (PLAN_ORDER[currentPlan] || 0);
  };

  const planButtonLabel = (plan, defaultLabel) => {
    if (isOnPlan(plan)) return "Current plan";
    if (isCheckoutLoading) return "Processing...";
    if (isUpgrade(plan)) return "Upgrade →";
    return defaultLabel;
  };


  return (
    <div
      className="min-h-screen"
      style={{ background: "#0B0B0F", color: "#F4F4F5" }}
      data-testid="pricing-page"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Hero */}
        <section className="py-16 md:py-24 border-b border-zinc-800/80">
          <p className="text-xs uppercase tracking-[0.18em] text-indigo-300 mb-4">
            PRICING
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight max-w-3xl">
            Choose your plan
          </h1>
          <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-2xl">
            Start free. Scale when you're ready.
          </p>
        </section>

        {/* Plan Cards */}
        <section className="py-16 border-b border-zinc-800/80" id="pricing-cards">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Discover */}
            <article
              className="rounded-xl border border-slate-700 bg-[#0B0B0F] p-7 flex flex-col"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}
            >
              <p className="text-[20px] font-bold text-white">Discover</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-white">₹8,000</span>
                <span className="text-[14px] text-slate-400">/month</span>
              </div>
              <p className="mt-2 text-[13px] text-slate-400">
                Understand your AI visibility
              </p>
              <div className="my-5 h-px bg-zinc-800" />
              <ul className="space-y-2.5 flex-1">
                {DISCOVER_FEATURES.map((f) => (
                  <FeatureItem key={f.label} {...f} />
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan("discover")}
                disabled={isCheckoutLoading || isOnPlan("discover")}
                className="mt-8 w-full h-11 rounded-xl border border-slate-600 text-sm font-medium text-white hover:bg-white/5 hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {planButtonLabel("discover", "Start with Discover")}
              </button>
            </article>

            {/* Optimize — highlighted */}
            <article
              className="rounded-xl border-2 border-indigo-500 bg-[#0B0B0F] p-7 relative flex flex-col"
              style={{
                boxShadow:
                  "0 -2px 20px rgba(99,102,241,0.2), 0 14px 40px rgba(34,34,59,0.45)",
              }}
            >
              <span className="absolute -top-3 left-6 text-[11px] font-semibold uppercase tracking-[0.16em] px-3 py-1 rounded-full bg-indigo-500 text-white">
                Most Popular
              </span>
              <p className="text-[20px] font-bold text-white">Optimize</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-white">₹15,000</span>
                <span className="text-[14px] text-slate-400">/month</span>
              </div>
              <p className="mt-2 text-[13px] text-slate-400">
                Fix and improve what AI can't see
              </p>
              <div className="my-5 h-px bg-zinc-800" />
              <ul className="space-y-2.5 flex-1">
                {OPTIMIZE_FEATURES.map((f) => (
                  <FeatureItem key={f.label} {...f} />
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan("optimize")}
                disabled={isCheckoutLoading || isOnPlan("optimize")}
                className="mt-8 w-full h-11 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:brightness-110 hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {planButtonLabel("optimize", "Start Optimizing")}
              </button>
            </article>

            {/* Dominate */}
            <article
              className="rounded-xl border border-violet-700 bg-[#0B0B0F] p-7 flex flex-col"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}
            >
              <p className="text-[20px] font-bold text-white">Dominate</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-white">₹40,000</span>
                <span className="text-[14px] text-slate-400">/month</span>
              </div>
              <p className="mt-2 text-[13px] text-slate-400">
                Scale and outperform competitors
              </p>
              <div className="my-5 h-px bg-zinc-800" />
              <ul className="space-y-2.5 flex-1">
                {DOMINATE_FEATURES.map((f) => (
                  <FeatureItem key={f.label} {...f} />
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan("dominate")}
                disabled={isCheckoutLoading || isOnPlan("dominate")}
                className="mt-8 w-full h-11 rounded-xl border border-violet-600 text-sm font-medium text-white hover:bg-violet-500/10 hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {planButtonLabel("dominate", "Dominate AI Search")}
              </button>
            </article>
          </div>
        </section>

        {/* Custom / Elite */}
        <section className="py-12 border-b border-zinc-800/80">
          <div
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-10"
          >
            <h3 className="text-2xl font-semibold text-white">
              Need a custom plan?
            </h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              For agencies, enterprises, and teams that want done-for-you AI
              visibility optimization.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm text-zinc-300">
              {CUSTOM_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:pujeradi@gmail.com?subject=Pinnacle%20Custom%20Plan"
                className="h-11 px-6 rounded-xl bg-indigo-500 text-sm font-semibold text-white inline-flex items-center gap-2 hover:brightness-110 transition"
              >
                Talk to us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="py-16 border-b border-zinc-800/80">
          <h3 className="text-2xl font-semibold">Feature comparison</h3>
          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-zinc-900/60">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-zinc-300">
                    Feature
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-zinc-300">
                    Discover
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-indigo-300">
                    Optimize
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-violet-300">
                    Dominate
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-t border-zinc-800">
                    <td className="px-5 py-3 text-zinc-300">{row.feature}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center">
                        <BoolCell value={row.discover} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center">
                        <BoolCell value={row.optimize} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center">
                        <BoolCell value={row.dominate} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust section */}
        <section className="py-16 border-b border-zinc-800/80">
          <h3 className="text-2xl font-semibold">Built for trust</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-sm font-semibold">Built for developers</p>
              <p className="mt-2 text-sm text-zinc-400">
                Fast setup, clean outputs, and clear scoring.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-sm font-semibold">Used for AI-first optimization</p>
              <p className="mt-2 text-sm text-zinc-400">
                Understand how AI engines read your pages.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-sm font-semibold">Actionable in minutes</p>
              <p className="mt-2 text-sm text-zinc-400">
                Fix what AI can't see with prioritized insights.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <h3 className="text-2xl font-semibold">FAQ</h3>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5"
              >
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
