import React from 'react';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import { useCurrencyLocale } from '../../hooks/useCurrencyLocale';
import { useAuth } from '../../context/AuthContext';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../api';

export default function PricingSection({ onGetStarted, onUpgrade }) {
  const { formatPrice } = useCurrencyLocale();
  const { isLoggedIn } = useAuth();

  const handleUpgradeInternal = async (planId) => {
    if (!isLoggedIn) {
      if (onUpgrade) onUpgrade();
      return;
    }
    try {
      // 1. Create order on backend
      const orderData = await createRazorpayOrder(planId);
      
      if (!orderData.order_id) {
        alert(orderData.message || "Could not initialize payment. Please try again.");
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Pinnacle AI",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Subscription`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // 3. Verify on backend
            await verifyRazorpayPayment(
              orderData.order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              planId
            );
            
            // 4. Success! Redirect or refresh
            window.location.href = "/?payment=success";
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: "", // Optionally prefill from auth context
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      const detail = err.response?.data?.detail || "Could not initialize billing session. Please try again or contact support.";
      alert(detail);
    }
  };

  return (
    <div className="max-w-[1120px] mx-auto">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4F46E5" }}>
          Pricing
        </p>
        <h2
          className="font-display text-4xl lg:text-5xl font-bold"
          style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
        >
          Simple, transparent pricing.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Starter */}
        <div className="rounded-2xl p-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Starter</h3>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For individuals exploring AEO.</p>
          <div className="mb-4">
            <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>Free</span>
          </div>
          <ul className="space-y-2 mb-6">
            {["5 audits/month", "10 AI tests/month", "Basic analytics"].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#4F46E5" }} />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={onGetStarted}
            className="w-full rounded-lg py-2.5 text-sm font-medium transition-colors"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            Get started
          </button>
        </div>

        {/* Pro , featured */}
        <div
          className="rounded-2xl p-6 relative transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(79,70,229,0.2)]"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.08) 100%)",
            border: "1px solid rgba(79,70,229,0.4)",
          }}
        >
          <div
            className="absolute -top-3 left-6 px-3 py-1 rounded-full font-bold tracking-wide"
            style={{ background: "#4F46E5", color: "#fff", fontSize: "10px" }}
          >
            MOST POPULAR
          </div>
          <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Professional</h3>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For teams serious about AEO.</p>
          <div className="mb-4">
            <span className="text-4xl font-bold" style={{ color: "#818CF8" }}>{formatPrice(100)}</span>
            <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/month</span>
          </div>
          <ul className="space-y-2 mb-6">
            {["Unlimited audits", "Unlimited AI tests", "Page monitoring", "Strategy simulator", "Priority support"].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#818CF8" }} />
                {item}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handleUpgradeInternal("monthly")} 
            className="btn-primary w-full justify-center rounded-lg py-2.5 text-sm font-semibold"
          >
            Start free trial
          </button>
        </div>

        {/* Enterprise */}
        <div className="rounded-2xl p-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-base font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>Enterprise</h3>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>For large-scale operations.</p>
          <div className="mb-4">
            <span className="text-2xl font-semibold" style={{ color: "var(--text-muted)" }}>Custom pricing</span>
          </div>
          <ul className="space-y-2 mb-5">
            {["Everything in Pro", "Competitor intel", "Executive reports", "Dedicated support", "Custom integrations"].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#4F46E5" }} />
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Get in touch</p>
            <a
              href="mailto:sales@pinnacle.ai"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Email</p>
                <p className="text-xs font-medium text-white">sales@pinnacle.ai</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
