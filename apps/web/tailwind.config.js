/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E8002D',
          dark: '#15151E',
          gray: '#38383F',
        },
      },
    },
  },
  plugins: [],
}
