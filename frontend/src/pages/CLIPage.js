import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import ENGINE_LOGOS from "../utils/engineLogos";

const CLI_TYPING_COMMAND = "pinnacle analyze https://site.com";

function PinnacleCLISection({ onGetStarted }) {
  const [typedCommand, setTypedCommand] = useState("");

  useEffect(() => {
    let timeoutId;
    let index = 0;
    let deleting = false;

    const tick = () => {
      if (!deleting) {
        index += 1;
        setTypedCommand(CLI_TYPING_COMMAND.slice(0, index));

        if (index >= CLI_TYPING_COMMAND.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 1300);
          return;
        }

        timeoutId = setTimeout(tick, 42);
        return;
      }

      index -= 1;
      setTypedCommand(CLI_TYPING_COMMAND.slice(0, Math.max(index, 0)));

      if (index <= 0) {
        deleting = false;
        timeoutId = setTimeout(tick, 460);
        return;
      }

      timeoutId = setTimeout(tick, 20);
    };

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="px-8 py-[120px]" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
      <div className="max-w-[1120px] mx-auto w-full">
        <div
          className="rounded-3xl p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.09) 55%, rgba(8,145,178,0.08) 100%)",
            border: "1px solid rgba(124,58,237,0.28)",
            boxShadow: "0 18px 42px rgba(0,0,0,0.35)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <div>
              <span
                className="inline-flex items-center mb-5"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  color: "#A78BFA",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                RELEASING SOON
              </span>

              <h2
                className="font-display text-4xl lg:text-5xl font-bold mb-3"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Pinnacle CLI
              </h2>

              <p className="text-lg mb-4" style={{ color: "#C4B5FD" }}>
                Pinnacle AI in your command line.
              </p>

              <p className="text-base leading-relaxed mb-6 max-w-xl" style={{ color: "var(--muted)" }}>
                Run AI visibility audits, simulations, and analysis directly from your terminal.
                Perfect for developers, CI pipelines, and teams that want to test changes before deploying.
              </p>

              <ul className="space-y-2.5 mb-6">
                {[
                  "Run audits locally before deployment",
                  "Test AI visibility inside CI/CD pipelines",
                  "Access Pinnacle tools without leaving your terminal",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                    <span style={{ color: "#A78BFA" }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div
                className="rounded-xl p-4 mb-6"
                style={{
                  background: "rgba(11,11,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <pre className="text-xs sm:text-sm leading-relaxed m-0" style={{ color: "#C4B5FD", fontFamily: "monospace" }}>
{`pip install pinnaclevault
pinnacle analyze https://yoursite.com/page`}
                </pre>
              </div>

              <button
                onClick={onGetStarted}
                className="btn-secondary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
                style={{
                  borderColor: "rgba(124,58,237,0.4)",
                  color: "#DDD6FE",
                  background: "rgba(124,58,237,0.12)",
                }}
              >
                Join CLI Waitlist
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div
                className="rounded-xl p-5 transition-all duration-300"
                style={{
                  background: "#0B0B14",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "monospace",
                  boxShadow: "0 0 40px rgba(124,58,237,0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                </div>

                <div className="space-y-2 text-[13px] leading-relaxed">
                  <div>
                    <span style={{ color: "#A78BFA" }}>$ </span>
                    <span style={{ color: "#EDE9FE" }}>{typedCommand}</span>
                    <span className="inline-block animate-pulse" style={{ color: "#A78BFA" }}>|</span>
                  </div>

                  <div style={{ color: "#9CA3AF" }}>Analyzing AI visibility...</div>
                  <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.06)" }} />

                  <div><span style={{ color: "#9CA3AF" }}>AI Visibility Score: </span><span style={{ color: "#A78BFA", fontWeight: 700 }}>78</span></div>
                  <div><span style={{ color: "#9CA3AF" }}>Citation Probability: </span><span style={{ color: "#22d3ee", fontWeight: 700 }}>64%</span></div>
                  <div><span style={{ color: "#9CA3AF" }}>Top Engine: </span><span style={{ color: "#34d399", fontWeight: 700 }}>ChatGPT</span></div>

                  <div className="pt-2" style={{ color: "#C4B5FD", fontWeight: 700 }}>Engine Readiness</div>
                  <div className="pl-2 space-y-1">
                    <div style={{ color: "#9CA3AF" }}>ChatGPT <span style={{ color: "#34d399", fontWeight: 700 }}>82</span></div>
                    <div style={{ color: "#9CA3AF" }}>Perplexity <span style={{ color: "#22d3ee", fontWeight: 700 }}>74</span></div>
                    <div style={{ color: "#9CA3AF" }}>Gemini <span style={{ color: "#F59E0B", fontWeight: 700 }}>71</span></div>
                    <div style={{ color: "#9CA3AF" }}>Copilot <span style={{ color: "#818CF8", fontWeight: 700 }}>68</span></div>
                  </div>

                  <div className="pt-2" style={{ color: "#C4B5FD", fontWeight: 700 }}>Recommendations</div>
                  <div className="pl-2 space-y-1" style={{ color: "#D1FAE5" }}>
                    <div>✓ Add FAQ schema</div>
                    <div>✓ Improve heading hierarchy</div>
                    <div>✓ Increase authoritative citations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CLIPage({ onGetStarted }) {
  return (
    <div className="relative overflow-hidden" style={{ background: "transparent" }}>
      <PinnacleCLISection onGetStarted={onGetStarted} />
    </div>
  );
}
