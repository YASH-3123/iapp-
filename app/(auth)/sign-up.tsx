import { Link, useRouter } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune",
  "Chennai", "Hyderabad", "Ahmedabad", "Kolkata",
];

export default function SignUp() {
  const { register } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!mobile.trim()) e.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(mobile)) e.mobile = "Must be exactly 10 digits";
    if (!gender) e.gender = "Please select gender";
    if (!address.trim()) e.address = "Address is required";
    if (!city) e.city = "Please select a city";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await register({
        fullName,
        email: normalizedEmail,
        mobile,
        gender,
        address,
        city,
        password,
      });

      // Account saved — send the person to sign in instead of logging them in automatically.
      Alert.alert(
        "Account created",
        "Your account has been created successfully. Please sign in to continue.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/(auth)/sign-in",
                params: { email: normalizedEmail },
              }),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert("Registration failed", e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = (key: string) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));
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
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: colors.headerBg }]}>
            <Ionicons name="person-add-outline" size={28} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Fill in your details to get started
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>

          {/* Full name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full name</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.fullName ? colors.danger : colors.border,
            }]}>
              <Ionicons name="person-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Yash Sharma"
                placeholderTextColor={colors.placeholder}
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError("fullName"); }}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.fullName}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email address</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.email ? colors.danger : colors.border,
            }]}>
              <Ionicons name="mail-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="you@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={(t) => { setEmail(t); clearError("email"); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.email}</Text> : null}
          </View>

          {/* Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile number</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.mobile ? colors.danger : colors.border,
            }]}>
              <Ionicons name="call-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="10-digit number"
                placeholderTextColor={colors.placeholder}
                value={mobile}
                onChangeText={(t) => { setMobile(t); clearError("mobile"); }}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
            {errors.mobile ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.mobile}</Text> : null}
          </View>

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
            <View style={styles.genderRow}>
              {["Male", "Female", "Other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: gender === g ? colors.accent : colors.inputBg,
                      borderColor: gender === g ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => { setGender(g); clearError("gender"); }}
                >
                  <Text style={[
                    styles.genderTxt,
                    { color: gender === g ? "#fff" : colors.textMuted },
                  ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.gender}</Text> : null}
          </View>

          {/* Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.address ? colors.danger : colors.border,
            }]}>
              <Ionicons name="home-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="123 MG Road"
                placeholderTextColor={colors.placeholder}
                value={address}
                onChangeText={(t) => { setAddress(t); clearError("address"); }}
              />
            </View>
            {errors.address ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.address}</Text> : null}
          </View>

          {/* City */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
            <TouchableOpacity
              style={[styles.inputWrap, {
                backgroundColor: colors.inputBg,
                borderColor: errors.city ? colors.danger : colors.border,
              }]}
              onPress={() => setShowCities(!showCities)}
            >
              <Ionicons name="location-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <Text style={[
                styles.input,
                { color: city ? colors.text : colors.placeholder, paddingVertical: 14 },
              ]}>
                {city || "Select your city"}
              </Text>
              <Ionicons
                name={showCities ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            {showCities && (
              <View style={[styles.dropdownList, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }]}>
                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: colors.border },
                      city === c && { backgroundColor: colors.accentBg },
                    ]}
                    onPress={() => {
                      setCity(c);
                      setShowCities(false);
                      clearError("city");
                    }}
                  >
                    <Text style={[styles.dropdownItemTxt, { color: colors.text }]}>{c}</Text>
                    {city === c && (
                      <Ionicons name="checkmark" size={16} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.city ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.city}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.password ? colors.danger : colors.border,
            }]}>
              <Ionicons name="lock-closed-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={(t) => { setPassword(t); clearError("password"); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={17}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.password}</Text> : null}
          </View>

          {/* Confirm password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm password</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.confirmPassword ? colors.danger : colors.border,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={17} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Repeat your password"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearError("confirmPassword"); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
            {errors.confirmPassword ? <Text style={[styles.errorTxt, { color: colors.danger }]}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.headerBg, opacity: loading ? 0.7 : 1 }]}
            onPress={onSignUp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnTxt}>Create account</Text>}
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={styles.linkRow}>
            <Text style={[styles.linkTxt, { color: colors.textMuted }]}>
              Already have an account?
            </Text>
            <Link href="/(auth)/sign-in">
              <Text style={[styles.link, { color: colors.accent }]}> Sign in</Text>
            </Link>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 28, gap: 8 },
  logoBox: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: "center" },
  form: { borderRadius: 24, padding: 22, borderWidth: 0.5 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15 },
  eyeBtn: { padding: 4 },
  errorTxt: { fontSize: 11, marginTop: 5, fontWeight: "500" },
  genderRow: { flexDirection: "row", gap: 8 },
  genderBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 11,
    alignItems: "center", borderWidth: 1,
  },
  genderTxt: { fontSize: 13, fontWeight: "600" },
  dropdownList: {
    borderWidth: 0.5, borderRadius: 14,
    marginTop: 6, overflow: "hidden",
  },
  dropdownItem: {
    padding: 14, borderBottomWidth: 0.5,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  dropdownItemTxt: { fontSize: 15 },
  btn: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: "center", marginTop: 8,
  },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  linkRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 16,
  },
  linkTxt: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: "700" },
});