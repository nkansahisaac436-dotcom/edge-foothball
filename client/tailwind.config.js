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
        edge: {
          bg: '#0e1318',
          card: '#161b22',
          'card-hover': '#1f2630',
          border: '#28303d',
          muted: '#8b949e',
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          live: '#ef4444',
          warning: '#f59e0b',
        },
        sporty: {
          blue: '#2563eb',
          red: '#ef4444',
          dark: '#0e1318',
          card: '#161b22',
          border: '#28303d',
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
