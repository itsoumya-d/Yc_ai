import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tab}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.35 }}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { height: 80, paddingBottom: 16, backgroundColor: '#fff', borderTopColor: '#FCE7F3' },
      tabBarShowLabel: false,
      headerStyle: { backgroundColor: '#fff' },
      headerTintColor: '#701A75',
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Skin Health', tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="History" focused={focused} /> }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Insights" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tab: { alignItems: 'center' },
  label: { fontSize: 10, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
  labelActive: { color: '#A21CAF' },
});
