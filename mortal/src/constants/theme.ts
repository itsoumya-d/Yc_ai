export const COLORS = {
  primary: '#7C3AED', primaryLight: '#A78BFA', primaryDark: '#6D28D9',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444',
  background: '#FAF9FF', card: '#FFFFFF', border: '#E5E7EB',
  text: '#111827', textSecondary: '#6B7280', textMuted: '#9CA3AF',
} as const;

export const DOC_CATEGORIES = [
  { id: 'will' as const, label: 'Will & Testament', icon: '📜' },
  { id: 'insurance' as const, label: 'Insurance', icon: '🛡️' },
  { id: 'financial' as const, label: 'Financial', icon: '💰' },
  { id: 'medical' as const, label: 'Medical', icon: '🏥' },
  { id: 'personal' as const, label: 'Personal', icon: '💌' },
  { id: 'other' as const, label: 'Other', icon: '📁' },
];
