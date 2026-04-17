import { Feather } from "@/components/Icon";
import { hapticImpact, showAlert } from "@/lib/platform";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp, type Officer } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRequireAdmin } from "@/hooks/useRoleGuard";

function OfficerItem({ item, onToggleStatus, onRemove }: { item: Officer; onToggleStatus: (id: number, status: string) => void; onRemove: (id: number) => void }) {
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
        <Pressable
          onPress={() => onToggleStatus(item.id, item.status === "active" ? "inactive" : "active")}
          style={[styles.statusPill, { backgroundColor: item.status === "active" ? colors.success + "15" : colors.destructive + "15" }]}
        >
          <View style={[styles.statusDot, { backgroundColor: item.status === "active" ? colors.success : colors.destructive }]} />
          <Text style={[styles.statusLabel, { color: item.status === "active" ? colors.success : colors.destructive }]}>
            {item.status === "active" ? "Aktif" : "Nonaktif"}
          </Text>
        </Pressable>
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
            hapticImpact();
            showAlert("Hapus Petugas", `Yakin ingin menghapus ${item.name}?`, [
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
  useRequireAdmin();
  const { officers, removeOfficer, updateOfficer, refreshData } = useApp();

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleStatus = async (id: number, newStatus: string) => {
    try {
      await updateOfficer(id, { status: newStatus } as any);
    } catch (err: any) {
      showAlert("Error", err.message || "Gagal mengubah status petugas");
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeOfficer(id);
    } catch (err: any) {
      showAlert("Error", err.message || "Gagal menghapus petugas");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={officers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OfficerItem item={item} onToggleStatus={handleToggleStatus} onRemove={handleRemove} />}
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
          hapticImpact();
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
  name: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  badge: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 2 },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_700Bold" },
  infoRow: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 0.5,
    gap: 16,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  infoText: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", flex: 1 },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  qrCode: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_400Regular", flex: 1, marginRight: 12 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 6 },
  emptyDesc: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular", textAlign: "center", maxWidth: 260 },
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
