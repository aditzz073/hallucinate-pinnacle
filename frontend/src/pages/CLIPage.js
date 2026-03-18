import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

const QUICK_START = `pip install pinnacle-cli
pinnacle analyze https://yoursite.com`;

const BACKEND_SETUP = `cd backend
python3 -m pip install -r requirements.txt
python3 server.py`;

const EDITABLE_INSTALL = `cd cli
python3 -m pip install -e .`;

const AUTH_SETUP = `pinnacle auth <YOUR_API_KEY>`;

const ANALYZE_EXAMPLES = `pinnacle analyze https://yoursite.com/page
pinnacle analyze https://yoursite.com/page --query "best b2b crm software"`;

const VERIFY_COMMANDS = `pinnacle --help
pinnacle analyze --help`;

const EXAMPLE_OUTPUT = `$ pinnacle analyze https://site.com
Analyzing AI visibility...

Score
AI Visibility Score: 78

Citation Probability
64%

Top Engine
ChatGPT

Engine Readiness
ChatGPT 82
Perplexity 74
Gemini 71
Copilot 68

Recommendations
- Add FAQ schema
- Improve heading hierarchy
- Increase authoritative citations`;

function CodeBlock({ title, code, copyId, copiedId, onCopy }) {
  const copied = copiedId === copyId;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(11,11,20,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#A78BFA" }}>
          {title}
        </p>
        <button
          type="button"
          onClick={() => onCopy(copyId, code)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
          style={{
            background: copied ? "rgba(16,185,129,0.16)" : "rgba(99,102,241,0.12)",
            border: copied ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(99,102,241,0.25)",
            color: copied ? "#6EE7B7" : "#C4B5FD",
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre
        className="text-xs sm:text-sm leading-relaxed m-0"
        style={{ color: "#D8D3FA", fontFamily: "monospace", whiteSpace: "pre-wrap" }}
      >
        {code}
      </pre>
    </div>
  );
}

export default function CLIPage() {
  const [copiedId, setCopiedId] = useState("");

  const handleCopy = async (copyId, text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(copyId);
      setTimeout(() => setCopiedId(""), 1600);
    } catch {
      setCopiedId("");
    }
  };

  return (
    <div className="relative overflow-hidden" style={{ background: "transparent" }}>
      <section className="px-6 md:px-8 py-14 md:py-16" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="max-w-5xl mx-auto">
          <article
            className="rounded-3xl p-6 md:p-10"
            style={{
              background: "linear-gradient(140deg, rgba(79,70,229,0.11) 0%, rgba(124,58,237,0.08) 48%, rgba(8,145,178,0.07) 100%)",
              border: "1px solid rgba(124,58,237,0.26)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
            <header className="mb-8">
              <span
                className="inline-flex items-center mb-4"
                style={{
                  background: "rgba(16,185,129,0.14)",
                  border: "1px solid rgba(16,185,129,0.35)",
                  color: "#6EE7B7",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                CLI DOCS
              </span>

              <h1
                className="font-display text-4xl md:text-5xl font-bold mb-3"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Pinnacle CLI Documentation
              </h1>

              <p className="text-base md:text-lg mb-3" style={{ color: "#C4B5FD" }}>
                Setup, authenticate, and run AI visibility analysis directly from your terminal.
              </p>

              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                This guide is written as a complete local setup walkthrough with copy-ready commands and troubleshooting.
              </p>
            </header>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "#EDE9FE" }}>
                Quick Start
              </h2>
              <CodeBlock
                title="Install And Run"
                code={QUICK_START}
                copyId="quick"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-xs mt-3" style={{ color: "#B7B3D6" }}>
                Recommended when your backend API is already running and your API key is configured.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "#EDE9FE" }}>
                Prerequisites
              </h2>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(11,11,20,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <ul className="space-y-2 text-sm" style={{ color: "#D1D5DB" }}>
                  <li>Python 3.10 or later</li>
                  <li>pip package manager</li>
                  <li>Pinnacle repository cloned locally</li>
                  <li>A generated API key from the Profile page in the web app</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "#EDE9FE" }}>
                Full Setup Steps
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#C4B5FD" }}>
                    Step 1. Start the local backend API
                  </p>
                  <CodeBlock
                    title="Backend"
                    code={BACKEND_SETUP}
                    copyId="backend"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#C4B5FD" }}>
                    Step 2. Install the CLI
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock
                      title="Published Package"
                      code={"python3 -m pip install pinnacle-cli"}
                      copyId="published"
                      copiedId={copiedId}
                      onCopy={handleCopy}
                    />
                    <CodeBlock
                      title="Editable Local Install"
                      code={EDITABLE_INSTALL}
                      copyId="editable"
                      copiedId={copiedId}
                      onCopy={handleCopy}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#C4B5FD" }}>
                    Step 3. Authenticate with your API key
                  </p>
                  <CodeBlock
                    title="Authentication"
                    code={AUTH_SETUP}
                    copyId="auth"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
                    Get this key from Profile → Pinnacle CLI Access → Generate New API Key.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#C4B5FD" }}>
                    Step 4. Run analysis commands
                  </p>
                  <CodeBlock
                    title="Analyze"
                    code={ANALYZE_EXAMPLES}
                    copyId="analyze"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#C4B5FD" }}>
                    Step 5. Verify your installation
                  </p>
                  <CodeBlock
                    title="Verification"
                    code={VERIFY_COMMANDS}
                    copyId="verify"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "#EDE9FE" }}>
                Example Output
              </h2>
              <CodeBlock
                title="Terminal"
                code={EXAMPLE_OUTPUT}
                copyId="output"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "#EDE9FE" }}>
                Troubleshooting
              </h2>
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "rgba(11,11,20,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                    pinnacle: command not found
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B7B3D6" }}>
                    Run from the cli folder using module mode: python3 -m pinnacle_cli.main --help
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                    401 Invalid API key
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B7B3D6" }}>
                    Generate a new key from Profile and re-run pinnacle auth &lt;YOUR_API_KEY&gt;.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                    API connection error
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B7B3D6" }}>
                    Confirm backend is running at http://localhost:8001 and /api/health returns healthy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "#EDE9FE" }}>
                Notes
              </h2>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(11,11,20,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "#D1D5DB" }}>
                  The CLI is optimized for local-first workflows and CI pipelines. For day-to-day development, editable install mode keeps the command linked to your local source code.
                </p>
              </div>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
