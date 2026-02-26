import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#FDF2F8' }, headerTintColor: '#701A75', contentStyle: { backgroundColor: '#FDF2F8' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ title: 'Skin Check', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="analysis/[id]" options={{ title: 'Analysis Results' }} />
      </Stack>
    </>
  );
}
