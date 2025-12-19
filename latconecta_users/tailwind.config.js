/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bitel-blue': '#008C96',
        'bitel-yellow': '#FFE709',
        'bitel-yellow-dark': '#E6D008',
      }
    },
  },
  plugins: [],
}