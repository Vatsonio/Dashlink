import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        cta: "var(--color-cta)",
        surface: "var(--color-surface)",
        muted: "var(--color-muted)",
      },
      backgroundColor: {
        base: "var(--color-background)",
      },
      textColor: {
        base: "var(--color-text)",
      },
    },
  },
  plugins: [],
};

export default config;
