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
  }>();

  const isValid = params.valid === "true";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: isValid ? colors.success + "10" : colors.destructive + "10",
            borderRadius: colors.radius,
          },
        ]}
      >
        <View
          style={[
            styles.statusIcon,
            { backgroundColor: isValid ? colors.success + "20" : colors.destructive + "20" },
          ]}
        >
          <MaterialCommunityIcons
            name={isValid ? "shield-check" : "shield-alert"}
            size={48}
            color={isValid ? colors.success : colors.destructive}
          />
        </View>
        <Text
          style={[
            styles.statusTitle,
            { color: isValid ? colors.success : colors.destructive },
          ]}
        >
          {isValid ? "Petugas Resmi" : "QR Tidak Valid"}
        </Text>
        <Text
          style={[
            styles.statusDesc,
            { color: isValid ? colors.success : colors.destructive },
          ]}
        >
          {isValid
            ? "QR Code ini terdaftar di database Dishub"
            : "QR Code ini tidak ditemukan dalam database resmi"}
        </Text>
      </View>

      {isValid && (
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.detailTitle, { color: colors.foreground }]}>Detail Petugas</Text>

          {[
            { icon: "user" as const, label: "Nama Petugas", value: params.officerName },
            { icon: "credit-card" as const, label: "Nomor Badge", value: params.badgeNumber },
            { icon: "map-pin" as const, label: "Area Kerja", value: params.area },
            { icon: "navigation" as const, label: "Lokasi", value: params.location },
            {
              icon: "tag" as const,
              label: "Tarif Resmi",
              value: `Rp ${Number(params.rate || 0).toLocaleString("id-ID")}`,
            },
          ].map((item) => (
            <View key={item.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primary + "10" }]}>
                <Feather name={item.icon} size={16} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                  {item.label}
                </Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            </View>
          ))}
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
                },
              });
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="credit-card" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Bayar Digital</Text>
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
              styles.primaryButton,
              { backgroundColor: colors.destructive, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="alert-triangle" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Laporkan QR Palsu</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: colors.muted, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
          <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>Kembali</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusCard: { margin: 20, padding: 32, alignItems: "center" },
  statusIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  statusDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280 },
  detailCard: { marginHorizontal: 20, padding: 20, marginBottom: 20 },
  detailTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  detailValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  actions: { paddingHorizontal: 20, gap: 12 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
  },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
  },
  secondaryButtonText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
