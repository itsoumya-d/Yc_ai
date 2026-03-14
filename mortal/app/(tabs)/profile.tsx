import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  function handleSignOut() {
    Alert.alert('Sign Out', 'Sign out of Mortal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login'); } },
    ]);
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1e1e2e' }}>
        <View style={{ width: 64, height: 64, backgroundColor: '#4c1d95', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#a78bfa', fontSize: 26, fontWeight: '700' }}>{user?.email?.[0]?.toUpperCase() ?? 'U'}</Text>
        </View>
        <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>{user?.user_metadata?.full_name ?? 'User'}</Text>
        <Text style={{ color: '#64748b' }}>{user?.email}</Text>
      </View>
      <View style={{ padding: 24 }}>
        <TouchableOpacity style={{ backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} onPress={handleSignOut}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>door</Text>
          <Text style={{ color: '#f87171', fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
