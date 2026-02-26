import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CIVIC_BLUE = '#1E40AF';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CIVIC_BLUE,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: 'Benefits',
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'My Apps',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
