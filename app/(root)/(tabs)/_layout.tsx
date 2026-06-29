import { Tabs } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { Redirect } from "expo-router";
import { useTheme } from "../../../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: colors.tabBarBorder,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen name="image-detail" options={{ href: null }} />
    </Tabs>
  );
}