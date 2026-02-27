import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0D9488', light: '#14B8A6', dark: '#0F766E', foreground: '#F0FDFA' },
        accent: { DEFAULT: '#F97316', light: '#FB923C', dark: '#EA580C' },
        bg: { root: '#FAFAF9', card: '#FFFFFF', surface: '#F5F5F4', elevated: '#E7E5E4' },
        card: '#FFFFFF',
        surface: '#F5F5F4',
        border: { DEFAULT: '#E7E5E4', emphasis: '#D6D3D1' },
        text: {
          primary: '#1C1917',
          secondary: '#57534E',
          tertiary: '#A8A29E',
          muted: '#A8A29E',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: { sans: ['system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
