export const COLORS = {
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryLight: '#DBEAFE',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  cardShadow: 'rgba(0,0,0,0.06)',
};

export const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  none: { bg: '#F0FDF4', text: '#16A34A' },
  minor: { bg: '#FEFCE8', text: '#CA8A04' },
  moderate: { bg: '#FFF7ED', text: '#EA580C' },
  severe: { bg: '#FEF2F2', text: '#DC2626' },
  total_loss: { bg: '#450A0A', text: '#FFFFFF' },
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  in_progress: { bg: '#EFF6FF', text: '#1E40AF' },
  review: { bg: '#FFFBEB', text: '#B45309' },
  submitted: { bg: '#F0FDF4', text: '#15803D' },
};

export const PROPERTY_AREAS = [
  'Roof',
  'Exterior',
  'Foundation',
  'Garage',
  'Kitchen',
  'Bathroom',
  'Living Room',
  'Bedroom',
  'Basement',
  'Attic',
  'Electrical Panel',
  'HVAC',
];

export const PROPERTY_TYPES = [
  'Single Family Home',
  'Condo',
  'Commercial',
  'Multi-Family',
  'Mobile Home',
];

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: '#1E293B' },
  h2: { fontSize: 22, fontWeight: '700' as const, color: '#1E293B' },
  h3: { fontSize: 18, fontWeight: '600' as const, color: '#1E293B' },
  body: { fontSize: 15, fontWeight: '400' as const, color: '#1E293B' },
  caption: { fontSize: 12, fontWeight: '400' as const, color: '#64748B' },
  label: { fontSize: 13, fontWeight: '600' as const, color: '#64748B' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};
