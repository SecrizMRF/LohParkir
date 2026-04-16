import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { StatCard } from "@/components/StatCard";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { hapticImpact, showAlert } from "@/lib/platform";

export default function AdminScreen() {
  const colors = useColors();
  const { dashboardStats, userRole, setUserRole, officers, scanHistory, authToken, authUser, login, logout, refreshData, loading } = useApp();

  const isAdmin = userRole === "admin";
  const isLoggedIn = !!authToken;

  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAlert("Error", "Username dan password wajib diisi");
      return;
    }
    setLoginLoading(true);
    try {
      await login(username.trim(), password.trim());
      setShowLogin(false);
      setUsername("");
      setPassword("");
      showAlert("Berhasil", "Login berhasil sebagai Admin Dishub");
    } catch (err: any) {
      showAlert("Login Gagal", err.message || "Username atau password salah");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    showAlert("Logout", "Yakin ingin keluar dari mode admin?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          showAlert("Berhasil", "Anda telah keluar dari mode admin");
        },
      },
    ]);
  };

  if (showLogin) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: Platform.OS === "web" ? 67 + 16 : 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => setShowLogin(false)}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>Kembali</Text>
        </Pressable>

        <View style={[styles.loginCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={[styles.loginIcon, { backgroundColor: colors.primary + "10" }]}>
            <Feather name="shield" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.loginTitle, { color: colors.foreground }]}>Login Admin Dishub</Text>
          <Text style={[styles.loginDesc, { color: colors.mutedForeground }]}>
            Masuk untuk mengelola petugas dan laporan
          </Text>

          <View style={styles.loginFields}>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="user" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.loginInput, { color: colors.foreground }]}
                placeholder="Username"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="lock" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.loginInput, { color: colors.foreground }]}
                placeholder="Password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loginLoading}
            style={({ pressed }) => [
              styles.loginBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: loginLoading ? 0.6 : pressed ? 0.8 : 1 },
            ]}
          >
            {loginLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Feather name="log-in" size={18} color="#FFF" />
                <Text style={styles.loginBtnText}>Masuk</Text>
              </>
            )}
          </Pressable>

          <View style={[styles.credHint, { backgroundColor: colors.primary + "08", borderRadius: colors.radius }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.credHintText, { color: colors.primary }]}>
              Demo: admin / admin123
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

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
        {isLoggedIn && authUser && (
          <View style={styles.userInfo}>
            <Feather name="user" size={14} color={colors.primary} />
            <Text style={[styles.userName, { color: colors.primary }]}>{authUser.fullName}</Text>
          </View>
        )}
        <View style={styles.roleActions}>
          {isAdmin && isLoggedIn ? (
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.roleButton,
                { backgroundColor: colors.destructive, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="log-out" size={14} color="#FFF" />
              <Text style={[styles.roleButtonText, { color: "#FFF" }]}>Logout</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowLogin(true)}
              style={({ pressed }) => [
                styles.roleButton,
                { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="shield" size={14} color="#FFF" />
              <Text style={[styles.roleButtonText, { color: "#FFF" }]}>Login Admin</Text>
            </Pressable>
          )}
        </View>
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

      {dashboardStats.todayScans > 0 && (
        <View style={styles.statsRow}>
          <StatCard
            icon="sunrise"
            label="Scan Hari Ini"
            value={dashboardStats.todayScans}
            color={colors.warning}
          />
          <StatCard
            icon="trending-up"
            label="Revenue Hari Ini"
            value={`Rp ${dashboardStats.todayRevenue.toLocaleString("id-ID")}`}
            color={colors.success}
          />
        </View>
      )}

      {isAdmin && isLoggedIn && (
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
                  hapticImpact();
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
                <View style={styles.menuContent}>
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  userName: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
  roleActions: { flexDirection: "row", gap: 8 },
  roleButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  roleButtonText: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
  sectionTitle: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", paddingHorizontal: 20, marginBottom: 14 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 10 },
  menuGrid: { paddingHorizontal: 20, gap: 10 },
  menuCard: { padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  menuDesc: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 2 },
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

  backBtn: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 20, padding: 12, gap: 8, alignSelf: "flex-start" },
  backText: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  loginCard: { marginHorizontal: 20, padding: 28, alignItems: "center" },
  loginIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginTitle: { fontSize: 20, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 6 },
  loginDesc: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular", textAlign: "center", marginBottom: 24 },
  loginFields: { width: "100%", gap: 12 },
  inputWrap: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 14, borderWidth: 1, gap: 10 },
  loginInput: { flex: 1, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", height: 56, gap: 10, marginTop: 16 },
  loginBtnText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  credHint: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginTop: 16, width: "100%" },
  credHintText: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular" },
});
