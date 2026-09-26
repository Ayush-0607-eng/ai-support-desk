export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065"
        }
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(124,58,237,0.45)"
      },
      keyframes: {
        fadein: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideup: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } }
      },
      animation: {
        fadein: "fadein 0.25s ease-out",
        slideup: "slideup 0.3s ease-out"
      }
    }
  },
  plugins: []
};
