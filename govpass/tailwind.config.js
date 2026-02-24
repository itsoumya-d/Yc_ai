/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1B4FD8',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
      },
    },
  },
  plugins: [],
};
