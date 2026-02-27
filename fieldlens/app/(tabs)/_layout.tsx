import { Tabs } from 'expo-router';
import { Home, BookOpen, Camera, BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1f2937',
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#d97706',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="guides" options={{ title: 'Guides', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'AI Scan', tabBarIcon: ({ color, size }) => <Camera color={color} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
