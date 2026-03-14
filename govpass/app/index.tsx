import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, loading } = useAuthStore();
  if (loading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#1a56db" /></View>;
  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
