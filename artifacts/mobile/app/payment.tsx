import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function PaymentScreen() {
  const colors = useColors();
  const { addPayment } = useApp();
  const params = useLocalSearchParams<{
    officerId: string;
    officerName: string;
    rate: string;
    area: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentData, setPaymentData] = useState<{ id: string } | null>(null);

  const rate = Number(params.rate || 0);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const payment = await addPayment({
        officerId: params.officerId || "",
        officerName: params.officerName || "",
        amount: rate,
      });

      setPaymentData(payment);
      setPaymentComplete(true);
    } catch {
      Alert.alert("Error", "Pembayaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentComplete) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.centerContent}
      >
        <View
          style={[
            styles.successCard,
            { backgroundColor: colors.success + "10", borderRadius: colors.radius },
          ]}
        >
          <View style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}>
            <Feather name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.success }]}>Pembayaran Berhasil</Text>
          <Text style={[styles.successAmount, { color: colors.foreground }]}>
            Rp {rate.toLocaleString("id-ID")}
          </Text>
          <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
            Pembayaran parkir kepada {params.officerName} telah berhasil diproses
          </Text>
        </View>

        <View
          style={[styles.receiptCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
        >
          <Text style={[styles.receiptTitle, { color: colors.foreground }]}>Bukti Pembayaran</Text>
          {[
            { label: "ID Transaksi", value: paymentData?.id?.slice(0, 12) || "-" },
            { label: "Petugas", value: params.officerName },
            { label: "Area", value: params.area },
            { label: "Jumlah", value: `Rp ${rate.toLocaleString("id-ID")}` },
            { label: "Status", value: "Lunas" },
            { label: "Waktu", value: new Date().toLocaleString("id-ID") },
          ].map((item) => (
            <View key={item.label} style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
              <Text style={[styles.receiptValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              router.dismissAll();
              router.replace("/(tabs)");
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="home" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={[styles.paymentCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
      >
        <View style={[styles.qrisIcon, { backgroundColor: colors.primary + "10" }]}>
          <MaterialCommunityIcons name="qrcode" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.paymentTitle, { color: colors.foreground }]}>Pembayaran QRIS</Text>
        <Text style={[styles.paymentDesc, { color: colors.mutedForeground }]}>
          Scan QRIS atau bayar secara digital
        </Text>
      </View>

      <View
        style={[styles.detailCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
      >
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Detail Pembayaran</Text>
        {[
          { label: "Petugas", value: params.officerName || "-" },
          { label: "Area", value: params.area || "-" },
          { label: "Tarif Resmi", value: `Rp ${rate.toLocaleString("id-ID")}` },
        ].map((item) => (
          <View key={item.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
          </View>
        ))}

        <View style={[styles.totalRow, { backgroundColor: colors.primary + "08" }]}>
          <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            Rp {rate.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handlePayment}
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: loading ? 0.6 : pressed ? 0.8 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="credit-card" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Bayar Sekarang</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { paddingBottom: 40 },
  paymentCard: { margin: 20, padding: 28, alignItems: "center" },
  qrisIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  paymentTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  paymentDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailCard: { marginHorizontal: 20, padding: 20 },
  sectionLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  detailLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
  },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  successCard: { margin: 20, padding: 32, alignItems: "center" },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  successAmount: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
  successDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280 },
  receiptCard: { marginHorizontal: 20, padding: 20 },
  receiptTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  receiptLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  receiptValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  actions: { paddingHorizontal: 20, marginTop: 24 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
  },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
