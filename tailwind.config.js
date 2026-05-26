/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        xmr: "#FF6600",
        gold: "#F5C518",
        ink: "#060606",
        surface: "#0F0F0F",
        border: "#1A1A1A",
        muted: "#444444",
        dim: "#888888",
        soft: "#C8B99A",
        bright: "#F5ECD7",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
