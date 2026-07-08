import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)", "Sora", "sans-serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "serif"],
        body: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        cabinet: ["var(--font-cabinet)", "Cabinet Grotesk", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
        "plex-mono": ["var(--font-plex-mono)", "IBM Plex Mono", "monospace"],
        syne: ["var(--font-syne)", "Syne", "sans-serif"],
        "dm-mono": ["var(--font-dm-mono)", "DM Mono", "monospace"],
        space: ["var(--font-space)", "Space Grotesk", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        playwrite: ["var(--font-playwrite)", "Playwrite GB S Guides", "cursive"],
        dancing: ["var(--font-dancing)", "Dancing Script", "cursive"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"]
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          dark: "#1240CC",
          light: "#5B8AFF"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        surface: "#FFFFFF",
        "surface-2": "#EBF2FF",
        success: "#0FB27A",
        warning: "#F59E0B",
        danger: "#EF4444",
        editorial: {
          cream: "#f9f8f5",
          "cream-alt": "#f2f0eb",
          surface: "#ffffff",
          border: "#e8e5de",
          navy: "#1a3a5c",
          "navy-light": "#2a5080",
          teal: "#2ec99e",
          "teal-faint": "#e8f9f5",
          gold: "#e8a020",
          "gold-faint": "#fdf3e0",
          text: "#111111",
          muted: "#666666"
        },
        cobalt: {
          DEFAULT: "#0f3460",
          light: "#1a4a7a",
          dark: "#0a2340"
        },
        "bold-gold": {
          DEFAULT: "#f7c948",
          dark: "#c99b20"
        },
        mint: {
          DEFAULT: "#22d3a4",
          faint: "#e8fdf7"
        },
        rose: {
          DEFAULT: "#ff6b6b"
        },
        "blue-tint": {
          DEFAULT: "#f4f7ff",
          100: "#e8eeff"
        },
        "bold-text": "#0f1c2e",
        navy: {
          DEFAULT: "#080c1a",
          2: "#0d1428",
          3: "#141e38",
          4: "#1c2a4a"
        },
        amber: {
          DEFAULT: "#f5a623",
          light: "#ffc85c",
          dim: "#a06c0f"
        },
        teal: {
          DEFAULT: "#00d4aa",
          dim: "#007a62"
        },
        "ft-text": "#f0f2f8",
        "ft-muted": "#8a93b2",
        void: {
          DEFAULT: "#030304",
          surface: "#0F1115"
        },
        btc: {
          orange: "#B8B0C8",
          burnt: "#9088A0",
          gold: "#D8D0E8"
        },
        stardust: "#94A3B8"
      },
      borderRadius: {
        card: "8px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 8s ease-in-out infinite",
        "spin-slow": "spin 10s linear infinite",
        "spin-reverse": "spin 15s linear infinite reverse"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        }
      },
      boxShadow: {
        card: "0 2px 16px rgba(26,86,255,0.08)",
        "card-hover": "0 8px 32px rgba(26,86,255,0.18)",
        glow: "0 0 20px rgba(26,86,255,0.25)"
      }
    }
  },
  plugins: []
} satisfies Config;
