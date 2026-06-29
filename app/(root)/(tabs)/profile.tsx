import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator, Switch, StatusBar,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune",
  "Chennai", "Hyderabad", "Ahmedabad", "Kolkata",
];

const AVATARS = [
  "😎", "🧑‍💻", "👩‍🎨", "🧑‍🚀",
  "🦊", "🐼", "🦁", "🐯",
  "🌟", "🔥", "💎", "🎯",
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [avatar, setAvatar] = useState("😎");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");

  const handleSave = async () => {
    if (!fullName || !mobile || !address || !city) {
      Alert.alert("Error", "All fields are required"); return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert("Error", "Mobile must be 10 digits"); return;
    }
    setSaving(true);
    try {
      const updated = { ...user, fullName, mobile, address, city };
      await AsyncStorage.setItem("session", JSON.stringify(updated));
      const s = await AsyncStorage.getItem("users");
      if (s) {
        const users = JSON.parse(s).map((u: any) =>
          u.email === user?.email ? updated : u
        );
        await AsyncStorage.setItem("users", JSON.stringify(users));
      }
      Alert.alert("Saved", "Profile updated.");
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setFullName(user?.fullName || "");
    setMobile(user?.mobile || "");
    setAddress(user?.address || "");
    setCity(user?.city || "");
    setShowCities(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out", style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Hero — always dark */}
      <View style={[styles.hero, { backgroundColor: "#1a1a2e" }]}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => setShowAvatars(!showAvatars)}
        >
          <Text style={styles.avatarEmoji}>{avatar}</Text>
          <View style={[styles.avatarDot, { backgroundColor: colors.accent }]}>
            <Ionicons name="pencil" size={9} color="#fff" />
          </View>
        </TouchableOpacity>

        {showAvatars && (
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.avatarOpt, avatar === a && styles.avatarOptActive]}
                onPress={() => { setAvatar(a); setShowAvatars(false); }}
              >
                <Text style={{ fontSize: 24 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.heroName}>{user?.fullName}</Text>
        <Text style={styles.heroEmail}>{user?.email}</Text>
        <View style={styles.heroBadge}>
          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.heroBadgeTxt}>{city || user?.city || "No city"}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={[styles.statsRow, {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}>
        {[
          { icon: "images-outline" as const, val: "100", label: "Photos", bg: "#6366f118", color: "#6366f1" },
          { icon: "heart" as const, val: "—", label: "Saved", bg: "#ff4d6d18", color: "#ff4d6d" },
          { icon: "person-outline" as const, val: user?.gender?.[0] || "—", label: "Gender", bg: "#10b98118", color: "#10b981" },
          { icon: "call-outline" as const, val: user?.mobile ? `…${user.mobile.slice(-4)}` : "—", label: "Mobile", bg: "#f59e0b18", color: "#f59e0b" },
        ].map((s, i) => (
          <View key={i} style={[
            styles.statItem,
            i < 3 && { borderRightWidth: 0.5, borderRightColor: colors.border },
          ]}>
            <View style={[styles.statIconWrap, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon} size={16} color={s.color} />
            </View>
            <Text style={[styles.statVal, { color: colors.text }]}>{s.val}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Info card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Personal info</Text>
          {!editing ? (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              style={[styles.editBtn, {
                borderColor: colors.accent,
                backgroundColor: colors.accentBg,
              }]}
            >
              <Ionicons name="create-outline" size={15} color={colors.accent} />
              <Text style={[styles.editBtnTxt, { color: colors.accent }]}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[styles.cancelBtn, {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary,
                }]}
                onPress={cancelEdit}
              >
                <Text style={[styles.cancelTxt, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveTxt}>Save</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {[
          { label: "Full name", val: fullName, set: setFullName, editable: true, kb: "default" as const },
          { label: "Email", val: user?.email || "", set: () => {}, editable: false, kb: "default" as const },
          { label: "Mobile", val: mobile, set: setMobile, editable: true, kb: "number-pad" as const },
          { label: "Gender", val: user?.gender || "", set: () => {}, editable: false, kb: "default" as const },
          { label: "Address", val: address, set: setAddress, editable: true, kb: "default" as const },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {f.label.toUpperCase()}
            </Text>
            {editing && f.editable ? (
              <TextInput
                style={[styles.fieldInput, {
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }]}
                value={f.val}
                onChangeText={f.set}
                keyboardType={f.kb}
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.fieldVal, { color: colors.text }]}>
                {f.val || "—"}
              </Text>
            )}
          </View>
        ))}

        {/* City */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CITY</Text>
          {editing ? (
            <>
              <TouchableOpacity
                style={[styles.dropdown, {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }]}
                onPress={() => setShowCities(!showCities)}
              >
                <Text style={[styles.dropdownTxt, {
                  color: city ? colors.text : colors.textMuted,
                }]}>
                  {city || "Select city"}
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
                      onPress={() => { setCity(c); setShowCities(false); }}
                    >
                      <Text style={[styles.dropdownItemTxt, { color: colors.text }]}>{c}</Text>
                      {city === c && <Ionicons name="checkmark" size={16} color={colors.accent} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={[styles.fieldVal, { color: colors.text }]}>
              {city || user?.city || "—"}
            </Text>
          )}
        </View>
      </View>

      {/* Preferences */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Preferences</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, {
              backgroundColor: isDark ? "#6366f118" : "#f59e0b18",
            }]}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={17}
                color={isDark ? "#6366f1" : "#f59e0b"}
              />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {isDark ? "Dark mode" : "Light mode"}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                Switch app theme
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#ddd", true: "#6366f1" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={[styles.logoutBtn, {
          backgroundColor: "#ff4d6d12",
          borderColor: "#ff4d6d40",
        }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color="#ff4d6d" />
        <Text style={styles.logoutTxt}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: 60, paddingBottom: 30,
    alignItems: "center", gap: 6,
  },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 10, position: "relative",
  },
  avatarEmoji: { fontSize: 48 },
  avatarDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#1a1a2e",
  },
  avatarGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16, padding: 12, marginBottom: 8,
    width: 240, justifyContent: "center",
  },
  avatarOpt: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  avatarOptActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  heroName: { fontSize: 22, fontWeight: "700", color: "#fff" },
  heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4,
  },
  heroBadgeTxt: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  statsRow: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 16,
    borderRadius: 18, borderWidth: 0.5, overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  statVal: { fontSize: 14, fontWeight: "700" },
  statLabel: { fontSize: 10, fontWeight: "500" },
  card: {
    margin: 16, marginBottom: 0, borderRadius: 20, padding: 18, borderWidth: 0.5,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5,
  },
  editBtnTxt: { fontSize: 13, fontWeight: "700" },
  cancelBtn: {
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 0.5,
  },
  cancelTxt: { fontSize: 13 },
  saveBtn: {
    backgroundColor: "#6366f1", borderRadius: 99,
    paddingHorizontal: 16, paddingVertical: 8,
    minWidth: 60, alignItems: "center",
  },
  saveTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  divider: { height: 0.5, marginVertical: 14 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  fieldVal: { fontSize: 15, fontWeight: "500" },
  fieldInput: {
    borderWidth: 0.5, borderRadius: 12, padding: 12, fontSize: 14,
  },
  dropdown: {
    borderWidth: 0.5, borderRadius: 12, padding: 13,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  dropdownTxt: { fontSize: 14 },
  dropdownList: {
    borderWidth: 0.5, borderRadius: 12, marginTop: 6, overflow: "hidden",
  },
  dropdownItem: {
    padding: 14, borderBottomWidth: 0.5,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  dropdownItemTxt: { fontSize: 14 },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  settingTitle: { fontSize: 15, fontWeight: "600" },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  logoutBtn: {
    margin: 16, borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, borderWidth: 0.5,
  },
  logoutTxt: { fontSize: 15, fontWeight: "700", color: "#ff4d6d" },
});