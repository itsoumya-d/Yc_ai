import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#2563EB';
const GRAY = '#9CA3AF';

function TabIcon({ name, color, label }: { name: keyof typeof Ionicons.glyphMap; color: string; label: string }) {
  return (
    <View style={s.icon}>
      <Ionicons name={name} size={22} color={color} />
      <Text style={[s.label, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: s.bar, tabBarShowLabel: false }}>
      <Tabs.Screen name="index" options={{ tabBarActiveTintColor: BLUE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} label="Home" /> }} />
      <Tabs.Screen name="scan" options={{ tabBarActiveTintColor: BLUE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="camera-outline" color={color} label="Scan" /> }} />
      <Tabs.Screen name="disputes" options={{ tabBarActiveTintColor: BLUE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="shield-checkmark-outline" color={color} label="Disputes" /> }} />
      <Tabs.Screen name="history" options={{ tabBarActiveTintColor: BLUE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="time-outline" color={color} label="History" /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB', borderTopWidth: 1, height: Platform.OS === 'ios' ? 88 : 64, paddingBottom: Platform.OS === 'ios' ? 28 : 8, paddingTop: 8 },
  icon: { alignItems: 'center', gap: 2 },
  label: { fontSize: 10, fontWeight: '500' },
});
