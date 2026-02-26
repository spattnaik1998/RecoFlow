import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0A07",
        gold: "#C8A96E",
        "gold-light": "#E8C98A",
        "gold-dim": "#8B7340",
        forest: "#2C4A1E",
        brown: "#8B4513",
        "brown-light": "#A0522D",
        parchment: "#E8D5B7",
        "parchment-dim": "#B8A58A",
        ash: "#4A4035",
      },
      fontFamily: {
        cinzel: ["Cinzel Decorative", "serif"],
        fell: ["IM Fell English", "serif"],
      },
      animation: {
        "candle-flicker": "candleFlicker 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "grain": "grain 8s steps(10) infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        candleFlicker: {
          "0%, 100%": { opacity: "1", transform: "scaleY(1)" },
          "25%": { opacity: "0.85", transform: "scaleY(0.97)" },
          "50%": { opacity: "0.95", transform: "scaleY(1.02)" },
          "75%": { opacity: "0.88", transform: "scaleY(0.98)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "20%": { transform: "translate(3%, 2%)" },
          "30%": { transform: "translate(-1%, 4%)" },
          "40%": { transform: "translate(4%, -1%)" },
          "50%": { transform: "translate(-3%, 3%)" },
          "60%": { transform: "translate(2%, -4%)" },
          "70%": { transform: "translate(-4%, 1%)" },
          "80%": { transform: "translate(1%, -2%)" },
          "90%": { transform: "translate(-2%, 4%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(200, 169, 110, 0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(200, 169, 110, 0.7)" },
        },
      },
      backgroundImage: {
        "gothic-gradient": "radial-gradient(ellipse at top, #1A1208 0%, #0D0A07 70%)",
        "gold-shimmer": "linear-gradient(135deg, #C8A96E 0%, #E8C98A 50%, #C8A96E 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
