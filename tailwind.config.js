/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070b14',
          800: '#0c1220',
          700: '#111a2e',
          600: '#182544',
          500: '#1e3a5f',
        },
        accent: {
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        }
      }
    },
  },
  plugins: [],
}
