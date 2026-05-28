/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ln-black': '#050505',
        'ln-card': '#0f0f0f',
        'ln-gray': '#262626',
        'ln-neon': '#D4F217', // El Amarillo Lando
        'ln-terminal': '#101010',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Oswald"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'], // Fuente para la terminal
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #262626 1px, transparent 1px)",
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}