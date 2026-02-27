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
      tabBarStyle: { height: 80, paddingBottom: 16, backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
      tabBarShowLabel: false,
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#F1F5F9',
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="bills" options={{ title: 'My Bills', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Bills" focused={focused} /> }} />
      <Tabs.Screen name="disputes" options={{ title: 'Disputes', tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" label="Disputes" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="History" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tab: { alignItems: 'center' },
  label: { fontSize: 10, color: '#475569', marginTop: 2, fontWeight: '600' },
  labelActive: { color: '#22D3EE' },
});
