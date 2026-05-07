/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'enduro-dark': '#1a1a1a',
        'enduro-light': '#e5e5e5',
        'enduro-gray': '#2d2d2d',
        'gym-orange': '#FF6B35',
        'run-cyan': '#4ECDC4',
        'success-green': '#95E1D3',
      },
    },
  },
  plugins: [],
}