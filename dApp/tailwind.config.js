/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  important: true, // to generate utilities as !important
  content: [
    './src/**/**/*.{js,ts,jsx,tsx}',
    './pages/**/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
    },
    colors: {
      trax: colors,
    }
  },
  plugins: []
};
