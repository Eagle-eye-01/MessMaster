/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'app': '#06080e',
        'surface': '#0c1118',
        'card': '#101828',
        'border': '#1a2a3a',
        'primary': '#c8d5e8',
        'muted': '#4a5f7a',
        'green': '#00e676',
        'teal': '#2dd4bf',
        'blue': '#38bdf8',
        'purple': '#a78bfa',
        'orange': '#ff6b2b',
        'red': '#ff3d5a',
        'yellow': '#fbbf24',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['Calibri', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
