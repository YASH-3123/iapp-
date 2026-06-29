import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, StatusBar, ScrollView, Alert, Modal,
  Animated, Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { useTheme } from "../../../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const FAVORITES_KEY = "favorites";

export default function ImageDetail() {
  const { id, author } = useLocalSearchParams<{ id: string; author: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isFav, setIsFav] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const fsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkFav();
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0, speed: 12, bounciness: 5, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(fsOpacity, {
      toValue: fullscreen ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [fullscreen]);

  const checkFav = async () => {
    const s = await AsyncStorage.getItem(FAVORITES_KEY);
    setIsFav(s ? JSON.parse(s).includes(id) : false);
  };

  const toggleFav = async () => {
    const s = await AsyncStorage.getItem(FAVORITES_KEY);
    let favs: string[] = s ? JSON.parse(s) : [];
    favs = isFav ? favs.filter((f) => f !== id) : [...favs, id];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    setIsFav(!isFav);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.6, useNativeDriver: true, speed: 60 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const download = async () => {
    setDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to save images.");
        return;
      }
      const fileUri = FileSystem.documentDirectory + `photo_${id}.jpg`;
      const { uri: saved } = await FileSystem.downloadAsync(
        `https://picsum.photos/id/${id}/1200/800`,
        fileUri
      );
      await MediaLibrary.saveToLibraryAsync(saved);
      Alert.alert("Saved ✅", "Image saved to your gallery.");
    } catch {
      Alert.alert("Error", "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const shareImage = async () => {
    try {
      await Share.share({
        message: `Check out this photo by ${author}!\nhttps://picsum.photos/id/${id}/800/600`,
        url: `https://picsum.photos/id/${id}/800/600`,
      });
    } catch {
      Alert.alert("Error", "Could not share image.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <Animated.View style={{ opacity: fade }}>
          <TouchableOpacity activeOpacity={0.95} onPress={() => setFullscreen(true)}>
            <Image
              source={{ uri: `https://picsum.photos/id/${id}/${Math.round(width)}/440` }}
              style={styles.hero}
              resizeMode="cover"
            />
            <View style={styles.heroScrim} />
            <View style={styles.expandHint}>
              <Ionicons name="expand-outline" size={13} color="#fff" />
              <Text style={styles.expandTxt}> Fullscreen</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Info sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slide }],
              opacity: fade,
            },
          ]}
        >
          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: colors.headerBg }]}>
              <Text style={styles.avatarLetter}>
                {author?.[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.authorName, { color: colors.text }]}>{author}</Text>
              <Text style={[styles.photoId, { color: colors.textMuted }]}>Photo #{id}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity
                style={[
                  styles.favBtn,
                  { backgroundColor: isFav ? "#fff0f3" : colors.surfaceSecondary },
                ]}
                onPress={toggleFav}
              >
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={22}
                  color={isFav ? "#ff4d6d" : colors.textMuted}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {/* Download */}
            <TouchableOpacity
              style={[styles.downloadBtn, { opacity: downloading ? 0.6 : 1 }]}
              onPress={download}
              disabled={downloading}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#fff" />
              <Text style={styles.downloadBtnTxt}>
                {downloading ? "Saving…" : "Download"}
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              style={[
                styles.shareBtn,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={shareImage}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.text} />
              <Text style={[styles.shareBtnTxt, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>

            {/* Fullscreen */}
            <TouchableOpacity
              style={[
                styles.fsIconBtn,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFullscreen(true)}
            >
              <Ionicons name="scan-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Meta info */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Photo details
          </Text>
          <View style={styles.meta}>
            {[
              { icon: "person-circle-outline" as const, label: "Author", val: author },
              { icon: "barcode-outline" as const, label: "ID", val: `#${id}` },
              { icon: "globe-outline" as const, label: "Source", val: "Picsum" },
            ].map((m) => (
              <View
                key={m.label}
                style={[
                  styles.metaCard,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name={m.icon} size={20} color={colors.accent} />
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                  {m.label}
                </Text>
                <Text
                  style={[styles.metaVal, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {m.val}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal visible={fullscreen} transparent animationType="none">
        <Animated.View style={[styles.fsModal, { opacity: fsOpacity }]}>
          <StatusBar hidden />
          <Image
            source={{ uri: `https://picsum.photos/id/${id}/1200/900` }}
            style={{ width, height }}
            resizeMode="contain"
          />

          {/* Close */}
          <TouchableOpacity
            style={styles.fsClose}
            onPress={() => setFullscreen(false)}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Download in fullscreen */}
          <TouchableOpacity
            style={styles.fsDl}
            onPress={download}
            disabled={downloading}
          >
            <Ionicons name="cloud-download-outline" size={16} color="#fff" />
            <Text style={styles.fsDlTxt}>
              {downloading ? "Saving…" : "Save"}
            </Text>
          </TouchableOpacity>

          {/* Share in fullscreen */}
          <TouchableOpacity style={styles.fsShare} onPress={shareImage}>
            <Ionicons name="share-social-outline" size={16} color="#fff" />
          </TouchableOpacity>

          {/* Author info */}
          <View style={styles.fsAuthorWrap}>
            <Text style={styles.fsAuthor}>{author}</Text>
            <Text style={styles.fsId}>#{id}</Text>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: "absolute", top: 54, left: 16, zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.48)",
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  hero: { width: "100%", height: 360 },
  heroScrim: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  expandHint: {
    position: "absolute", bottom: 14, right: 14,
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.48)",
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5,
  },
  expandTxt: { color: "#fff", fontSize: 11 },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -22, padding: 22, minHeight: 420,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 8,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  authorAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { fontSize: 20, fontWeight: "700", color: "#fff" },
  authorName: { fontSize: 19, fontWeight: "700" },
  photoId: { fontSize: 12, marginTop: 2 },
  favBtn: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  divider: { height: 0.5, marginVertical: 18 },
  actionRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  downloadBtn: {
    flex: 1, backgroundColor: "#1a1a2e", borderRadius: 14,
    paddingVertical: 14, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  downloadBtnTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
  shareBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, borderWidth: 0.5,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  shareBtnTxt: { fontSize: 14, fontWeight: "600" },
  fsIconBtn: {
    width: 52, borderRadius: 14, paddingVertical: 14, borderWidth: 0.5,
    alignItems: "center", justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", letterSpacing: 0.8,
    marginBottom: 12, textTransform: "uppercase",
  },
  meta: { flexDirection: "row", gap: 8 },
  metaCard: {
    flex: 1, borderRadius: 14, padding: 14,
    alignItems: "center", gap: 6, borderWidth: 0.5,
  },
  metaLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4 },
  metaVal: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  fsModal: {
    flex: 1, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  fsClose: {
    position: "absolute", top: 54, right: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  fsDl: {
    position: "absolute", bottom: 46, right: 16,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 99, flexDirection: "row",
    alignItems: "center", gap: 6,
  },
  fsDlTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  fsShare: {
    position: "absolute", bottom: 46, right: 120,
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  fsAuthorWrap: { position: "absolute", bottom: 46, left: 18 },
  fsAuthor: { color: "#fff", fontSize: 15, fontWeight: "700" },
  fsId: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
});