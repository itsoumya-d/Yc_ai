import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const BLUE = '#00B4D8';
const NAVY = '#0F1923';
const DARK_CARD = '#162330';
const GRAY = '#8A9BB0';

function TabIcon({ focused, label, icon }: { focused: boolean; label: string; icon: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, { color: focused ? BLUE : GRAY }]}>{icon}</Text>
      <Text style={[styles.label, { color: focused ? BLUE : GRAY }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK_CARD,
          borderTopColor: '#1E3045',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Dashboard" icon="◫" />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Scan" icon="⊡" />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Products" icon="☰" />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Reports" icon="▤" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
