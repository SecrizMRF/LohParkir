import { Feather } from "@/components/Icon";
import { hapticImpact } from "@/lib/platform";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp, type Report } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRequireAdmin } from "@/hooks/useRoleGuard";

type FilterType = "all" | "pending" | "in_progress" | "resolved" | "rejected";

function getStatusConfig(status: string, colors: ReturnType<typeof useColors>) {
  switch (status) {
    case "pending":
      return { label: "Menunggu", bg: colors.warning + "15", fg: colors.warning };
    case "in_progress":
      return { label: "Diproses", bg: colors.primary + "15", fg: colors.primary };
    case "resolved":
      return { label: "Selesai", bg: colors.success + "15", fg: colors.success };
    case "rejected":
      return { label: "Ditolak", bg: colors.destructive + "15", fg: colors.destructive };
    default:
      return { label: status, bg: colors.muted, fg: colors.mutedForeground };
  }
}

function ReportManageItem({ item }: { item: Report }) {
  const colors = useColors();
  const statusConfig = getStatusConfig(item.status, colors);

  return (
    <Pressable
      onPress={() => {
        hapticImpact();
        router.push({ pathname: "/report-detail", params: { reportId: item.id.toString() } });
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.typeIcon,
            { backgroundColor: item.type === "fake_qr" ? colors.destructive + "15" : colors.warning + "15" },
          ]}
        >
          <Feather
            name={item.type === "fake_qr" ? "alert-triangle" : "map-pin"}
            size={18}
            color={item.type === "fake_qr" ? colors.destructive : colors.warning}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.ticketNumber, { color: colors.foreground }]}>{item.ticketNumber}</Text>
          <Text style={[styles.reportType, { color: colors.mutedForeground }]}>
            {item.type === "fake_qr" ? "QR Palsu" : "Parkir Liar"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderRadius: 6 }]}>
          <Text style={[styles.statusText, { color: statusConfig.fg }]}>{statusConfig.label}</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {item.description}
      </Text>
      {item.adminNotes && (
        <View style={styles.notesRow}>
          <Feather name="message-square" size={12} color={colors.primary} />
          <Text style={[styles.notesText, { color: colors.primary }]} numberOfLines={1}>
            {item.adminNotes}
          </Text>
        </View>
      )}
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        {new Date(item.createdAt).toLocaleString("id-ID")}
      </Text>
    </Pressable>
  );
}

export default function ReportsManageScreen() {
  const colors = useColors();
  useRequireAdmin();
  const { reports, refreshData } = useApp();
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    refreshData();
  }, []);

  const filteredReports = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Menunggu" },
    { value: "in_progress", label: "Diproses" },
    { value: "resolved", label: "Selesai" },
    { value: "rejected", label: "Ditolak" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => {
              hapticImpact();
              setFilter(f.value);
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.value ? colors.primary : colors.card,
                borderRadius: 20,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.value ? "#FFF" : colors.mutedForeground },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ReportManageItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filteredReports.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Tidak Ada Laporan</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {filter === "all"
                ? "Belum ada laporan yang masuk"
                : `Tidak ada laporan dengan status "${filters.find((f) => f.value === filter)?.label}"`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8 },
  filterText: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  ticketNumber: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  reportType: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_700Bold" },
  description: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular", marginBottom: 8 },
  notesRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  notesText: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", flex: 1 },
  date: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_400Regular" },
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
});
