import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB' } }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan Bill', tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} /> }} />
      <Tabs.Screen name="claims" options={{ title: 'My Claims', tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} /> }} />
      <Tabs.Screen name="savings" options={{ title: 'Savings', tabBarIcon: ({ color, size }) => <Ionicons name="cash" size={size} color={color} /> }} />
    </Tabs>
  );
}
