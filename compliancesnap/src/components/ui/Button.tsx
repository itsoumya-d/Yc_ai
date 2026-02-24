import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ onPress, title, variant = 'primary', size = 'md', loading, disabled, style }: ButtonProps) {
  const containerStyle: ViewStyle[] = [styles.base, styles[`${variant}Btn`], styles[`${size}Btn`]];
  const textStyle: TextStyle[] = [styles.baseText, styles[`${variant}Text`], styles[`${size}Text`]];
  if (disabled || loading) containerStyle.push(styles.disabled);

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[...containerStyle, style]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : COLORS.primary} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexDirection: 'row', gap: 6 },
  disabled: { opacity: 0.5 },
  primaryBtn: { backgroundColor: COLORS.primary },
  secondaryBtn: { backgroundColor: COLORS.primaryLight },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  ghostBtn: { backgroundColor: 'transparent' },
  dangerBtn: { backgroundColor: '#DC2626' },
  smBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  mdBtn: { paddingHorizontal: 16, paddingVertical: 11 },
  lgBtn: { paddingHorizontal: 24, paddingVertical: 15 },
  baseText: { fontWeight: '600' },
  primaryText: { color: '#fff' },
  secondaryText: { color: COLORS.primaryDark },
  outlineText: { color: COLORS.primary },
  ghostText: { color: COLORS.primary },
  dangerText: { color: '#fff' },
  smText: { fontSize: 13 },
  mdText: { fontSize: 15 },
  lgText: { fontSize: 17 },
});
