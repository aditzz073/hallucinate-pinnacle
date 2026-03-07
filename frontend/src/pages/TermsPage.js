import React from "react";

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: `By accessing or using Pinnacle.ai ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.`,
  },
  {
    title: "2. Description of service",
    body: `Pinnacle.ai provides an AI discoverability optimization platform, including AEO auditing, AI citation testing, page monitoring, strategy simulation, and related analytics. The Service is provided on a subscription basis, with certain limited features available at no cost.`,
  },
  {
    title: "3. Account registration",
    body: `You must register for an account to access certain features of the Service. You agree to provide accurate and complete information during registration and to keep your account credentials secure. You are responsible for all activities that occur under your account. Notify us immediately at support@pinnacle.ai if you suspect unauthorized use.`,
  },
  {
    title: "4. Acceptable use",
    body: `You agree not to:
• Use the Service for any unlawful purpose or in violation of any applicable laws
• Submit content that is defamatory, obscene, or infringes on third-party rights
• Attempt to gain unauthorized access to any part of the Service or its infrastructure
• Use automated means to scrape, crawl, or collect data from the Service without authorization
• Resell or sublicense the Service without our express written consent
• Interfere with or disrupt the integrity or performance of the Service`,
  },
  {
    title: "5. Subscription and payment",
    body: `Paid subscriptions are billed monthly or annually in advance. All fees are non-refundable except as required by applicable law or as stated in our refund policy. We reserve the right to change our pricing with 30 days' notice. If you downgrade or cancel, you retain access until the end of your current billing period.`,
  },
  {
    title: "6. Intellectual property",
    body: `Pinnacle.ai and its licensors own all intellectual property rights in the Service, including software, algorithms, scoring methodologies, and content we create. You retain ownership of any content you submit to the Service. By submitting content, you grant us a limited license to process and analyze it solely to provide the Service to you.`,
  },
  {
    title: "7. Disclaimers",
    body: `The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. AI discoverability scores and recommendations are provided for informational purposes; we do not guarantee any specific outcomes, citation rates, or search rankings.`,
  },
  {
    title: "8. Limitation of liability",
    body: `To the maximum extent permitted by law, Pinnacle.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from your use of the Service. Our total liability for any claims arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "9. Termination",
    body: `We may suspend or terminate your account at any time for violation of these Terms. You may cancel your account at any time through your account settings. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination will do so.`,
  },
  {
    title: "10. Governing law",
    body: `These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict-of-law provisions. Any disputes shall be resolved in the state or federal courts located in San Francisco County, California.`,
  },
  {
    title: "11. Contact",
    body: `For questions about these Terms, contact us at legal@pinnacle.ai or at: Pinnacle.ai Inc., 123 Market Street, Suite 400, San Francisco, CA 94105.`,
  },
];

export default function TermsPage() {
  return (
    <div className="py-8 max-w-[760px]">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Legal</p>
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Terms of <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Service</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Effective date: January 1, 2025. Last updated: March 1, 2026.
        </p>
      </div>

      <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
        Please read these Terms of Service carefully before using the Pinnacle.ai platform. These Terms constitute a legally binding agreement between you and Pinnacle.ai Inc.
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
