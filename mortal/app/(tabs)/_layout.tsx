import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.35 }}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { height: 80, paddingBottom: 16, backgroundColor: '#1C1917', borderTopColor: '#292524' },
      tabBarShowLabel: false,
      headerStyle: { backgroundColor: '#1C1917' },
      headerTintColor: '#F5F5F4',
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'My Plan', tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" label="Plan" focused={focused} /> }} />
      <Tabs.Screen name="assets" options={{ title: 'Digital Assets', tabBarIcon: ({ focused }) => <TabIcon emoji="💎" label="Assets" focused={focused} /> }} />
      <Tabs.Screen name="contacts" options={{ title: 'Trusted Contacts', tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Contacts" focused={focused} /> }} />
      <Tabs.Screen name="vault" options={{ title: 'Document Vault', tabBarIcon: ({ focused }) => <TabIcon emoji="🔐" label="Vault" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#57534E', marginTop: 2, fontWeight: '600' },
  tabLabelActive: { color: '#D97706' },
});
