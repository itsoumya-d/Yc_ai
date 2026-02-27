import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  label?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#dc2626',
  label,
  style,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={color} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
  },
});
