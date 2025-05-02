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
        }
      },
      animation: {
        'analyzing-progress': 'analyzing-progress 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}