import { Tabs } from 'expo-router';
import { Home, Camera, Map, Activity, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#e11d48',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Check', tabBarIcon: ({ color, size }) => <Camera color={color} size={size} /> }} />
      <Tabs.Screen name="body-map" options={{ title: 'Body Map', tabBarIcon: ({ color, size }) => <Map color={color} size={size} /> }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ color, size }) => <Activity color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
