import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', disabled = false, loading = false }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} style={[styles.base, styles[variant], styles[size], isDisabled && styles.disabled]} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : COLORS.primary} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
  ghost: { backgroundColor: 'transparent' },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 28 },
  disabled: { opacity: 0.5 },
  label: { fontWeight: '600' },
  primaryLabel: { color: 'white' },
  secondaryLabel: { color: COLORS.primary },
  ghostLabel: { color: COLORS.primary },
  smLabel: { fontSize: 13 },
  mdLabel: { fontSize: 15 },
  lgLabel: { fontSize: 17 },
});
