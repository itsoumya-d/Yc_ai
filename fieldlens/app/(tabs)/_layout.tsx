import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0D1117', borderTopColor: '#21262D', height: 80, paddingBottom: 16 },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#8B949E',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Coach', tabBarIcon: ({ focused }) => <TabIcon emoji="í ¼í¾¯" focused={focused} /> }} />
      <Tabs.Screen name="sessions" options={{ title: 'Sessions', tabBarIcon: ({ focused }) => <TabIcon emoji="í ½í³¹" focused={focused} /> }} />
      <Tabs.Screen name="skills" options={{ title: 'Skills', tabBarIcon: ({ focused }) => <TabIcon emoji="âš¡" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="í ½í±¤" focused={focused} /> }} />
    </Tabs>
  );
}
