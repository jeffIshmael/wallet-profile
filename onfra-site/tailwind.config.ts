import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-display)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      colors: {
        canvas: {
          DEFAULT: "#0c0c0c",
          soft: "#000000",
          card: "#141414"
        },
        ink: {
          DEFAULT: "#ffffff",
          muted: "#a3a3a3",
          faint: "#737373"
        },
        nude: {
          DEFAULT: "var(--color-nude)",
          soft: "var(--color-nude-soft)",
          dark: "var(--color-nude-dark)",
          muted: "var(--color-nude-muted)",
          faint: "color-mix(in srgb, var(--color-nude) 12%, transparent)"
        },
        "on-nude": "var(--color-on-nude)"
      },
      boxShadow: {
        pill: "0 8px 40px rgba(0, 0, 0, 0.5)",
        card: "0 20px 50px rgba(0, 0, 0, 0.45)",
        float: "0 16px 48px rgba(0, 0, 0, 0.55)"
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        float: "float 6s ease-in-out infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
