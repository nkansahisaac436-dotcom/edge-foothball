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
        sporty: {
          green: '#00e676',
          'green-dark': '#00c853',
          'green-light': '#69f0ae',
          red: '#ff5252',
          gold: '#ffd600',
          blue: '#2979ff',
          dark: '#0a0f1d',
          card: '#111827',
          border: '#1f293d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      screens: {
        'xs': '400px',
      },
    },
  },
  plugins: [],
}
