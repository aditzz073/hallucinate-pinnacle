import React from "react";

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: `By accessing or using Pinnacle.ai ("Service"), you agree to be bound by these Terms and Data Policy ("Policy"). If you do not agree, you may not use the Service. We may update this Policy at any time, and continued use after updates constitutes acceptance of the revised Policy.`,
  },
  {
    title: "2. Description of service",
    body: `Pinnacle.ai provides an AI discoverability optimization platform, including AEO auditing, AI citation testing, page monitoring, strategy simulation, and related analytics. The Service is provided on a subscription basis, with certain limited features available at no cost.`,
  },
  {
    title: "3. Account registration",
    body: `You must register for an account to access certain features of the Service. You agree to provide accurate and complete information during registration and keep your credentials secure. You are responsible for all activities under your account. Notify us at pinnacle.ai.support@gmail.com if you suspect unauthorized use.`,
  },
  {
    title: "4. Acceptable use",
    body: `You agree not to:
• Use the Service for any unlawful purpose or in violation of applicable laws
• Submit content that is defamatory, obscene, or infringes on third-party rights
• Attempt to gain unauthorized access to any part of the Service
• Use automated means to scrape, crawl, or collect data without authorization
• Resell or sublicense the Service without our written consent
• Interfere with the integrity or performance of the Service`,
  },
  {
    title: "5. Subscription and payment",
    body: `Paid subscriptions are billed monthly or annually in advance. Fees are non-refundable except as required by law or stated in our refund policy. We may change pricing with 30 days' notice. If you downgrade or cancel, access continues through the current billing period.`,
  },
  {
    title: "6. Intellectual property",
    body: `Pinnacle.ai and its licensors own all intellectual property rights in the Service, including software, algorithms, scoring methodologies, and content we create. You retain ownership of content you submit. By submitting content, you grant us a limited license to process and analyze it solely to provide the Service.`,
  },
  {
    title: "7. Disclaimers",
    body: `The Service is provided "as is" and "as available" without warranties of any kind. We do not warrant uninterrupted or error-free operation. AI discoverability scores and recommendations are informational only and do not guarantee specific outcomes, citation rates, or rankings.`,
  },
  {
    title: "8. Limitation of liability",
    body: `To the maximum extent permitted by law, Pinnacle.ai is not liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits or revenues arising from your use of the Service. Our total liability for claims under this Policy does not exceed the amount paid by you in the 12 months preceding the claim.`,
  },
  {
    title: "9. Termination",
    body: `We may suspend or terminate your account for violations of this Policy. You may cancel your account at any time through account settings. Upon termination, your right to use the Service ends immediately. Provisions intended to survive termination remain in effect.`,
  },
  {
    title: "10. Governing law",
    body: `This Policy is governed by the laws of the State of California, without regard to conflict-of-law rules. Disputes shall be resolved in the state or federal courts located in San Francisco County, California.`,
  },
];

const DATA_SECTIONS = [
  {
    title: "11. Information we collect",
    body: `We collect information you provide directly when creating an account, using services, or contacting support, such as name, email, company name, and submitted content.

We also collect usage data automatically, including pages visited, features used, timestamps, IP address, browser type, and device identifiers, to operate and improve the Service.`,
  },
  {
    title: "12. How we use your information",
    body: `We use collected information to:
• Provide, maintain, and improve our services
• Process transactions and send billing-related information
• Send technical notices, updates, and security alerts
• Respond to support and customer-service requests
• Monitor and analyze usage trends
• Detect, investigate, and prevent fraudulent or unauthorized activity`,
  },
  {
    title: "13. Information sharing",
    body: `We do not sell, trade, or rent your personal information. We may share data with service providers that support hosting, analytics, and communications, only as needed to provide the Service.

We may disclose information when required by law or legal process, or when necessary to protect rights, safety, or policy compliance.`,
  },
  {
    title: "14. Data retention",
    body: `We retain personal information as long as needed to provide services or as required by law. When you delete your account, personal data is deleted within 30 days, except where retention is required for legal or legitimate business purposes, such as dispute resolution.`,
  },
  {
    title: "15. Security",
    body: `We apply reasonable measures to protect personal information from unauthorized access, disclosure, alteration, or destruction. Data is transmitted over TLS and stored encrypted at rest.

No system is fully secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "16. Your rights",
    body: `Depending on your location, you may have rights including:
• Access to your personal data
• Correction of inaccurate data
• Deletion requests
• Objection to or restriction of processing
• Data portability

To exercise these rights, contact pinnacle.ai.support@gmail.com.`,
  },
  {
    title: "17. Cookies",
    body: `We use cookies and similar technologies to support platform functionality and improve experience. You can configure your browser to refuse cookies. See our Cookie Policy for details.`,
  },
  {
    title: "18. Changes to this policy",
    body: `We may update this Terms and Data Policy periodically. Changes will be posted on this page with an updated effective date.`,
  },
  {
    title: "19. Contact",
    body: `For questions about this Policy, contact pinnacle.ai.support@gmail.com, or write to: Pinnacle.ai Inc., 123 Market Street, Suite 400, San Francisco, CA 94105.`,
  },
];

const SECTIONS = [...TERMS_SECTIONS, ...DATA_SECTIONS];

export default function TermsDataPolicyPage() {
  return (
    <div className="py-8 max-w-[760px]">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Legal</p>
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Terms and <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Data Policy</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Effective date: January 1, 2025. Last updated: March 22, 2026.
        </p>
      </div>

      <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
        This page combines Pinnacle.ai service terms and data handling practices into one consolidated legal policy.
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
