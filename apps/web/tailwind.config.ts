import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy brand tokens (kept so existing components don't break).
        brand: {
          navy: "#062447",
          blue: "#173a5e",
          orange: "#e68a1f",
        },
        // New editorial "Nalanda" palette — warm, premium, mission-driven.
        nal: {
          cream: "#fbf7f4",
          parchment: "#f7f1e8",
          navy: "#062447",
          ink: "#173a5e",
          saffron: "#e68a1f",
          gold: "#f3b04c",
          terracotta: "#c0402f",
          teal: "#2f6d75",
          slate: "#5f6e7a",
          border: "#e8ddd1",
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
