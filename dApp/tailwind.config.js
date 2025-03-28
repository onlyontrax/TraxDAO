/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

module.exports = {
  important: true, // to generate utilities as !important
  content: [
    './src/**/**/*.{js,ts,jsx,tsx}',
    './pages/**/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['HeadingPro', 'sans-serif'],
        'body': ['NeueMontreal', 'sans-serif'],
      },
      fontSize: {
        'xxs': '10px',
      },
      colors: {
        'custom-gray': '#1e1e1e',
        'lighter-gray': '#303030',
        'border-gray': '#454545',
        'font-disabled': '#414141',
        'font-gray': '#B3B3B3',
        'font-light-gray': '#F2F2F2',
        'custom-green': '#A8FF00',
        'custom-yellow': '#EDFF00',
        'custom-purple': '#7E2CDD',
        'alert-red': '#EA0000',
        'slaps-gray': '#1F1F1F',
        'custom-black': '#161616',
        'darker-green': '#3d5c00'
        
      },
      width: {
        'modal-mobile': '360px',
        'modal-desktop': '480px',
      },
      height: {
        'modal-mobile': '515px',
        'modal-desktop': '530px',
      },
      scale: {
        '1025': '1.025'
      }
    },
    colors: {
      trax: colors,
    }
  },
  plugins: [
    addVariablesForColors,
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ]
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}