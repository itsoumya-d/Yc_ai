import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import 'react-native-url-polyfill/auto';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.replace('/(auth)/login');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (session) {
      checkBiometrics();
    } else {
      router.replace('/(auth)/login');
    }
  }, [loading, session]);

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access Mortal',
          fallbackLabel: 'Use Passcode',
        });
        if (result.success) {
          router.replace('/(tabs)');
        } else {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        }
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1030' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="wishes/conversation" options={{ presentation: 'modal' }} />
      <Stack.Screen name="assets/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="contacts/add" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
