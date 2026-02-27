import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureToggle?: boolean;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  leftIcon,
  rightIcon,
  secureToggle = false,
  secureTextEntry,
  style,
  ...rest
}: InputProps) {
  const [showSecure, setShowSecure] = useState(false);

  const isSecure = secureToggle ? !showSecure : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error ? styles.inputRowError : styles.inputRowNormal]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null, style]}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...rest}
        />
        {secureToggle && (
          <TouchableOpacity
            onPress={() => setShowSecure((prev) => !prev)}
            style={styles.iconRight}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>{showSecure ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
        {!secureToggle && rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  inputRowNormal: {
    borderColor: COLORS.border,
  },
  inputRowError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  inputWithLeft: {
    paddingLeft: 6,
  },
  iconLeft: {
    paddingLeft: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    paddingRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 5,
    marginLeft: 2,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
    marginLeft: 2,
  },
});
