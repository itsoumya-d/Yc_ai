import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const YELLOW = '#EAB308';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
      tabBarActiveTintColor: YELLOW,
      tabBarInactiveTintColor: '#6B7280',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Projects', tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="site" options={{ title: 'Site', tabBarIcon: ({ color, size }) => <Ionicons name="hammer-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="photos" options={{ title: 'Photos', tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="issues" options={{ title: 'Issues', tabBarIcon: ({ color, size }) => <Ionicons name="warning-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
