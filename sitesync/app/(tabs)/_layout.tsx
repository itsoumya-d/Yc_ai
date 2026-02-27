import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";

const TINT = "#d97706";
const INACTIVE = "#94a3b8";

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  );
}

function CameraIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

function PhotosIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" />
      <Path d="M21 15l-5-5L5 21" />
    </Svg>
  );
}

function ReportsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TINT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: "Capture",
          tabBarIcon: ({ color }) => <CameraIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: "Photos",
          tabBarIcon: ({ color }) => <PhotosIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <ReportsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
