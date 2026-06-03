import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0c1219",
          raised: "#131b24",
          overlay: "#1a2430",
        },
        accent: {
          DEFAULT: "#22c55e",
          dim: "#16a34a",
          glow: "#4ade80",
        },
        muted: "#8b9cb3",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        body: ["var(--font-plex)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
