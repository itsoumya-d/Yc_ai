import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pb-6 pt-14">
        <Text className="mb-6 text-2xl font-bold text-gray-900">Profile</Text>
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-600">
            <Text className="text-2xl font-bold text-white">{initials}</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-900">{displayName}</Text>
            <Text className="text-sm text-gray-500">{user?.email}</Text>
          </View>
        </View>
      </View>

      <View className="p-5 gap-4">
        {/* Info */}
        <View className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <View className="flex-row items-center gap-3 border-b border-gray-50 px-4 py-3.5">
            <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
            <Text className="flex-1 text-sm text-gray-700">Your data is encrypted and private</Text>
          </View>
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <Ionicons name="lock-closed-outline" size={20} color="#059669" />
            <Text className="flex-1 text-sm text-gray-700">Bills are stored securely with RLS</Text>
          </View>
        </View>

        {/* About */}
        <View className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center gap-3">
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
              <Text className="text-sm text-gray-700">About Claimback</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
          <View className="h-px bg-gray-50" />
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center gap-3">
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <Text className="text-sm text-gray-700">Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
          <View className="h-px bg-gray-50" />
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center gap-3">
              <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
              <Text className="text-sm text-gray-700">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          className="items-center rounded-2xl border border-red-200 bg-red-50 py-4"
          onPress={handleSignOut}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text className="font-medium text-red-600">Sign Out</Text>
          </View>
        </TouchableOpacity>

        <Text className="text-center text-xs text-gray-400">Claimback v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
