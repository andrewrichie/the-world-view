/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',  // ← This must be 'class', not 'media'
  theme: {
    extend: {},
  },
  plugins: [],
}