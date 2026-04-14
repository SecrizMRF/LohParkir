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
  TextInput,
  View,
} from "react-native";

import { useApp, type Payment } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const DURATION_OPTIONS = [
  { hours: 1, label: "1 Jam" },
  { hours: 2, label: "2 Jam" },
  { hours: 3, label: "3 Jam" },
  { hours: 5, label: "5 Jam" },
];

export default function PaymentScreen() {
  const colors = useColors();
  const { addPayment, addPoints } = useApp();
  const params = useLocalSearchParams<{
    officerId: string;
    officerName: string;
    rate: string;
    area: string;
    location: string;
    badgeNumber: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentData, setPaymentData] = useState<Payment | null>(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const ratePerHour = Number(params.rate || 0);
  const totalAmount = ratePerHour * selectedDuration;

  const handlePayment = async () => {
    if (!plateNumber.trim()) {
      Alert.alert("Error", "Nomor plat kendaraan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const payment = await addPayment({
        officerId: params.officerId ? Number(params.officerId) : null,
        officerName: params.officerName || "",
        amount: totalAmount,
        method: "qris",
        area: params.area || "",
        plateNumber: plateNumber.trim().toUpperCase(),
        duration: selectedDuration,
      });

      const pts = Math.floor(totalAmount / 1000);
      addPoints(pts);
      setEarnedPoints(pts);

      setPaymentData(payment);
      setPaymentComplete(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Pembayaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentComplete && paymentData) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: "#059669" }]}
        contentContainerStyle={styles.receiptContent}
      >
        <View style={styles.receiptHeader}>
          <View style={styles.successCircle}>
            <Feather name="check" size={40} color="#059669" />
          </View>
          <Text style={styles.receiptSuccessTitle}>Pembayaran Berhasil!</Text>
          <Text style={styles.receiptSuccessAmount}>
            Rp {totalAmount.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={[styles.karcisCard, { borderRadius: colors.radius }]}>
          <View style={styles.karcisHeader}>
            <MaterialCommunityIcons name="parking" size={24} color="#059669" />
            <Text style={styles.karcisTitle}>Karcis Digital Parkir</Text>
          </View>

          <View style={styles.karcisDivider} />

          {[
            { label: "No. Transaksi", value: paymentData.transactionId },
            { label: "Plat Nomor", value: plateNumber.toUpperCase() },
            { label: "Petugas", value: params.officerName },
            { label: "Badge", value: params.badgeNumber || "-" },
            { label: "Zona Parkir", value: params.area || "-" },
            { label: "Durasi", value: `${selectedDuration} Jam` },
            { label: "Tarif/Jam", value: `Rp ${ratePerHour.toLocaleString("id-ID")}` },
            { label: "Total Bayar", value: `Rp ${totalAmount.toLocaleString("id-ID")}` },
            { label: "Metode", value: "QRIS" },
            { label: "Status", value: "LUNAS" },
            { label: "Waktu", value: new Date(paymentData.createdAt).toLocaleString("id-ID") },
          ].map((item) => (
            <View key={item.label} style={styles.karcisRow}>
              <Text style={styles.karcisLabel}>{item.label}</Text>
              <Text style={[
                styles.karcisValue,
                item.label === "Status" && { color: "#059669", fontFamily: "Inter_700Bold" },
                item.label === "Total Bayar" && { color: "#059669", fontFamily: "Inter_700Bold" },
              ]}>{item.value}</Text>
            </View>
          ))}

          <View style={styles.karcisDivider} />

          <View style={styles.pointsEarned}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#F59E0B" />
            <Text style={styles.pointsEarnedText}>
              +{earnedPoints} Poin Parkir diperoleh!
            </Text>
          </View>
        </View>

        <View style={styles.receiptActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({
                pathname: "/rating",
                params: {
                  officerId: params.officerId,
                  officerName: params.officerName,
                  area: params.area,
                  transactionId: paymentData.transactionId,
                },
              });
            }}
            style={({ pressed }) => [
              styles.rateButton,
              { borderRadius: colors.radius, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Feather name="star" size={20} color="#F59E0B" />
            <Text style={styles.rateButtonText}>Beri Rating Jukir</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              router.dismissAll();
              router.replace("/(tabs)");
            }}
            style={({ pressed }) => [
              styles.homeButton,
              { borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="home" size={20} color="#FFF" />
            <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.headerCard, { backgroundColor: colors.primary + "10", borderRadius: colors.radius }]}>
        <View style={[styles.qrisIcon, { backgroundColor: colors.primary + "15" }]}>
          <MaterialCommunityIcons name="qrcode" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Pembayaran QRIS</Text>
        <Text style={[styles.headerDesc, { color: colors.mutedForeground }]}>
          Bayar parkir resmi langsung ke kas daerah via QRIS
        </Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Nomor Plat Kendaraan</Text>
        <TextInput
          style={[
            styles.plateInput,
            {
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: plateNumber.trim() ? colors.primary : colors.border,
              borderRadius: colors.radius,
            },
          ]}
          placeholder="Contoh: BK 1234 AB"
          placeholderTextColor={colors.mutedForeground}
          value={plateNumber}
          onChangeText={setPlateNumber}
          autoCapitalize="characters"
        />
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Durasi Parkir</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((opt) => (
            <Pressable
              key={opt.hours}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDuration(opt.hours);
              }}
              style={({ pressed }) => [
                styles.durationOption,
                {
                  backgroundColor: selectedDuration === opt.hours ? colors.primary + "15" : colors.background,
                  borderColor: selectedDuration === opt.hours ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[
                styles.durationLabel,
                { color: selectedDuration === opt.hours ? colors.primary : colors.mutedForeground },
              ]}>
                {opt.label}
              </Text>
              <Text style={[
                styles.durationPrice,
                { color: selectedDuration === opt.hours ? colors.primary : colors.foreground },
              ]}>
                Rp {(ratePerHour * opt.hours).toLocaleString("id-ID")}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Detail Pembayaran</Text>
        {[
          { label: "Petugas", value: params.officerName || "-" },
          { label: "Zona", value: params.area || "-" },
          { label: "Tarif/Jam", value: `Rp ${ratePerHour.toLocaleString("id-ID")}` },
          { label: "Durasi", value: `${selectedDuration} Jam` },
        ].map((item) => (
          <View key={item.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
          </View>
        ))}

        <View style={[styles.totalRow, { backgroundColor: colors.primary + "08", borderRadius: colors.radius }]}>
          <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Bayar</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            Rp {totalAmount.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={[styles.pointsPreview, { backgroundColor: "#FEF3C7", borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="star-circle" size={18} color="#F59E0B" />
          <Text style={styles.pointsPreviewText}>
            Anda akan mendapat +{Math.floor(totalAmount / 1000)} Poin Parkir
          </Text>
        </View>
      </View>

      <View style={styles.submitContainer}>
        <Pressable
          onPress={handlePayment}
          disabled={loading}
          style={({ pressed }) => [
            styles.payButton,
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
              <MaterialCommunityIcons name="qrcode" size={22} color="#FFF" />
              <Text style={styles.payButtonText}>Bayar Sekarang via QRIS</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  receiptContent: { paddingBottom: 40 },
  headerCard: { margin: 20, padding: 28, alignItems: "center" },
  qrisIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  headerDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  formCard: { marginHorizontal: 20, padding: 20, marginBottom: 12 },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  plateInput: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    borderWidth: 2,
    textAlign: "center",
    letterSpacing: 2,
  },
  durationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  durationOption: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  durationLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  durationPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  detailLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 16,
  },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  pointsPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  pointsPreviewText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#92400E" },
  submitContainer: { paddingHorizontal: 20, marginTop: 12 },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 10,
  },
  payButtonText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  receiptHeader: { alignItems: "center", paddingTop: 60, paddingBottom: 24 },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  receiptSuccessTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFF", marginBottom: 8 },
  receiptSuccessAmount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFF" },
  karcisCard: { backgroundColor: "#FFF", marginHorizontal: 20, padding: 20, marginBottom: 16 },
  karcisHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  karcisTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#111" },
  karcisDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12, borderStyle: "dashed" },
  karcisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  karcisLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280" },
  karcisValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#111", maxWidth: "55%", textAlign: "right" },
  pointsEarned: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  pointsEarnedText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#92400E" },
  receiptActions: { paddingHorizontal: 20, gap: 12 },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: "#FFF",
    gap: 10,
  },
  rateButtonText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#92400E" },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    gap: 8,
  },
  homeButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFF" },
});
