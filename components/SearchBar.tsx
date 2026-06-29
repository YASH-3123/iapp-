import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = "Search…" }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    }]}>
      <Ionicons name="search-outline" size={17} color={colors.textMuted} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={17} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: 12, borderRadius: 14, paddingHorizontal: 14, borderWidth: 0.5,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },
});