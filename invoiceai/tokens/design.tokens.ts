/** InvoiceAI design tokens - Bold & Financial - Emerald/Blue finops palette */
export const colors = {
  brand: '#059669',
  brandLight: '#10B981',
  brandDark: '#047857',
  accent: '#1D4ED8',
  accentLight: '#3B82F6',
  accentDark: '#1E40AF',
  background: '#F0FDF4',
  surface: '#FFFFFF',
  surfaceAlt: '#ECFDF5',
  border: '#D1FAE5',
  borderLight: '#ECFDF5',
  text: '#064E3B',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  error: '#DC2626',
  success: '#059669',
  warning: '#D97706',
} as const;

export const typography = {
  displayFont: "'Syne', system-ui, sans-serif",
  bodyFont: "'IBM Plex Sans', system-ui, sans-serif",
  scale: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  base: '8px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 16px rgba(0,0,0,0.12)',
  lg: '0 8px 32px rgba(0,0,0,0.16)',
  xl: '0 16px 64px rgba(0,0,0,0.20)',
} as const;

export const motion = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  motion,
} as const;
