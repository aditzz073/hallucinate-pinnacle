import React from "react";

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: `We collect information you provide directly to us when you create an account, use our services, or contact us for support. This includes your name, email address, company name, and any content you submit for analysis.

We also collect usage data automatically when you interact with Pinnacle.ai, including pages visited, features used, timestamps, IP address, browser type, and device identifiers. This data is used solely to operate and improve the service.`,
  },
  {
    title: "2. How we use your information",
    body: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information, including purchase confirmations
• Send technical notices, updates, and security alerts
• Respond to your comments, questions, and customer-service requests
• Monitor and analyze trends, usage, and activities in connection with our services
• Detect, investigate, and prevent fraudulent or unauthorized activity`,
  },
  {
    title: "3. Information sharing",
    body: `We do not sell, trade, or rent your personal information to third parties. We may share information with third-party vendors and service providers that perform services on our behalf — such as hosting, analytics, and email delivery — solely to the extent necessary to provide those services.

We may disclose information if we believe disclosure is in accordance with, or required by, any applicable law or legal process, or if we believe your actions are inconsistent with our user agreements or policies.`,
  },
  {
    title: "4. Data retention",
    body: `We retain personal information for as long as necessary to provide you with our services, or as required by applicable law. When you delete your account, we delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes.`,
  },
  {
    title: "5. Security",
    body: `We take reasonable measures to protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is transmitted over TLS and stored encrypted at rest.

However, no security system is impenetrable and we cannot guarantee the security of our systems 100%.`,
  },
  {
    title: "6. Your rights",
    body: `Depending on your location, you may have certain rights regarding your personal data, including:
• The right to access the personal data we hold about you
• The right to request correction of inaccurate data
• The right to request deletion of your data
• The right to object to or restrict processing
• The right to data portability

To exercise any of these rights, contact us at privacy@pinnacle.ai.`,
  },
  {
    title: "7. Cookies",
    body: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. See our Cookie Policy for more detail.`,
  },
  {
    title: "8. Changes to this policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date. You are advised to review this Privacy Policy periodically for any changes.`,
  },
  {
    title: "9. Contact us",
    body: `If you have any questions about this Privacy Policy, please contact us at privacy@pinnacle.ai or write to us at: Pinnacle.ai Inc., 123 Market Street, Suite 400, San Francisco, CA 94105.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="py-8 max-w-[760px]">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Legal</p>
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Privacy <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Policy</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Effective date: January 1, 2025. Last updated: March 1, 2026.
        </p>
      </div>

      <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
        Pinnacle.ai ("we", "our", or "us") operates the pinnacle.ai website and its associated products and services. This Privacy Policy describes how we collect, use, and share information about you when you use our services.
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
