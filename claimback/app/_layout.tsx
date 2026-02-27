import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#F1F5F9', contentStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ title: 'Scan Bill', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="dispute/[id]" options={{ title: 'Dispute Details' }} />
      </Stack>
    </>
  );
}
