import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Share, Animated,
} from "react-native";
import { useTheme } from "./ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

type Photo = { id: string; author: string; download_url: string; };
type Props = {
  item: Photo;
  isFav: boolean;
  isLarge?: boolean;
  onPress: () => void;
  onFavToggle: () => void;
};

export function PhotoCard({ item, isFav, isLarge = false, onPress, onFavToggle }: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const handleFav = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.6, useNativeDriver: true, speed: 60 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onFavToggle();
  };

  const share = async () => {
    await Share.share({
      message: `Photo by ${item.author} — https://picsum.photos/id/${item.id}/800/600`,
    });
  };

  // Truncate author — first word only
  const authorShort = item.author.split(" ")[0];

  return (
    <Animated.View
      style={[
        styles.card,
        isLarge ? styles.cardLarge : styles.cardSmall,
        { backgroundColor: colors.surface, transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={share}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={{
            uri: `https://picsum.photos/id/${item.id}/${isLarge ? "600/400" : "400/400"}`,
          }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Dark scrim at bottom */}
        <View style={styles.scrim} />

        {/* Heart button */}
        <View style={styles.topRight}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleFav}>
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={14}
                color={isFav ? "#ff4d6d" : "#fff"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Author + ID at bottom */}
        <View style={styles.footer}>
          <Text style={styles.author} numberOfLines={1}>
            {authorShort}
          </Text>
          <Text style={styles.id}>#{item.id}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cardSmall: { width: "48.5%", height: 160 },
  cardLarge: { width: "100%", height: 220 },
  scrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  topRight: { position: "absolute", top: 8, right: 8 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.38)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 8,
    left: 10,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  author: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  id: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    flexShrink: 0,
  },
});