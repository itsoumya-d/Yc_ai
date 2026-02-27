import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#dcfce7', text: '#16a34a' },
  warning: { bg: '#fef9c3', text: '#ca8a04' },
  danger: { bg: '#fee2e2', text: '#dc2626' },
  info: { bg: '#e0f2fe', text: '#0284c7' },
  neutral: { bg: '#f1f5f9', text: '#64748b' },
  primary: { bg: '#dbeafe', text: '#1d4ed8' },
};

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
