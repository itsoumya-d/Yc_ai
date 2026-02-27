/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0369A1',
          dark: '#075985',
          light: '#BAE6FD',
        },
        secondary: '#0EA5E9',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        'text-primary': '#0C4A6E',
        'text-secondary': '#64748B',
        border: '#E0F2FE',
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
      },
    },
  },
  plugins: [],
};
