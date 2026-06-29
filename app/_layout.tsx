import "../global.css";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../components/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  );
}