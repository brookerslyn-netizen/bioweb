/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ['"Pacifico"', "cursive"],
        script: ['"Caveat"', "cursive"],
        body: ['"Quicksand"', "system-ui", "sans-serif"],
        ui: ['"Fredoka"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        cream: {
          50: "#fff8fa",
          100: "#fff0f5",
          200: "#ffe4ec",
        },
        blush: {
          100: "#ffd6e3",
          200: "#ffbcd0",
          300: "#ff9ec1",
          400: "#ff7ba9",
          500: "#ff5d92",
          600: "#e83a78",
          700: "#b62a5c",
        },
        plum: {
          900: "#1a0a16",
          800: "#241020",
          700: "#2f1729",
        },
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(3deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        rise: {
          "0%": { transform: "translateY(110vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "0.9" },
          "100%": { transform: "translateY(-15vh) rotate(360deg)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        twinkle: "twinkle 2.4s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        blink: "blink 1s steps(1) infinite",
      },
    },
  },
  plugins: [],
}

