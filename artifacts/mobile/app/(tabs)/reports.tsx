import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type Report } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

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

function ReportItem({ item }: { item: Report }) {
  const colors = useColors();
  const statusConfig = getStatusConfig(item.status, colors);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/report-detail", params: { reportId: item.id.toString() } })}
      style={({ pressed }) => [
        styles.reportCard,
        { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.reportHeader}>
        <View
          style={[
            styles.typeIcon,
            {
              backgroundColor:
                item.type === "fake_qr" ? colors.destructive + "15" : colors.warning + "15",
            },
          ]}
        >
          <Feather
            name={item.type === "fake_qr" ? "alert-triangle" : "map-pin"}
            size={18}
            color={item.type === "fake_qr" ? colors.destructive : colors.warning}
          />
        </View>
        <View style={styles.reportInfo}>
          <Text style={[styles.ticketNumber, { color: colors.foreground }]}>
            {item.ticketNumber}
          </Text>
          <Text style={[styles.reportType, { color: colors.mutedForeground }]}>
            {item.type === "fake_qr" ? "QR Code Palsu" : "Parkir Liar"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderRadius: 6 }]}>
          <Text style={[styles.statusText, { color: statusConfig.fg }]}>{statusConfig.label}</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        {new Date(item.createdAt).toLocaleString("id-ID")}
      </Text>
    </Pressable>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const { reports, refreshData } = useApp();

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ReportItem item={item} />}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
          paddingTop: Platform.OS === "web" ? 67 + 20 : 20,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={reports.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="file-text" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Belum Ada Laporan</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Laporan parkir liar atau QR palsu akan muncul di sini
            </Text>
          </View>
        }
      />
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/report-form");
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
  reportCard: { padding: 16, marginBottom: 12 },
  reportHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reportInfo: { flex: 1 },
  ticketNumber: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  reportType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  date: { fontSize: 11, fontFamily: "Inter_400Regular" },
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
    bottom: 100,
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
