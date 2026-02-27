import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8', foreground: '#EFF6FF' },
        bg: { root: '#F8FAFC', card: '#FFFFFF', surface: '#F1F5F9', elevated: '#E2E8F0' },
        card: '#FFFFFF',
        surface: '#F1F5F9',
        border: { DEFAULT: '#E2E8F0', emphasis: '#CBD5E1' },
        text: { primary: '#0F172A', secondary: '#475569', tertiary: '#94A3B8', muted: '#94A3B8', inverse: '#FFFFFF' },
        severity: { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#16A34A', info: '#2563EB' },
        framework: { soc2: '#6366F1', gdpr: '#0891B2', hipaa: '#10B981', iso27001: '#8B5CF6' },
      },
      fontFamily: { sans: ['system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
