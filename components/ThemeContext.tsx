import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

export const lightColors = {
  background: "#f4f5f9",
  surface: "#ffffff",
  surfaceSecondary: "#f0f2f8",
  text: "#0f0f1e",
  textSecondary: "#444455",
  textMuted: "#9999aa",
  border: "#e8e8f0",
  borderStrong: "#d0d0e0",
  headerBg: "#1a1a2e",
  headerText: "#ffffff",
  chip: "#ffffff",
  chipText: "#555566",
  accent: "#6366f1",
  accentBg: "#6366f115",
  danger: "#dc2626",
  dangerBg: "#fff0f0",
  inputBg: "#f8f9ff",
  tabBar: "#ffffff",
  tabBarBorder: "#f0f0f0",
  card: "#ffffff",
  placeholder: "#c0c0d0",
};

export const darkColors = {
  background: "#0a0a14",
  surface: "#13131f",
  surfaceSecondary: "#1a1a2e",
  text: "#f0f0ff",
  textSecondary: "#aaaacc",
  textMuted: "#55556a",
  border: "#22223a",
  borderStrong: "#33334a",
  headerBg: "#07070f",
  headerText: "#ffffff",
  chip: "#1a1a2e",
  chipText: "#aaaacc",
  accent: "#818cf8",
  accentBg: "#818cf820",
  danger: "#ff6b6b",
  dangerBg: "#2a0f0f",
  inputBg: "#1a1a2e",
  tabBar: "#0d0d1a",
  tabBarBorder: "#1a1a2e",
  card: "#13131f",
  placeholder: "#44445a",
};

type Colors = typeof lightColors;

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: Colors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    AsyncStorage.getItem("app_theme").then((t) => {
      if (t === "dark" || t === "light") setTheme(t);
    });
  }, []);

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    await AsyncStorage.setItem("app_theme", next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors: theme === "light" ? lightColors : darkColors,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}