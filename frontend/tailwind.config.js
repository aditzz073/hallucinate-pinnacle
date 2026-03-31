/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // -- Layered surface system --
        background: "#080c16",       // page background (darkest navy)
        surface: "#0c1022",          // section containers (slightly lighter)
        "surface-2": "#1a1d4b",      // elevated cards (dark blue)
        "surface-3": "#2d3466",      // hover / pressed state

        // -- Text --
        foreground: "#ffffff",
        "muted-foreground": "#949bc5", // (lavender blue)
        "subtle-foreground": "#525c88", // (muted blue)

        // -- Primary accent: Indigo --
        primary: "#525c88",
        "primary-hover": "#4a537f",
        "primary-light": "rgba(82,92,136,0.15)",
        "primary-foreground": "#ffffff",

        // -- Border / divider --
        border: "rgba(255,255,255,0.07)",
        "border-strong": "rgba(255,255,255,0.12)",

        // -- Status --
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",

        // -- Semantic --
        card: "#1a1d4b",
        "card-foreground": "#ffffff",
        secondary: "#2d3466",
        "secondary-foreground": "#ffffff",
        muted: "#2d3466",
        accent: "#525c88",
        "accent-foreground": "#ffffff",
        destructive: "#EF4444",
        input: "#1a1d4b",
        ring: "#525c88",

        // -- Legacy brand kept for backwards compat --
        brand: {
          blue: "#525c88",
          teal: "#949bc5",
          indigo: "#1a1d4b",
          violet: "#2d3466",
        },
      },
      maxWidth: {
        content: "1120px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Syne", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        h1: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        h2: ["2rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
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
