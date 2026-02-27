import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, loading } = useAuthStore();
  if (loading) return <View style={{ flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#a78bfa" /></View>;
  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
