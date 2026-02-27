import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

type Variant = 'success' | 'warning' | 'error' | 'primary' | 'muted';

interface BadgeProps {
  label: string;
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string }> = {
  success: { bg: '#F0FDF4', text: COLORS.success },
  warning: { bg: '#FFFBEB', text: COLORS.warning },
  error: { bg: '#FEF2F2', text: COLORS.error },
  primary: { bg: COLORS.primaryLight, text: COLORS.primaryDark },
  muted: { bg: '#F5F5F4', text: COLORS.textSecondary },
};

export function Badge({ label, variant = 'muted' }: BadgeProps) {
  const { bg, text } = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  label: { fontSize: 11, fontWeight: '600' },
});
