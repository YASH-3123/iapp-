import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../../hooks/useApi";
import { useDebounceSearch } from "../../../hooks/useDebounceSearch";
import { SearchBar } from "../../../components/SearchBar";
import { FilterChips } from "../../../components/FilterChips";
import { useTheme } from "../../../components/ThemeContext";
import { PinterestCard } from "../../../components/PinterestCard";

type Photo = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "a-m", label: "A – M" },
  { key: "n-z", label: "N – Z" },
];

const PAGE_SIZE = 12;
const SCREEN_WIDTH = Dimensions.get("window").width;
const COL_WIDTH = (SCREEN_WIDTH - 36) / 2;

function SkeletonCard({ height }: { height: number }) {
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeleton, { height, opacity: pulse }]} />
  );
}

type Row = { left: Photo; right: Photo | null; rowIndex: number };

function buildRows(photos: Photo[]): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < photos.length; i += 2) {
    rows.push({
      left: photos[i],
      right: photos[i + 1] || null,
      rowIndex: i / 2,
    });
  }
  return rows;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { data, loading, fetch_ } = useApi<Photo[]>();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const fetching = useRef(false);
  const debouncedSearch = useDebounceSearch(search, 300);

  // Reload favorites every time home tab is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (e) {}
  };

  const loadPhotos = async () => {
    if (fetching.current) return;
    fetching.current = true;
    const result = await fetch_(
      "https://picsum.photos/v2/list?page=1&limit=100",
    );
    if (result)
      await AsyncStorage.setItem("photos_cache", JSON.stringify(result));
    fetching.current = false;
  };

  const onRefresh = useCallback(async () => {
    if (fetching.current) return;
    setRefreshing(true);
    setPage(1);
    await loadPhotos();
    setRefreshing(false);
  }, []);

  const filtered = (data || []).filter((p) => {
    const matchSearch = debouncedSearch
      ? p.author.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true;
    const matchFilter =
      filter === "a-m"
        ? p.author[0].toLowerCase() <= "m"
        : filter === "n-z"
          ? p.author[0].toLowerCase() >= "n"
          : true;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = displayed.length < filtered.length;

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      setPage((p) => p + 1);
    }
  };

  const toggleFav = async (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  const openDetail = (item: Photo) => {
    router.push({
      pathname: "/(root)/(tabs)/image-detail",
      params: {
        id: item.id,
        author: item.author,
        download_url: item.download_url,
      },
    });
  };

  const getCardHeight = (item: Photo) => {
    const ratio = item.height / item.width;
    const h = COL_WIDTH * ratio;
    return Math.min(Math.max(h, 120), 300);
  };

  const rows = buildRows(displayed);

  const skeletonHeights = [
    180, 240, 160, 200, 220, 160, 200, 180, 240, 160, 200, 220,
  ];

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Gallery
          </Text>
        </View>
        <View style={styles.skeletonMasonry}>
          <View style={styles.skeletonCol}>
            {[0, 2, 4, 6, 8, 10].map((i) => (
              <SkeletonCard key={i} height={skeletonHeights[i]} />
            ))}
          </View>
          <View style={styles.skeletonCol}>
            {[1, 3, 5, 7, 9, 11].map((i) => (
              <SkeletonCard key={i} height={skeletonHeights[i]} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => `row-${item.rowIndex}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Gallery
              </Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                  onPress={toggleTheme}
                >
                  <Ionicons
                    name={isDark ? "sunny-outline" : "moon-outline"}
                    size={18}
                    color={colors.text}
                  />
                </TouchableOpacity>
                <View
                  style={[
                    styles.favBadge,
                    {
                      backgroundColor: "#ff4d6d15",
                      borderColor: "#ff4d6d30",
                    },
                  ]}
                >
                  <Ionicons name="heart" size={13} color="#ff4d6d" />
                  <Text style={styles.favCount}>{favorites.length}</Text>
                </View>
              </View>
            </View>

            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search by author…"
            />
            <FilterChips
              filters={FILTERS}
              active={filter}
              onSelect={setFilter}
            />
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {displayed.length} of {filtered.length} photos
              {debouncedSearch ? ` for "${debouncedSearch}"` : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <PinterestCard
              item={item.left}
              isFav={favorites.includes(item.left.id)}
              height={getCardHeight(item.left)}
              width={COL_WIDTH}
              onPress={() => openDetail(item.left)}
              onFavToggle={() => toggleFav(item.left.id)}
            />
            {item.right ? (
              <PinterestCard
                item={item.right}
                isFav={favorites.includes(item.right.id)}
                height={getCardHeight(item.right)}
                width={COL_WIDTH}
                onPress={() => openDetail(item.right!)}
                onFavToggle={() => toggleFav(item.right!.id)}
              />
            ) : (
              <View style={{ width: COL_WIDTH }} />
            )}
          </View>
        )}
        ListFooterComponent={() =>
          hasMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.footerTxt, { color: colors.textMuted }]}>
                Loading more…
              </Text>
            </View>
          ) : (data || []).length > 0 ? (
            <View style={styles.endRow}>
              <View
                style={[styles.endLine, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.endTxt, { color: colors.textMuted }]}>
                All caught up
              </Text>
              <View
                style={[styles.endLine, { backgroundColor: colors.border }]}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="images-outline"
              size={52}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTxt, { color: colors.text }]}>
              No photos found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  favBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
  },
  favCount: { color: "#ff4d6d", fontSize: 13, fontWeight: "700" },
  listContent: { paddingBottom: 30 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 8,
  },
  count: { fontSize: 11, paddingHorizontal: 16, marginBottom: 8, marginTop: 2 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  footerTxt: { fontSize: 12 },
  endRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  endLine: { flex: 1, height: 0.5 },
  endTxt: { fontSize: 12 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTxt: { fontSize: 16, fontWeight: "600" },
  skeletonMasonry: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 8,
    paddingTop: 12,
  },
  skeletonCol: { flex: 1, gap: 8 },
  skeleton: { backgroundColor: "#c8c8c8", borderRadius: 16 },
});
