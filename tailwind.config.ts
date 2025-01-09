// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        wood: {
          light: '#D4B59D',    // Light oak
          DEFAULT: '#A0522D',  // Classic wood
          dark: '#654321',     // Dark walnut
        },
        accent: {
          light: '#90CDF4',    // Light blue
          DEFAULT: '#3182CE',  // Blueprint blue
          dark: '#2C5282',     // Dark blue
        }
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.15)',
      }
    },
  },
  plugins: [],
} satisfies Config;