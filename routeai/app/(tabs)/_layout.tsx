import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ROUTE_BLUE = '#0369A1';
const GRAY = '#6B7280';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ROUTE_BLUE,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Route',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complete"
        options={{
          title: 'Complete',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
