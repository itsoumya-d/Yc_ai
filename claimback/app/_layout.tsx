import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync(); }, []);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bill/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="dispute/[id]" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>
    </>
  );
}
