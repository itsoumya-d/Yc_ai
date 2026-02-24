import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    isDisabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const labelStyle: TextStyle[] = [
    styles.label,
    styles[`labelSize_${size}`],
    styles[`labelVariant_${variant}`],
    isDisabled && styles.labelDisabled,
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.surface : COLORS.primary}
        />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Size variants
  size_sm: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  size_md: { paddingVertical: 13, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12 },

  // Color variants
  variant_primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },

  // Label base
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelDisabled: {
    opacity: 0.7,
  },

  // Label sizes
  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 16 },

  // Label colors
  labelVariant_primary: { color: COLORS.surface },
  labelVariant_secondary: { color: COLORS.primaryDark },
  labelVariant_outline: { color: COLORS.primary },
  labelVariant_ghost: { color: COLORS.primary },
  labelVariant_danger: { color: COLORS.surface },
});
