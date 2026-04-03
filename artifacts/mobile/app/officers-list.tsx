import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp, type Officer } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function OfficerItem({ item, onRemove }: { item: Officer; onRemove: (id: string) => void }) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
          <Feather name="user" size={20} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.badge, { color: colors.mutedForeground }]}>{item.badgeNumber}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.status === "active" ? colors.success : colors.destructive },
          ]}
        />
      </View>

      <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
        <View style={styles.infoItem}>
          <Feather name="map" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.area}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Feather name="tag" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Rp {item.rate.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Text style={[styles.qrCode, { color: colors.primary }]} numberOfLines={1}>
          {item.qrCode}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert("Hapus Petugas", `Yakin ingin menghapus ${item.name}?`, [
              { text: "Batal", style: "cancel" },
              { text: "Hapus", style: "destructive", onPress: () => onRemove(item.id) },
            ]);
          }}
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );
}

export default function OfficersListScreen() {
  const colors = useColors();
  const { officers, removeOfficer } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={officers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OfficerItem item={item} onRemove={removeOfficer} />}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={officers.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="users" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Belum Ada Petugas</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Tambahkan petugas parkir untuk mulai menggunakan sistem
            </Text>
          </View>
        }
      />
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/officer-form");
        }}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  badge: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  infoRow: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 0.5,
    gap: 16,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  infoText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  qrCode: { fontSize: 11, fontFamily: "Inter_500Medium", flex: 1, marginRight: 12 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
