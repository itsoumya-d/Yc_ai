import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SAFETY_YELLOW = '#FFC107';
const CHARCOAL = '#2D3436';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SAFETY_YELLOW,
        tabBarInactiveTintColor: '#636E72',
        tabBarStyle: {
          backgroundColor: '#1E272E',
          borderTopColor: '#2D3436',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Inspect',
          tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          title: 'Inspections',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
