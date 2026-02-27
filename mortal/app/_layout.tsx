import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#1C1917' }, headerTintColor: '#F5F5F4', contentStyle: { backgroundColor: '#1C1917' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="vault" options={{ title: 'Document Vault', presentation: 'modal' }} />
        <Stack.Screen name="chat" options={{ title: 'AI Planning Assistant', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
