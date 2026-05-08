/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'enduro-dark': '#0a0a0a',
        'enduro-darker': '#050505',
        'enduro-light': '#f5f5f5',
        'enduro-gray': '#1a1a1a',
        'enduro-gray-light': '#2a2a2a',
        'gym-orange': '#FF6B35',
        'gym-orange-dark': '#E55A2B',
        'run-cyan': '#00D9FF',
        'run-cyan-dark': '#00B8D4',
        'success-green': '#10B981',
        'accent-purple': '#A855F7',
        'accent-pink': '#EC4899',
      },
      backgroundImage: {
        'gym-gradient': 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
        'run-gradient': 'linear-gradient(135deg, #00D9FF 0%, #00B8D4 100%)',
        'purple-gradient': 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}