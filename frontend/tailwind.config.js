/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#FFFFFF",
        card: "#0A0A0A",
        "card-foreground": "#FFFFFF",
        primary: "#4F46E5",
        "primary-foreground": "#FFFFFF",
        secondary: "#27272A",
        "secondary-foreground": "#FFFFFF",
        muted: "#18181B",
        "muted-foreground": "#A1A1AA",
        accent: "#27272A",
        "accent-foreground": "#FFFFFF",
        destructive: "#EF4444",
        border: "#27272A",
        input: "#27272A",
        ring: "#4F46E5",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        heading: ["Chivo", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
