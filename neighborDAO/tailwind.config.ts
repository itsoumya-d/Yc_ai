import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#10B981', dark: '#059669', light: '#34D399', foreground: '#F0FDF4' },
        bg: { root: '#0A0F0E', card: '#111918', surface: '#162120', elevated: '#1C2B28' },
        // shorthand aliases
        card: '#111918',
        surface: '#162120',
        border: { DEFAULT: '#1E2E2B', emphasis: '#2A4040' },
        text: {
          primary: '#F0FDF4',
          secondary: '#86EFAC',
          tertiary: '#4B7A5F',
          muted: '#4B7A5F',
          inverse: '#0A0F0E',
        },
        status: {
          active: '#10B981', passed: '#3B82F6', failed: '#EF4444',
          draft: '#6B7280', pending: '#F59E0B',
        },
      },
      fontFamily: { sans: ['system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
