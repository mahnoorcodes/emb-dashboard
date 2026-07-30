/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#121212',
          900: '#181818',
          800: '#202020',
          700: '#2b2b2b',
          600: '#3d3d3d',
        },
        mist: {
          400: '#a3a3a3',
          200: '#ffffff',
        },
        brand: {
          400: '#a8d454',
          500: '#99cc33',
          600: '#54b848',
        },
        live: {
          500: '#54b848',
          600: '#3f9636',
        },
        alert: {
          400: '#ef6a5e',
          500: '#e8483a',
        },
      },
      fontFamily: {
        display: ['Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
