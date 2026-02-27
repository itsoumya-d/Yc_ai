export const COLORS = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  background: '#F0FDF4',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  text: '#064E3B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#D1FAE5',
  borderLight: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  lowStock: '#EF4444',
  mediumStock: '#F59E0B',
  goodStock: '#10B981',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'beverages', label: 'Beverages', icon: 'wine' },
  { id: 'produce', label: 'Produce', icon: 'nutrition' },
  { id: 'dry_goods', label: 'Dry Goods', icon: 'bag' },
  { id: 'dairy', label: 'Dairy', icon: 'water' },
  { id: 'meat', label: 'Meat', icon: 'fast-food' },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles' },
  { id: 'other', label: 'Other', icon: 'cube' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const URGENCY_COLORS = {
  critical: '#DC2626',
  low: '#F59E0B',
  normal: '#10B981',
} as const;

export type UrgencyLevel = keyof typeof URGENCY_COLORS;

/** Returns stock urgency level based on current vs reorder levels */
export function getStockUrgency(current: number, reorderPoint: number, maxStock: number): UrgencyLevel {
  if (current <= 0 || current <= reorderPoint * 0.25) return 'critical';
  if (current <= reorderPoint) return 'low';
  return 'normal';
}

/** Returns a 0-1 percentage of stock level */
export function getStockPercentage(current: number, maxStock: number): number {
  if (maxStock <= 0) return 0;
  return Math.min(1, Math.max(0, current / maxStock));
}

export const TYPOGRAPHY = {
  heading1: { fontSize: 24, fontWeight: '700' as const, color: COLORS.text },
  heading2: { fontSize: 20, fontWeight: '700' as const, color: COLORS.text },
  heading3: { fontSize: 16, fontWeight: '600' as const, color: COLORS.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: COLORS.text },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, color: COLORS.textSecondary },
  label: { fontSize: 11, fontWeight: '600' as const, color: COLORS.textSecondary, letterSpacing: 0.5 },
  mono: { fontSize: 13, fontFamily: 'monospace' as const, color: COLORS.text },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
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
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;
