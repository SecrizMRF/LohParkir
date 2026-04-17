import { Feather } from "@/components/Icon";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PROVINCES, type AreaItem } from "@/lib/area-data";
import { useColors } from "@/hooks/useColors";

export type AreaSelection = {
  province: string;
  city: string;
  district: string;
  village: string;
};

type Props = {
  value: AreaSelection;
  onChange: (v: AreaSelection) => void;
};

type Level = "province" | "city" | "district" | "village";

const LABELS: Record<Level, string> = {
  province: "Provinsi",
  city: "Kabupaten/Kota",
  district: "Kecamatan",
  village: "Kelurahan/Desa",
};

export function AreaPicker({ value, onChange }: Props) {
  const colors = useColors();
  const [openLevel, setOpenLevel] = useState<Level | null>(null);
  const [search, setSearch] = useState("");

  const optionsFor = (level: Level): AreaItem[] => {
    if (level === "province") return PROVINCES;
    const prov = PROVINCES.find((p) => p.name === value.province);
    if (level === "city") return prov?.children || [];
    const city = prov?.children?.find((c) => c.name === value.city);
    if (level === "district") return city?.children || [];
    const dist = city?.children?.find((d) => d.name === value.district);
    if (level === "village") return dist?.children || [];
    return [];
  };

  const handleSelect = (level: Level, name: string) => {
    if (level === "province") onChange({ province: name, city: "", district: "", village: "" });
    else if (level === "city") onChange({ ...value, city: name, district: "", village: "" });
    else if (level === "district") onChange({ ...value, district: name, village: "" });
    else onChange({ ...value, village: name });
    setOpenLevel(null);
    setSearch("");
  };

  const fields: { level: Level; current: string; disabled: boolean }[] = [
    { level: "province", current: value.province, disabled: false },
    { level: "city", current: value.city, disabled: !value.province },
    { level: "district", current: value.district, disabled: !value.city },
    { level: "village", current: value.village, disabled: !value.district },
  ];

  const visibleOptions = useMemo(() => {
    if (!openLevel) return [];
    const opts = optionsFor(openLevel);
    if (!search.trim()) return opts;
    return opts.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
  }, [openLevel, search, value]);

  return (
    <View>
      {fields.map((f) => (
        <View key={f.level} style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.foreground }]}>{LABELS[f.level]}</Text>
          <Pressable
            disabled={f.disabled}
            onPress={() => { setOpenLevel(f.level); setSearch(""); }}
            style={({ pressed }) => [
              styles.selector,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderRadius: colors.radius,
                opacity: f.disabled ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <Text
              style={[
                styles.selectorText,
                { color: f.current ? colors.foreground : colors.mutedForeground },
              ]}
              numberOfLines={1}
            >
              {f.current || `Pilih ${LABELS[f.level]}`}
            </Text>
            <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      ))}

      <Modal visible={!!openLevel} transparent animationType="fade" onRequestClose={() => setOpenLevel(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenLevel(null)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Pilih {openLevel ? LABELS[openLevel] : ""}
              </Text>
              <Pressable onPress={() => setOpenLevel(null)} hitSlop={10}>
                <Feather name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>
            <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Cari..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              data={visibleOptions}
              keyExtractor={(it) => it.name}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 360 }}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                  Tidak ada data
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(openLevel!, item.name)}
                  style={({ pressed }) => [
                    styles.option,
                    { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[styles.optionText, { color: colors.foreground }]}>{item.name}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 6 },
  selector: {
    flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 14,
    borderWidth: 1, gap: 10,
  },
  selectorText: { flex: 1, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: { width: "100%", maxWidth: 480, padding: 16, gap: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  searchBox: {
    flexDirection: "row", alignItems: "center", height: 44, paddingHorizontal: 12, borderWidth: 1, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  option: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  optionText: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_400Regular" },
  empty: { textAlign: "center", padding: 24, fontFamily: "AtkinsonHyperlegible_400Regular" },
});
