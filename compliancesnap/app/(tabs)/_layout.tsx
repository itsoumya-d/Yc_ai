import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0', borderTopWidth: 1, paddingBottom: 4, height: 80 },
      tabBarActiveTintColor: '#F59E0B',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="snap" options={{ title: 'Snap', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'camera' : 'camera-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="records" options={{ title: 'Records', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="audit" options={{ title: 'Audit', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="corrective" options={{ href: null }} />
      <Tabs.Screen name="regulations" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
    </Tabs>
  );
}
