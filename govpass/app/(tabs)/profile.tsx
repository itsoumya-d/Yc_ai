import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login'); } },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-16 pb-6 border-b border-gray-100">
        <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mb-4">
          <Text className="text-white text-2xl font-bold">{user?.email?.[0]?.toUpperCase() ?? 'U'}</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">{user?.user_metadata?.full_name ?? 'User'}</Text>
        <Text className="text-gray-500">{user?.email}</Text>
      </View>

      <View className="px-6 py-4 space-y-2">
        <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-gray-100" onPress={() => router.push('/onboarding')}>
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">✏️</Text>
            <Text className="text-gray-800 font-medium">Update Household Info</Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-red-50 rounded-xl p-4 flex-row items-center border border-red-100" onPress={handleSignOut}>
          <Text className="text-xl mr-3">🚪</Text>
          <Text className="text-red-600 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
