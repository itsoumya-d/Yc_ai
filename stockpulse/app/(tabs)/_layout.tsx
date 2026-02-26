import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'Inventory': 'Inv',
    'Scan': 'Scan',
    'Alerts': 'Alert',
    'Reports': 'Rpt',
  };
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? '#0F4C3A' : '#94A3B8', opacity: focused ? 1 : 0.7 }}>
      {icons[label] || label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#D1FAE5', height: 80, paddingBottom: 16 },
        tabBarActiveTintColor: '#0F4C3A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inventory', tabBarIcon: ({ focused }) => <TabIcon label="Inventory" focused={focused} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ focused }) => <TabIcon label="Scan" focused={focused} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({ focused }) => <TabIcon label="Alerts" focused={focused} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ focused }) => <TabIcon label="Reports" focused={focused} /> }} />
    </Tabs>
  );
}