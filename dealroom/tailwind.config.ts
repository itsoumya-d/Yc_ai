import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
        win: { DEFAULT: '#16A34A', light: '#22C55E', dark: '#15803D' },
        risk: '#DC2626',
        warning: '#F59E0B',
        intel: '#7C3AED',
        bg: { root: '#0F172A', card: '#1E293B', surface: '#0F172A', elevated: '#334155' },
        card: '#1E293B',
        surface: '#0F172A',
        border: { DEFAULT: '#334155', emphasis: '#475569' },
        text: { primary: '#F8FAFC', secondary: '#94A3B8', tertiary: '#64748B', muted: '#64748B', inverse: '#0F172A' },
      },
      fontFamily: { sans: ['system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
