import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = "primary", size = "md", loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[size], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#7c3aed"} size="small" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as TextStyle, styles[`${size}Text` as keyof typeof styles] as TextStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  primary: { backgroundColor: "#7c3aed" },
  secondary: { backgroundColor: "rgba(124,58,237,0.15)", borderWidth: 1, borderColor: "#7c3aed" },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: "#dc2626" },
  sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
  md: { paddingHorizontal: 20, paddingVertical: 14, minHeight: 48 },
  lg: { paddingHorizontal: 24, paddingVertical: 18, minHeight: 56 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: "600", color: "#fff" },
  primaryText: { color: "#fff" },
  secondaryText: { color: "#7c3aed" },
  ghostText: { color: "#a78bfa" },
  dangerText: { color: "#fff" },
  smText: { fontSize: 13 },
  mdText: { fontSize: 16 },
  lgText: { fontSize: 18 },
});
