import React from "react";

const SECTIONS = [
  {
    title: "1. What are cookies?",
    body: `Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, understand how you use it, and deliver a consistent experience on return visits. Cookies do not contain personally identifiable information on their own.`,
  },
  {
    title: "2. How we use cookies",
    body: `Pinnacle.ai uses cookies for the following purposes:

Strictly necessary: These cookies are required for the Service to function. They include session tokens that keep you logged in and security tokens that protect against CSRF attacks. You cannot opt out of these.

Functional: These cookies remember your preferences (such as theme settings) so you don't have to reconfigure them on every visit.

Analytics: We use privacy-respecting analytics cookies to understand aggregate usage patterns , which features are most used, where users drop off, and how to improve the product. These do not track you individually across the web.

Performance: These cookies help us identify and diagnose performance issues by measuring page-load timing and error rates.`,
  },
  {
    title: "3. Third-party cookies",
    body: `We may use limited third-party services that set their own cookies:
• Analytics providers (e.g., aggregated usage analytics)
• Error monitoring tools (e.g., exception tracking)
• Support chat software (if applicable)

These third parties have their own privacy policies governing their use of cookies.`,
  },
  {
    title: "4. Cookie duration",
    body: `Session cookies expire when you close your browser. Persistent cookies remain on your device for a defined period , typically 12 months , or until you delete them. You can see which cookies are active and their expiry dates in your browser's developer tools.`,
  },
  {
    title: "5. Managing cookies",
    body: `You can control and/or delete cookies at any time through your browser settings. Most browsers allow you to:
• View which cookies are set
• Block third-party cookies
• Delete all cookies when you close the browser
• Set cookies to expire when you close the browser

Note that disabling strictly necessary cookies will impair the functionality of the Service. Deleting analytics cookies won't affect your experience but helps us less.`,
  },
  {
    title: "6. Do Not Track",
    body: `Some browsers include a "Do Not Track" (DNT) feature. Pinnacle.ai currently does not respond to DNT signals. We are monitoring developments in DNT standards and will update this policy accordingly.`,
  },
  {
    title: "7. Changes to this policy",
    body: `We may update this Cookie Policy as our practices change or as required by law. The effective date at the top of this page will reflect the most recent update. We encourage you to review this policy periodically.`,
  },
  {
    title: "8. Contact",
    body: `For questions about our use of cookies, contact us at privacy@pinnacle.ai.`,
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="py-8 max-w-[760px]">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Legal</p>
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Cookie <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Policy</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Effective date: January 1, 2025. Last updated: March 1, 2026.
        </p>
      </div>

      <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
        This Cookie Policy explains how Pinnacle.ai uses cookies and similar tracking technologies when you visit our website or use our platform.
      </p>

      <div className="space-y-8">
        {SECTIONS.map(({ title, body }) => (
          <div
            key={title}
            className="rounded-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>{title}</h2>
            <p
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{ color: "var(--text-muted)" }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
