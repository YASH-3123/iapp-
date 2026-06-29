import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert, StatusBar, Dimensions,
} from "react-native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../../../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type Photo = { id: string; author: string; download_url: string; };

const SCREEN_WIDTH = Dimensions.get("window").width;
const COL_WIDTH = (SCREEN_WIDTH - 36) / 2;

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [favPhotos, setFavPhotos] = useState<Photo[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favIds: string[] = stored ? JSON.parse(stored) : [];
      setFavorites(favIds);
      const cached = await AsyncStorage.getItem("photos_cache");
      if (cached) {
        const all: Photo[] = JSON.parse(cached);
        setFavPhotos(all.filter((p) => favIds.includes(p.id)));
      }
    } catch (e) { console.log(e); }
  };

  const remove = async (id: string) => {
    Alert.alert("Remove", "Remove from favorites?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const updated = favorites.filter((f) => f !== id);
          setFavorites(updated);
          setFavPhotos((p) => p.filter((x) => x.id !== id));
          await AsyncStorage.setItem("favorites", JSON.stringify(updated));
        },
      },
    ]);
  };

  const displayed = search.trim()
    ? favPhotos.filter((p) => p.author.toLowerCase().includes(search.toLowerCase()))
    : favPhotos;

  const leftCol = displayed.filter((_, i) => i % 2 === 0);
  const rightCol = displayed.filter((_, i) => i % 2 !== 0);

  const renderFavCard = (item: Photo) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push({
        pathname: "/(root)/(tabs)/image-detail",
        params: { id: item.id, author: item.author, download_url: item.download_url },
      })}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: `https://picsum.photos/id/${item.id}/400/600` }}
        style={styles.thumb}
        resizeMode="cover"
      />
      <View style={styles.cardScrim} />
      <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item.id)}>
        <Ionicons name="heart-dislike" size={14} color="#ff4d6d" />
      </TouchableOpacity>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {item.author.split(" ")[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
      }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saved</Text>
        <View style={styles.headerRight}>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.countBadgeTxt, { color: colors.textMuted }]}>
              {favPhotos.length} photos
            </Text>
          </View>
          <Ionicons name="heart" size={22} color="#ff4d6d" />
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}>
        <Ionicons name="search-outline" size={17} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search saved…"
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {displayed.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {search ? "No results" : "Nothing saved yet"}
          </Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            {search ? `No saved photos match "${search}"` : "Tap the heart on any photo to save it"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => "fav-masonry"}
          renderItem={() => (
            <View style={styles.masonry}>
              <View style={styles.col}>{leftCol.map(renderFavCard)}</View>
              <View style={styles.col}>{rightCol.map(renderFavCard)}</View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  countBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  countBadgeTxt: { fontSize: 12, fontWeight: "600" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: 12, borderRadius: 14, paddingHorizontal: 14, borderWidth: 0.5,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  masonry: { flexDirection: "row", paddingHorizontal: 10, gap: 8, paddingTop: 4 },
  col: { flex: 1, gap: 8 },
  card: { borderRadius: 16, overflow: "hidden", borderWidth: 0.5 },
  thumb: { width: "100%", height: 180 },
  cardScrim: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 70,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  removeBtn: {
    position: "absolute", top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  cardFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  cardAuthor: { fontSize: 11, fontWeight: "700", color: "#fff" },
  empty: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 10, paddingTop: 80,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 40 },
});