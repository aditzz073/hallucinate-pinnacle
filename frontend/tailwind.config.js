/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // -- Layered surface system --
        background: "#09090b",       // zinc-950, deep near black
        surface: "#0e0e11",          // slight elevation
        "surface-2": "#141418",      // elevated cards
        "surface-3": "#1d1d22",      // hover / pressed state
        
        // -- Text --
        foreground: "#fafafa",
        "muted-foreground": "#a1a1aa",
        "subtle-foreground": "#71717a",

        // -- Primary accent: Electric Lime --
        primary: "#a3e635",
        "primary-hover": "#84cc16",
        "primary-light": "rgba(163, 230, 53, 0.15)",
        "primary-foreground": "#000000",

        // -- Border / divider --
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.15)",

        // -- Status --
        success: "#a3e635",
        warning: "#fbbf24",
        danger: "#f87171",
        info: "#38bdf8",

        // -- Semantic --
        card: "#141418",
        "card-foreground": "#fafafa",
        secondary: "#1d1d22",
        "secondary-foreground": "#fafafa",
        muted: "#1d1d22",
        accent: "#1d1d22",
        "accent-foreground": "#fafafa",
        destructive: "#ef4444",
        input: "#141418",
        ring: "#a3e635",

        // -- Legacy brand kept for backwards compat (dashboard) --
        brand: {
          blue: "#4F46E5",
          teal: "#22D3EE",
          indigo: "#4F46E5",
          violet: "#7C3AED",
        },
      },
      maxWidth: {
        content: "1120px",
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        display: ["Chivo", "Syne", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "Courier", "monospace"],
      },
      fontSize: {
        display: ["5rem", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        h1: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        h2: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        h3: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        floatIn: {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        "fade-in-up-1": "fadeInUp 0.4s ease-out 0.05s forwards",
        "fade-in-up-2": "fadeInUp 0.4s ease-out 0.1s forwards",
        "fade-in-up-3": "fadeInUp 0.4s ease-out 0.15s forwards",
        "fade-in-up-4": "fadeInUp 0.4s ease-out 0.2s forwards",
        "fade-in-up-5": "fadeInUp 0.4s ease-out 0.25s forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "float-in": "floatIn 0.4s ease-out forwards",
        shimmer: "shimmer 1.5s linear infinite",
        "count-up": "count-up 0.4s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
        marquee: "marquee 25s linear infinite",
        // legacy
        "fade-in-up-delay-1": "fadeInUp 0.4s ease-out 0.1s forwards",
        "fade-in-up-delay-2": "fadeInUp 0.4s ease-out 0.2s forwards",
        "fade-in-up-delay-3": "fadeInUp 0.4s ease-out 0.3s forwards",
        "fade-in-up-delay-4": "fadeInUp 0.4s ease-out 0.4s forwards",
        "float-slow": "fadeIn 0.3s ease-out forwards",
        "float-slow-reverse": "fadeIn 0.3s ease-out forwards",
        "float-medium": "fadeIn 0.3s ease-out forwards",
        "float-medium-reverse": "fadeIn 0.3s ease-out forwards",
        float: "fadeIn 0.3s ease-out forwards",
        "float-delayed": "fadeIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
