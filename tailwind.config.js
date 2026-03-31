/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0e9ff",
          100: "#deccff",
          200: "#c4a3ff",
          300: "#a374ff",
          400: "#8b46ff",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#2e1065",
        },
        surface: {
          DEFAULT: "#0c0c14",
          card: "#12121e",
          elevated: "#1a1a2e",
          border: "rgba(255,255,255,0.08)",
        },
        accent: {
          cyan:  "#22d3ee",
          green: "#4ade80",
          amber: "#fbbf24",
          red:   "#f87171",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-brand":
          "radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 70%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease forwards",
        "gauge-fill":  "gaugeFill 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-in":    "slideIn 0.4s ease forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        brand: "0 0 24px rgba(124,58,237,0.4)",
        "brand-sm": "0 0 12px rgba(124,58,237,0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
