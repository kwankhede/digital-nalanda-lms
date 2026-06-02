import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Digital Nalanda brand palette
        brand: {
          navy: "#0b1f4d",
          blue: "#1d4ed8",
          orange: "#f97316",
        },
      },
    },
  },
  plugins: [],
};

export default config;
