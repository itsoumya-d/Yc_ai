import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, textStyle }: ButtonProps) {
  const btnStyle = [
    styles.base,
    styles[variant],
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#1d4ed8'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: '#1d4ed8' },
  secondary: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#1d4ed8' },
  danger: { backgroundColor: '#fee2e2' },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.55 },
  text: { fontSize: 15, fontWeight: '700' },
  primaryText: { color: '#ffffff' },
  secondaryText: { color: '#1d4ed8' },
  dangerText: { color: '#dc2626' },
  ghostText: { color: '#1d4ed8' },
});
