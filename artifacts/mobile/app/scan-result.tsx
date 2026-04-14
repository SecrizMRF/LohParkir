import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ScanResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    valid: string;
    officerName?: string;
    badgeNumber?: string;
    area?: string;
    location?: string;
    rate?: string;
    officerId?: string;
    qrCode?: string;
    message?: string;
  }>();

  const isValid = params.valid === "true";

  return (
    <View style={[styles.container, { backgroundColor: isValid ? "#059669" : "#DC2626" }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 + 20 : insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSection}>
          <View style={[styles.statusIconCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <View style={[styles.statusIconInner, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
              <MaterialCommunityIcons
                name={isValid ? "shield-check" : "shield-alert"}
                size={56}
                color="#FFF"
              />
            </View>
          </View>
          <Text style={styles.statusTitle}>
            {isValid ? "PETUGAS RESMI" : "JUKIR TIDAK TERDAFTAR"}
          </Text>
          <Text style={styles.statusDesc}>
            {isValid
              ? "QR Code ini terdaftar di database Dishub Kota Medan"
              : params.message || "QR Code ini tidak ditemukan dalam database resmi. Hati-hati penipuan!"}
          </Text>
        </View>

        {isValid && (
          <View style={[styles.detailCard, { borderRadius: colors.radius }]}>
            <View style={styles.officerHeader}>
              <View style={styles.avatarCircle}>
                <Feather name="user" size={28} color="#059669" />
              </View>
              <View style={styles.officerMainInfo}>
                <Text style={styles.officerName}>{params.officerName}</Text>
                <Text style={styles.officerBadge}>Badge: {params.badgeNumber}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={12} color="#FFF" />
                <Text style={styles.verifiedText}>Resmi</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              {[
                { icon: "map-pin" as const, label: "Zona Parkir", value: params.area },
                { icon: "navigation" as const, label: "Lokasi", value: params.location },
                {
                  icon: "tag" as const,
                  label: "Tarif Resmi",
                  value: `Rp ${Number(params.rate || 0).toLocaleString("id-ID")}/jam`,
                },
              ].map((item) => (
                <View key={item.label} style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Feather name={item.icon} size={16} color="#059669" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {!isValid && (
          <View style={[styles.warningCard, { borderRadius: colors.radius }]}>
            <Feather name="alert-triangle" size={24} color="#DC2626" />
            <Text style={styles.warningTitle}>Peringatan Keamanan</Text>
            <Text style={styles.warningDesc}>
              Jangan membayar kepada jukir ini. Segera laporkan agar dapat ditindaklanjuti oleh Dishub Kota Medan.
            </Text>
            {params.qrCode && (
              <View style={styles.qrCodeBadge}>
                <Text style={styles.qrCodeLabel}>Kode QR:</Text>
                <Text style={styles.qrCodeValue}>{params.qrCode}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          {isValid ? (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: "/payment",
                  params: {
                    officerId: params.officerId,
                    officerName: params.officerName,
                    rate: params.rate,
                    area: params.area,
                    location: params.location,
                    badgeNumber: params.badgeNumber,
                  },
                });
              }}
              style={({ pressed }) => [
                styles.payButton,
                { borderRadius: colors.radius, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <MaterialCommunityIcons name="qrcode" size={22} color="#059669" />
              <Text style={styles.payButtonText}>Bayar Parkir</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: "/report-form",
                  params: { prefillType: "fake_qr", qrCode: params.qrCode },
                });
              }}
              style={({ pressed }) => [
                styles.reportButton,
                { borderRadius: colors.radius, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Feather name="alert-triangle" size={20} color="#DC2626" />
              <Text style={styles.reportButtonText}>Laporkan Sekarang</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={20} color="#FFF" />
            <Text style={styles.backButtonText}>Scan Ulang</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  statusSection: { alignItems: "center", paddingHorizontal: 32, paddingTop: 20, paddingBottom: 24 },
  statusIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  statusIconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 1,
  },
  statusDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 22,
  },
  detailCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 16,
  },
  officerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#05966910",
    alignItems: "center",
    justifyContent: "center",
  },
  officerMainInfo: { flex: 1 },
  officerName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#111" },
  officerBadge: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFF" },
  infoGrid: { gap: 0 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#05966910",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9CA3AF", marginBottom: 2 },
  infoValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#111" },
  warningCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#DC2626",
    marginTop: 12,
    marginBottom: 8,
  },
  warningDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  qrCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  qrCodeLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#DC2626" },
  qrCodeValue: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
  actions: { paddingHorizontal: 20, gap: 12, marginTop: 8 },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    backgroundColor: "#FFF",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payButtonText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#059669" },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    backgroundColor: "#FFF",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportButtonText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#DC2626" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: "rgba(255,255,255,0.15)",
    gap: 8,
  },
  backButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFF" },
});
