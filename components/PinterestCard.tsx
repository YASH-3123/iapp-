import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Share, Animated,
} from "react-native";
import { useTheme } from "./ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

type Photo = {
  id: string;
  author: string;
  download_url: string;
  width: number;
  height: number;
};

type Props = {
  item: Photo;
  isFav: boolean;
  height: number;
  width: number;
  onPress: () => void;
  onFavToggle: () => void;
};

export function PinterestCard({
  item, isFav, height, width, onPress, onFavToggle,
}: Props) {
  const { colors } = useTheme();
  const heartScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const handleFav = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true, speed: 60 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onFavToggle();
  };

  const share = async () => {
    await Share.share({
      message: `Photo by ${item.author} — https://picsum.photos/id/${item.id}/800/600`,
    });
  };

  const authorFirst = item.author.split(" ")[0];

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width,
          backgroundColor: colors.surface,
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={share}
        delayPressIn={0}
        delayLongPress={500}
      >
        <Image
          source={{ uri: `https://picsum.photos/id/${item.id}/400/600` }}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
        <Animated.View style={[styles.heartWrap, { transform: [{ scale: heartScale }] }]}>
          <TouchableOpacity style={styles.heartBtn} onPress={handleFav}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={15}
              color={isFav ? "#ff4d6d" : "#fff"}
            />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.footer}>
          <Text style={styles.author} numberOfLines={1}>{authorFirst}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: { width: "100%" },
  heartWrap: { position: "absolute", top: 8, right: 8 },
  heartBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  author: { fontSize: 11, fontWeight: "700", color: "#fff" },
});