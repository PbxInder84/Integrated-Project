/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      keyframes: {
        'analyzing-progress': {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '95%' }
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(24px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(24px) rotate(-360deg)' }
        },
        'ellipsis': {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 }
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        'pulse-shadow': {
          '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'slide-in-left': {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        'slide-in-right': {
          '0%': { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        'analyzing-progress': 'analyzing-progress 3s ease-in-out infinite',
        'orbit': 'orbit 3s linear infinite',
        'ellipsis': 'ellipsis 1.5s infinite',
        'gradient-shift': 'gradient-shift 10s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-shadow': 'pulse-shadow 2s infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite'
      },
      backgroundSize: {
        '200%': '200% 200%',
      }
    },
  },
  plugins: [],
}