/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F59E0B',
        primaryDark: '#D97706',
        primaryLight: '#FDE68A',
        secondary: '#1E3A5F',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        critical: '#DC2626',
        safetyRed: '#DC2626',
        safetyOrange: '#EA580C',
        safetyYellow: '#CA8A04',
        safetyGreen: '#15803D',
      },
    },
  },
  plugins: [],
};
