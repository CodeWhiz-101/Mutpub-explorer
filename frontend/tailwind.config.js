/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // CRITICAL: This ensures your App.jsx styles are picked up
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}