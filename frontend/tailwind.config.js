/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pod: {
          bg: '#0A0C14',
          surface: '#131722',
          surfaceLight: '#1C2233',
          surfaceBorder: '#272F45',
          primary: '#6366F1',
          primaryHover: '#4F46E5',
          accent: '#EC4899',
          cyan: '#06B6D4',
          textMuted: '#64748B',
          textSec: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
