import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = '#E8711A';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: ORANGE,
      tabBarInactiveTintColor: '#636E72',
      tabBarStyle: { backgroundColor: '#2C2C2E', borderTopColor: '#3C3C3E', height: 60, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="camera" options={{ title: 'Capture', tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
