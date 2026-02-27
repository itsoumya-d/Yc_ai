import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="check/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="scan" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
