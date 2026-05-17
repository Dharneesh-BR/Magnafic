/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3533cd',
          50: '#e8e7fc',
          100: '#d1d0f9',
          200: '#a3a1f3',
          300: '#7572ed',
          400: '#4744e7',
          500: '#3533cd',
          600: '#2a2aa3',
          700: '#202279',
          800: '#151a4f',
          900: '#0b1125',
        },
        cyan: {
          DEFAULT: '#00ffff',
          50: '#e6ffff',
          100: '#ccffff',
          200: '#99ffff',
          300: '#66ffff',
          400: '#33ffff',
          500: '#00ffff',
          600: '#00cccc',
          700: '#009999',
          800: '#006666',
          900: '#003333',
        },
        magna: {
          m: '#2A1AD8',
          a: '#4E26E2',
          g: '#7231EC',
          n: '#953DF5',
          a2: '#B948FF',
        },
        dark: {
          bg: '#000047',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #3533cd, #00ffff)',
        'gradient-secondary': 'linear-gradient(to right, #000080, #1e3a8a, #1e40af)',
        'gradient-magna': 'linear-gradient(to right, #2A1AD8, #4E26E2, #7231EC, #953DF5, #B948FF)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.3)',
        'glow-blue': '0 10px 25px rgba(53, 51, 205, 0.2)',
        'glow-combined': '0 0 20px rgba(0, 255, 255, 0.3), 0 10px 25px rgba(53, 51, 205, 0.2)',
        'border-glow': '0 0 0 1px rgba(0, 255, 255, 0.4)',
      },
    },
  },
  plugins: [],
}
