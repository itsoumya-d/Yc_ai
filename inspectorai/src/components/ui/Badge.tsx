import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'muted' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', size = 'md', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[`variant_${variant}`], styles[`size_${size}`], style]}>
      <Text style={[styles.label, styles[`labelVariant_${variant}`], styles[`labelSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  size_sm: { paddingVertical: 2, paddingHorizontal: 8 },
  size_md: { paddingVertical: 4, paddingHorizontal: 10 },

  variant_primary: { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' },
  variant_success: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  variant_warning: { backgroundColor: '#FEF9C3', borderColor: '#FDE047' },
  variant_error: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  variant_muted: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  variant_outline: { backgroundColor: 'transparent', borderColor: COLORS.border },

  label: { fontWeight: '600', letterSpacing: 0.2 },
  labelSize_sm: { fontSize: 11 },
  labelSize_md: { fontSize: 12 },

  labelVariant_primary: { color: COLORS.primaryDark },
  labelVariant_success: { color: '#15803D' },
  labelVariant_warning: { color: '#B45309' },
  labelVariant_error: { color: '#B91C1C' },
  labelVariant_muted: { color: COLORS.textSecondary },
  labelVariant_outline: { color: COLORS.textSecondary },
});
