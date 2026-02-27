import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = true }: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color="#1d4ed8" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
