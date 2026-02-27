import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="guide/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="session/[id]" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="camera" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
