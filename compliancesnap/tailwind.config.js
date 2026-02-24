/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',
        primaryDark: '#B91C1C',
        primaryLight: '#FEE2E2',
        background: '#FFF5F5',
        surface: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
