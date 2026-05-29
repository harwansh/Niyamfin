import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0d1b16",
        paper: "#f6f4ec",
        sage: {
          50: "#eef3ee",
          100: "#d8e3d7",
          400: "#6f8f72",
          600: "#3f5d44",
          700: "#2f4634",
          900: "#16271c",
        },
        brass: "#c8a248",
        clay: "#b9543f",
      },
      boxShadow: {
        card: "0 1px 0 rgba(13,27,22,0.04), 0 18px 40px -24px rgba(13,27,22,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
