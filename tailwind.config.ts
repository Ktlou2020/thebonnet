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
        gold: "#f59e0b"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(8, 17, 31, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
