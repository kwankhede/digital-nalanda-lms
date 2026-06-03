import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy brand tokens (kept so existing components don't break).
        brand: {
          navy: "#0b1f4d",
          blue: "#1d4ed8",
          orange: "#f97316",
        },
        // New editorial "Nalanda" palette — warm, premium, mission-driven.
        nal: {
          cream: "#fbf6ec",
          parchment: "#f2e9d8",
          navy: "#16314d",
          ink: "#0e2236",
          saffron: "#e8901f",
          terracotta: "#c0402f",
          gold: "#f2a52c",
          teal: "#2f6d75",
          slate: "#5b6b7b",
        },
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(22,49,77,0.04), 0 8px 24px rgba(22,49,77,0.06)",
        lift: "0 10px 30px rgba(22,49,77,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up .7s ease-out both",
        "fade-in": "fade-in .9s ease-out both",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
