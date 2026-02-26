import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.emoji, focused && styles.emojiActive]}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { height: 80, paddingBottom: 16, paddingTop: 8, backgroundColor: '#fff', borderTopColor: '#E2E8F0' },
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: '#1B4EDE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" emoji="🏛️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: 'Benefits',
          tabBarIcon: ({ focused }) => <TabIcon label="Benefits" emoji="💰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ focused }) => <TabIcon label="Docs" emoji="📄" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Applications',
          tabBarIcon: ({ focused }) => <TabIcon label="Track" emoji="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22, opacity: 0.4 },
  emojiActive: { opacity: 1 },
  label: { fontSize: 10, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
  labelActive: { color: '#1B4EDE' },
});
