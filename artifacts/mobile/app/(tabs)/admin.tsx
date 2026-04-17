import { Feather } from "@/components/Icon";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatCard } from "@/components/StatCard";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRequireAdmin } from "@/hooks/useRoleGuard";
import { formatRupiah, hapticImpact, showAlert } from "@/lib/platform";

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  useRequireAdmin();
  const { dashboardStats, officers, scanHistory, authUser, logout, refreshData } = useApp();

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogout = () => {
    showAlert("Logout", "Yakin ingin keluar dari akun admin?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/role-select");
        },
      },
    ]);
  };

  const mainFeatures = [
    {
      icon: "user-plus" as const,
      label: "Tambah Petugas",
      desc: "Daftarkan juru parkir baru",
      color: colors.primary,
      onPress: () => router.push("/officer-form"),
    },
    {
      icon: "users" as const,
      label: "Daftar Petugas",
      desc: `${officers.length} petugas terdaftar`,
      color: colors.secondary,
      onPress: () => router.push("/officers-list"),
    },
    {
      icon: "file-text" as const,
      label: "Kelola Laporan",
      desc: `${dashboardStats.pendingReports} menunggu tinjauan`,
      color: colors.warning,
      onPress: () => router.push("/reports-manage"),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="shield" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcome, { color: colors.mutedForeground }]}>Admin Dishub</Text>
            <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
              {authUser?.fullName || "Administrator"}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: colors.destructive + "15", borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="log-out" size={14} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Keluar</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fitur Utama</Text>
      <View style={styles.featureGrid}>
        {mainFeatures.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              hapticImpact();
              item.onPress();
            }}
            style={({ pressed }) => [
              styles.featureCard,
              { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: item.color + "15" }]}>
              <Feather name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Statistik</Text>

      <View style={styles.statsRow}>
        <StatCard icon="activity" label="Total Scan" value={dashboardStats.totalScans} />
        <Pressable
          style={{ flex: 1 }}
          onPress={() => { hapticImpact(); router.push("/reports-manage"); }}
        >
          <StatCard
            icon="file-text"
            label="Laporan"
            value={dashboardStats.totalReports}
            color={colors.warning}
          />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          icon="check-circle"
          label="QR Valid"
          value={dashboardStats.validScans}
          color={colors.success}
        />
        <Pressable
          style={{ flex: 1 }}
          onPress={() => { hapticImpact(); router.push({ pathname: "/reports-manage", params: { filter: "fake_qr" } } as any); }}
        >
          <StatCard
            icon="x-circle"
            label="QR Palsu"
            value={dashboardStats.invalidScans}
            color={colors.destructive}
          />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          icon="sunrise"
          label="Scan Hari Ini"
          value={dashboardStats.todayScans}
          color={colors.warning}
        />
        <StatCard
          icon="users"
          label="Petugas Aktif"
          value={dashboardStats.activeOfficers}
          color={colors.primary}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          icon="dollar-sign"
          label="Total Pendapatan"
          value={formatRupiah(dashboardStats.totalRevenue)}
          color={colors.secondary}
        />
        <StatCard
          icon="trending-up"
          label="Pendapatan Hari Ini"
          value={formatRupiah(dashboardStats.todayRevenue)}
          color={colors.success}
        />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  welcome: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_400Regular" },
  userName: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  logoutText: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_700Bold" },
  sectionTitle: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", paddingHorizontal: 20, marginBottom: 14 },
  featureGrid: { paddingHorizontal: 20, gap: 12 },
  featureCard: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  featureContent: { flex: 1 },
  featureLabel: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  featureDesc: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 2 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 10 },
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
  activityName: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  activityDate: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 2 },
  activityStatus: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
