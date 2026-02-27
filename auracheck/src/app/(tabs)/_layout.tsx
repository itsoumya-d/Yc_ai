import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB' } }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="spots" options={{ title: 'My Spots', tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} /> }} />
    </Tabs>
  );
}
