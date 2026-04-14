import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

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

export default function ReportDetailScreen() {
  const colors = useColors();
  const { reports, updateReportStatus, userRole, authToken } = useApp();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [adminNotes, setAdminNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const report = reports.find((r) => r.id.toString() === reportId);

  if (!report) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="file" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Laporan tidak ditemukan</Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(report.status, colors);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateReportStatus(report.id, newStatus, adminNotes || undefined);
      setAdminNotes("");
      setShowNotes(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Gagal mengubah status");
    }
  };

  const isAdmin = userRole === "admin" && !!authToken;

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
            label: "Lokasi",
            value: report.address || (report.latitude && report.longitude
              ? `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}`
              : "Tidak tersedia"),
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

      {report.adminNotes && (
        <View style={[styles.card, { backgroundColor: colors.primary + "08", borderRadius: colors.radius }]}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>Catatan Admin</Text>
          <Text style={[styles.description, { color: colors.foreground }]}>{report.adminNotes}</Text>
        </View>
      )}

      {report.photoUrl && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Bukti Foto</Text>
          <Image
            source={{ uri: report.photoUrl }}
            style={[styles.photo, { borderRadius: colors.radius }]}
          />
        </View>
      )}

      {isAdmin && report.status !== "resolved" && (
        <View style={styles.adminActions}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, marginBottom: 12 }]}>
            Tindakan Admin
          </Text>

          {showNotes ? (
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              <TextInput
                style={[styles.notesInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, borderRadius: colors.radius }]}
                placeholder="Tambahkan catatan admin..."
                placeholderTextColor={colors.mutedForeground}
                value={adminNotes}
                onChangeText={setAdminNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setShowNotes(true)}
              style={({ pressed }) => [
                styles.notesButton,
                { borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="edit" size={16} color={colors.primary} />
              <Text style={[styles.notesButtonText, { color: colors.primary }]}>Tambah Catatan</Text>
            </Pressable>
          )}

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
            <Pressable
              onPress={() => handleStatusChange("rejected")}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: colors.destructive, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="x" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Tolak</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 12 },
  statusCard: { margin: 20, padding: 24, alignItems: "center", gap: 10 },
  statusTitle: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold" },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  statusBadgeText: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
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
  detailLabel: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold" },
  sectionLabel: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 10 },
  description: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular", lineHeight: 22 },
  photo: { width: "100%", height: 200, resizeMode: "cover" },
  adminActions: { paddingHorizontal: 20, marginTop: 8 },
  notesCard: { padding: 12, marginBottom: 12 },
  notesInput: { height: 80, padding: 12, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular", borderWidth: 1 },
  notesButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, borderWidth: 1, gap: 8, marginBottom: 12 },
  notesButtonText: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
  statusButtons: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    gap: 8,
  },
  actionButtonText: { color: "#FFF", fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
