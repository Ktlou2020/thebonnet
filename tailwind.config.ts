import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        bonnet: "#0f2745",
        accent: "#2dd4bf",
        gold: "#f59e0b",
        fire: "#f97316",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(8, 17, 31, 0.12)",
        glow: "0 0 40px rgba(45, 212, 191, 0.15)",
        "glow-fire": "0 8px 32px rgba(249, 115, 22, 0.30)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      }
    }
  },
  plugins: []
} satisfies Config;
