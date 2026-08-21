/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0a2e1a",
          soft: "#239452",
          dark: "#1e8f4d",
        },
        secondary: {
          DEFAULT: "#0a4d2a",
          dark: "#0c5c32",
        },
        accent: "#22c55e",
        background: { DEFAULT: "#ffffff", dark: "#0a0a0a" },
        surface: { DEFAULT: "#f0faf3", dark: "#121212" },
        foreground: { DEFAULT: "#1c1c1c", dark: "#f8fafc" },
        muted: { DEFAULT: "#3d6b4f", dark: "#94a3b8" },
        border: { DEFAULT: "#e2e8f0", dark: "#1e293b" },
        input: { DEFAULT: "#f1f5f9", dark: "#1e293b" },
        ring: "#1a7a42",
      },
      fontFamily: {
        sans: ["Jakarta_400"],
        medium: ["Jakarta_500"],
        semibold: ["Jakarta_600"],
        bold: ["Jakarta_700"],
        extrabold: ["Jakarta_800"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
