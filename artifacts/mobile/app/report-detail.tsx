import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useApp, type Report } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function getStatusConfig(status: Report["status"], colors: ReturnType<typeof useColors>) {
  switch (status) {
    case "pending":
      return { label: "Menunggu", bg: colors.warning + "15", fg: colors.warning };
    case "in_progress":
      return { label: "Diproses", bg: colors.primary + "15", fg: colors.primary };
    case "resolved":
      return { label: "Selesai", bg: colors.success + "15", fg: colors.success };
  }
}

export default function ReportDetailScreen() {
  const colors = useColors();
  const { reports, updateReportStatus, userRole } = useApp();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();

  const report = reports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="file" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Laporan tidak ditemukan</Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(report.status, colors);

  const handleStatusChange = async (newStatus: Report["status"]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateReportStatus(report.id, newStatus);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={[styles.statusCard, { backgroundColor: statusConfig.bg, borderRadius: colors.radius }]}>
        <Feather
          name={report.type === "fake_qr" ? "alert-triangle" : "map-pin"}
          size={32}
          color={statusConfig.fg}
        />
        <Text style={[styles.statusTitle, { color: statusConfig.fg }]}>
          {report.type === "fake_qr" ? "Laporan QR Palsu" : "Laporan Parkir Liar"}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.fg + "20" }]}>
          <Text style={[styles.statusBadgeText, { color: statusConfig.fg }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        {[
          { icon: "hash" as const, label: "Nomor Tiket", value: report.ticketNumber },
          { icon: "calendar" as const, label: "Tanggal", value: new Date(report.createdAt).toLocaleString("id-ID") },
          {
            icon: "map-pin" as const,
            label: "Koordinat",
            value: report.latitude && report.longitude
              ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
              : "Tidak tersedia",
          },
        ].map((item) => (
          <View key={item.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.detailIcon, { backgroundColor: colors.primary + "10" }]}>
              <Feather name={item.icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Deskripsi</Text>
        <Text style={[styles.description, { color: colors.foreground }]}>{report.description}</Text>
      </View>

      {report.photoUri && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Bukti Foto</Text>
          <Image
            source={{ uri: report.photoUri }}
            style={[styles.photo, { borderRadius: colors.radius }]}
          />
        </View>
      )}

      {userRole === "admin" && report.status !== "resolved" && (
        <View style={styles.adminActions}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, marginBottom: 12 }]}>
            Ubah Status
          </Text>
          <View style={styles.statusButtons}>
            {report.status === "pending" && (
              <Pressable
                onPress={() => handleStatusChange("in_progress")}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Feather name="play" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Proses</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => handleStatusChange("resolved")}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: colors.success, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="check" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Selesai</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { fontSize: 16, fontFamily: "Inter_500Medium", marginTop: 12 },
  statusCard: { margin: 20, padding: 24, alignItems: "center", gap: 10 },
  statusTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  statusBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: { marginHorizontal: 20, marginBottom: 16, padding: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  photo: { width: "100%", height: 200, resizeMode: "cover" },
  adminActions: { paddingHorizontal: 20, marginTop: 8 },
  statusButtons: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    gap: 8,
  },
  actionButtonText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
