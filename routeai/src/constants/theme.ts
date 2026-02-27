export const COLORS = {
  primary: '#0369A1',
  primaryDark: '#075985',
  primaryLight: '#BAE6FD',
  secondary: '#0EA5E9',
  background: '#F0F9FF',
  surface: '#FFFFFF',
  text: '#0C4A6E',
  textSecondary: '#64748B',
  border: '#E0F2FE',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  urgent: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
} as const;

export const JOB_STATUS_COLORS: Record<string, string> = {
  pending: '#94A3B8',
  en_route: '#0369A1',
  in_progress: '#D97706',
  completed: '#16A34A',
  cancelled: '#DC2626',
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
};

export const NOTIFICATION_COLORS: Record<string, string> = {
  route_update: '#0369A1',
  new_job: '#16A34A',
  schedule_change: '#D97706',
  emergency: '#DC2626',
  message: '#6366F1',
};

export const SERVICE_TYPES = [
  'HVAC Installation',
  'HVAC Repair',
  'Plumbing Emergency',
  'Plumbing Maintenance',
  'Electrical Inspection',
  'Electrical Repair',
  'General Maintenance',
  'Other',
] as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;
