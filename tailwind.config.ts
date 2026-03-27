import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base:    "#0A0E1A",
        surface: "#0F1729",
        raised:  "#151E35",
        overlay: "#1C2847",
        brand: {
          DEFAULT: "#6387FF",
          hover:   "#849DFF",
          subtle:  "#A8BBFF",
          active:  "#4F6EE8",
          ghost:   "rgba(99,135,255,0.10)",
          glow:    "rgba(99,135,255,0.20)",
        },
        primary:   "#F0F4FF",
        secondary: "#A8B8D8",
        tertiary:  "#6B7FA3",
        muted:     "#3D4F6E",
        border: {
          subtle: "rgba(99,135,255,0.08)",
          mid:    "rgba(99,135,255,0.18)",
          strong: "rgba(99,135,255,0.38)",
        },
        success: "#34D399",
        warning: "#FBBF24",
        danger:  "#F87171",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
        mono:    ["ui-monospace", "SF Mono", "Consolas", "monospace"],
      },
      fontSize: {
        xs:    ["0.70rem",  { lineHeight: "1.4" }],
        sm:    ["0.813rem", { lineHeight: "1.5" }],
        base:  ["0.938rem", { lineHeight: "1.6" }],
        lg:    ["1.063rem", { lineHeight: "1.5" }],
        xl:    ["1.25rem",  { lineHeight: "1.4" }],
        "2xl": ["1.5rem",   { lineHeight: "1.3" }],
        "3xl": ["2rem",     { lineHeight: "1.2" }],
        "4xl": ["2.75rem",  { lineHeight: "1.1" }],
      },
      borderRadius: {
        sm:   "4px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        "2xl":"20px",
        full: "9999px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,135,255,0.08)",
        lift:  "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,135,255,0.14)",
        glow:  "0 0 24px rgba(99,135,255,0.18)",
        brand: "0 4px 24px rgba(99,135,255,0.28)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-up":     "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":     "fadeIn 0.35s ease forwards",
        "slide-in":    "slideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-brand": "pulseBrand 2s ease-in-out infinite",
        "shimmer":     "shimmer 2s linear infinite",
        "spin":        "spin 0.7s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        pulseBrand: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99,135,255,0)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(99,135,255,0.10)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
