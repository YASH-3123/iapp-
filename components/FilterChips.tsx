import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";

type Filter = { key: string; label: string };
type Props = {
  filters: Filter[];
  active: string;
  onSelect: (key: string) => void;
};

export function FilterChips({ filters, active, onSelect }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {filters.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[styles.chip, {
            backgroundColor: active === f.key ? colors.accent : colors.surface,
            borderColor: active === f.key ? colors.accent : colors.border,
          }]}
          onPress={() => onSelect(f.key)}
        >
          <Text style={[styles.chipTxt, {
            color: active === f.key ? "#fff" : colors.chipText,
          }]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 12, marginBottom: 8, flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 99, borderWidth: 0.5,
  },
  chipTxt: { fontSize: 12, fontWeight: "600" },
});