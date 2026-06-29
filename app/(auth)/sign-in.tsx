import { Link, useRouter, useLocalSearchParams } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const { login } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();

  // If we just came from "Create account", the email is prefilled for convenience.
  const [email, setEmail] = useState(params.email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    if (!email) { setEmailError("Email is required"); valid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Enter a valid email"); valid = false; }
    if (!password) { setPasswordError("Password is required"); valid = false; }
    return valid;
  };

  const onSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const success = await login(email.trim().toLowerCase(), password);
      if (success) {
        router.replace("/(root)/(tabs)");
      } else {
        Alert.alert("Sign in failed", "Invalid email or password. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, { backgroundColor: colors.headerBg }]}>
            <Ionicons name="images-outline" size={32} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>GalleryApp</Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Sign in to continue
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email address</Text>
            <View style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: emailError ? colors.danger : colors.border },
            ]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="you@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: passwordError ? colors.danger : colors.border },
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{passwordError}</Text> : null}
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.headerBg, opacity: loading ? 0.7 : 1 }]}
            onPress={onSignIn}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnTxt}>Sign in</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerTxt, { color: colors.textMuted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Register link */}
          <View style={styles.linkRow}>
            <Text style={[styles.linkTxt, { color: colors.textMuted }]}>
              Don't have an account?
            </Text>
            <Link href="/(auth)/sign-up">
              <Text style={[styles.link, { color: colors.accent }]}> Register</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoSection: { alignItems: "center", marginBottom: 32, gap: 8 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  appName: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5 },
  tagline: { fontSize: 14 },
  form: {
    borderRadius: 24, padding: 24,
    borderWidth: 0.5, gap: 4,
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 4 },
  errorTxt: { fontSize: 12, marginTop: 5 },
  btn: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: "center", marginTop: 8,
  },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
  dividerLine: { flex: 1, height: 0.5 },
  dividerTxt: { fontSize: 13 },
  linkRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  linkTxt: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: "700" },
});