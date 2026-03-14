import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#a78bfa', tabBarInactiveTintColor: '#4a5568', tabBarStyle: { backgroundColor: '#0f0f1a', borderTopColor: '#1e1e2e' } }}>
      <Tabs.Screen name="index" options={{ title: 'My Wishes', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="vault" options={{ title: 'Vault', tabBarIcon: ({ color, size }) => <Ionicons name="lock-closed-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
