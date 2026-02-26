import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#1B2A4A';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB' },
      tabBarActiveTintColor: NAVY,
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Inspections', tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="findings" options={{ title: 'Findings', tabBarIcon: ({ color, size }) => <Ionicons name="warning-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="report" options={{ title: 'Report', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
