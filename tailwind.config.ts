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
        brand: {
          50:  "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#EC4899",
          600: "#DB2777",
          700: "#BE185D",
          800: "#9D174D",
          900: "#831843",
        },
        gold: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#D4AF37",
          600: "#B45309",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "pink":    "0 8px 24px rgba(236,72,153,.25)",
        "gold":    "0 8px 24px rgba(212,175,55,.30)",
        "card":    "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
        "card-lg": "0 10px 40px rgba(0,0,0,.10), 0 4px 12px rgba(0,0,0,.05)",
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.5s ease forwards",
        "scale-in":    "scaleIn 0.3s ease forwards",
        "float":       "float 3s ease-in-out infinite",
        "pulse-ring":  "pulse-ring 2s ease-in-out infinite",
        "shimmer":     "shimmer 1.5s infinite",
      },
      backgroundImage: {
        "gradient-beauty": "linear-gradient(135deg, #FDF2F8 0%, #F5F3FF 50%, #EFF6FF 100%)",
        "gradient-hero":   "linear-gradient(160deg, #FDF2F8 0%, #faf5ff 40%, #f0f9ff 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
