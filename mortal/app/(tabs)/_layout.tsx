import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SAGE = '#5B8C5A';
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
      <Tabs.Screen name="index" options={{ tabBarActiveTintColor: SAGE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} label="Home" /> }} />
      <Tabs.Screen name="vault" options={{ tabBarActiveTintColor: SAGE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="lock-closed-outline" color={color} label="Vault" /> }} />
      <Tabs.Screen name="guide" options={{ tabBarActiveTintColor: SAGE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="chatbubble-ellipses-outline" color={color} label="Guide" /> }} />
      <Tabs.Screen name="share" options={{ tabBarActiveTintColor: SAGE, tabBarInactiveTintColor: GRAY, tabBarIcon: ({ color }) => <TabIcon name="people-outline" color={color} label="Share" /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: '#FDFBF7', borderTopColor: '#E8DFD0', borderTopWidth: 1, height: Platform.OS === 'ios' ? 88 : 64, paddingBottom: Platform.OS === 'ios' ? 28 : 8, paddingTop: 8 },
  icon: { alignItems: 'center', gap: 2 },
  label: { fontSize: 10, fontWeight: '500' },
});
