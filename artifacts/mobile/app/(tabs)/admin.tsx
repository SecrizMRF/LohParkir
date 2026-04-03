import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StatCard } from "@/components/StatCard";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function AdminScreen() {
  const colors = useColors();
  const { dashboardStats, userRole, setUserRole, officers, reports, scanHistory } = useApp();

  const isAdmin = userRole === "admin";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingTop: Platform.OS === "web" ? 67 + 16 : 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.roleToggle}>
        <Text style={[styles.roleLabel, { color: colors.mutedForeground }]}>Mode:</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setUserRole(isAdmin ? "public" : "admin");
          }}
          style={({ pressed }) => [
            styles.roleButton,
            {
              backgroundColor: isAdmin ? colors.primary : colors.muted,
              borderRadius: colors.radius,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name={isAdmin ? "shield" : "user"}
            size={14}
            color={isAdmin ? "#FFF" : colors.foreground}
          />
          <Text
            style={[styles.roleButtonText, { color: isAdmin ? "#FFF" : colors.foreground }]}
          >
            {isAdmin ? "Admin Dishub" : "Publik"}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dashboard</Text>

      <View style={styles.statsRow}>
        <StatCard icon="activity" label="Total Scan" value={dashboardStats.totalScans} />
        <StatCard
          icon="check-circle"
          label="QR Valid"
          value={dashboardStats.validScans}
          color={colors.success}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="x-circle"
          label="QR Palsu"
          value={dashboardStats.invalidScans}
          color={colors.destructive}
        />
        <StatCard
          icon="file-text"
          label="Laporan"
          value={dashboardStats.totalReports}
          color={colors.warning}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="dollar-sign"
          label="Pendapatan"
          value={`Rp ${dashboardStats.totalRevenue.toLocaleString("id-ID")}`}
          color={colors.secondary}
        />
        <StatCard
          icon="users"
          label="Petugas Aktif"
          value={dashboardStats.activeOfficers}
          color={colors.primary}
        />
      </View>

      {isAdmin && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>
            Kelola
          </Text>

          <View style={styles.menuGrid}>
            {[
              {
                icon: "user-plus" as const,
                label: "Tambah Petugas",
                desc: "Daftarkan petugas baru",
                onPress: () => router.push("/officer-form"),
                color: colors.primary,
              },
              {
                icon: "users" as const,
                label: "Daftar Petugas",
                desc: `${officers.length} petugas terdaftar`,
                onPress: () => router.push("/officers-list"),
                color: colors.secondary,
              },
              {
                icon: "file-text" as const,
                label: "Kelola Laporan",
                desc: `${dashboardStats.pendingReports} menunggu`,
                onPress: () => router.push("/reports-manage"),
                color: colors.warning,
              },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  item.onPress();
                }}
                style={({ pressed }) => [
                  styles.menuCard,
                  { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
                  <Feather name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </Pressable>
            ))}
          </View>

          {scanHistory.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>
                Aktivitas Scan Terbaru
              </Text>
              {scanHistory.slice(0, 5).map((scan) => (
                <View
                  key={scan.id}
                  style={[styles.activityItem, { backgroundColor: colors.card, borderRadius: colors.radius }]}
                >
                  <View
                    style={[
                      styles.activityDot,
                      { backgroundColor: scan.isValid ? colors.success : colors.destructive },
                    ]}
                  />
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityName, { color: colors.foreground }]}>
                      {scan.officerName || "QR Tidak Dikenal"}
                    </Text>
                    <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                      {new Date(scan.scannedAt).toLocaleString("id-ID")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.activityStatus,
                      { color: scan.isValid ? colors.success : colors.destructive },
                    ]}
                  >
                    {scan.isValid ? "Valid" : "Invalid"}
                  </Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  roleToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  roleLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  roleButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  roleButtonText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", paddingHorizontal: 20, marginBottom: 14 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 10 },
  menuGrid: { paddingHorizontal: 20, gap: 10 },
  menuCard: { padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuDesc: { fontSize: 12, fontFamily: "Inter_400Regular", position: "absolute", right: 16 },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  activityDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  activityStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
