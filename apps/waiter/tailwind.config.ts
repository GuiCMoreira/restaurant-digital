import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#1B4332",
        fern: "#2D6A4F",
        mist: "#D8F3DC",
        linen: "#F8F5F0",
        spice: "#B5451B",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
