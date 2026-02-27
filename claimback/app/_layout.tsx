import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-url-polyfill/auto';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.replace('/(auth)/login');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (session) router.replace('/(tabs)');
      else router.replace('/(auth)/login');
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="bills/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="disputes/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="disputes/new" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
