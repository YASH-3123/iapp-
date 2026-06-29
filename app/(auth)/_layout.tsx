import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeContext";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();

  // Still restoring the saved session from storage — show a spinner instead of a blank screen.
  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.headerBg} />
      </View>
    );
  }

  // Already logged in (session restored from a previous app launch) — skip straight past auth.
  if (isSignedIn) return <Redirect href="/(root)/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}