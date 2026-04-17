import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hapticImpact } from "@/lib/platform";

export default function ScanResultScreen() {
  const insets = useSafeAreaInsets();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
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
    vehicleType?: string;
    vehicleLabel?: string;
  }>();

  const isValid = params.valid === "true";

  if (!isValid) {
    return (
      <View style={[styles.container, { backgroundColor: "#B71C1C" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === "web" ? 67 + 32 : insets.top + 32, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="alert" size={80} color="#FFF" />
          </View>
          <Text style={styles.dangerTitle}>JUKIR TIDAK TERDAFTAR</Text>
          <Text style={styles.dangerSub}>Jangan berikan uang tunai.</Text>
          {params.qrCode && (
            <Text style={styles.qrCodeDisplay}>Kode: {params.qrCode}</Text>
          )}
          <Pressable
            onPress={() => {
              hapticImpact();
              router.push({
                pathname: "/report-form",
                params: { prefillType: "fake_qr", qrCode: params.qrCode },
              });
            }}
            style={({ pressed }) => [styles.reportBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.reportBtnText}>LAPORKAN SEKARANG</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.ghostBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.ghostBtnText}>Kembali</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.verifiedBadge}>
          <MaterialCommunityIcons name="check-decagram" size={28} color="#FFF" />
          <Text style={styles.verifiedText}>PETUGAS TERVERIFIKASI</Text>
        </View>

        <View style={styles.idCard}>
          <View style={styles.photoContainer}>
            <View style={styles.photo}>
              <Feather name="user" size={56} color="#757575" />
            </View>
          </View>

          <Text style={styles.officerName}>{params.officerName}</Text>

          <View style={styles.idBadge}>
            <Text style={styles.idBadgeLabel}>ID Petugas</Text>
            <Text style={styles.idBadgeValue}>{params.badgeNumber}</Text>
          </View>

          {params.vehicleType ? (
            <View style={styles.vehicleBadge}>
              <MaterialCommunityIcons
                name={params.vehicleType === "mobil" ? "car" : "motorbike"}
                size={22}
                color="#FFF"
              />
              <Text style={styles.vehicleBadgeText}>{params.vehicleLabel || params.vehicleType}</Text>
            </View>
          ) : null}

          <View style={styles.separator} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#1565C0" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Zona Tugas</Text>
                <Text style={styles.detailValue}>{params.area}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="road-variant" size={20} color="#1565C0" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Lokasi</Text>
                <Text style={styles.detailValue}>{params.location}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash" size={20} color="#1565C0" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tarif Resmi</Text>
                <Text style={styles.detailValue}>Rp 2.000 / Rp 4.000</Text>
                <Text style={styles.detailHint}>Motor Rp 2.000 • Mobil Rp 4.000</Text>
              </View>
            </View>
          </View>
        </View>

        {!showPaymentOptions ? (
          <Pressable
            onPress={() => {
              hapticImpact();
              setShowPaymentOptions(true);
            }}
            style={({ pressed }) => [styles.payBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <MaterialCommunityIcons name="wallet" size={24} color="#FFF" />
            <Text style={styles.payBtnText}>BAYAR PARKIR</Text>
          </Pressable>
        ) : (
          <View style={styles.paymentOptions}>
            <Text style={styles.paymentOptionsTitle}>Pilih Metode Pembayaran</Text>

            <Pressable
              onPress={() => {
                hapticImpact();
                router.push({
                  pathname: "/payment",
                  params: {
                    officerId: params.officerId,
                    officerName: params.officerName,
                    rate: params.rate,
                    area: params.area,
                    location: params.location,
                    badgeNumber: params.badgeNumber,
                    method: "qris",
                  },
                });
              }}
              style={({ pressed }) => [styles.methodBtn, styles.qrisBtn, { opacity: pressed ? 0.9 : 1 }]}
            >
              <View style={styles.methodIcon}>
                <MaterialCommunityIcons name="qrcode-scan" size={32} color="#1565C0" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>QRIS</Text>
                <Text style={styles.methodDesc}>Bayar dengan scan QR dari e-wallet atau mobile banking</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#757575" />
            </Pressable>

            <Pressable
              onPress={() => {
                hapticImpact();
                router.push({
                  pathname: "/payment",
                  params: {
                    officerId: params.officerId,
                    officerName: params.officerName,
                    rate: params.rate,
                    area: params.area,
                    location: params.location,
                    badgeNumber: params.badgeNumber,
                    method: "cash",
                  },
                });
              }}
              style={({ pressed }) => [styles.methodBtn, styles.cashBtn, { opacity: pressed ? 0.9 : 1 }]}
            >
              <View style={[styles.methodIcon, { backgroundColor: "#E8F5E9" }]}>
                <MaterialCommunityIcons name="cash" size={32} color="#1B5E20" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Tunai</Text>
                <Text style={styles.methodDesc}>
                  Bayar langsung ke petugas dengan uang tunai. Petugas akan menandai pembayaran Anda sebagai lunas dari aplikasi LohParkir mereka.
                </Text>
                <View style={styles.cashRateBox}>
                  <View style={styles.cashRateRow}>
                    <MaterialCommunityIcons name="motorbike" size={16} color="#1B5E20" />
                    <Text style={styles.cashRateText}>Sepeda Motor: Rp 2.000</Text>
                  </View>
                  <View style={styles.cashRateRow}>
                    <MaterialCommunityIcons name="car" size={16} color="#1B5E20" />
                    <Text style={styles.cashRateText}>Mobil: Rp 4.000</Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={24} color="#757575" />
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => {
            if (showPaymentOptions) {
              setShowPaymentOptions(false);
            } else {
              router.back();
            }
          }}
          style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.backLinkText}>Kembali</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24 },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 24,
  },
  verifiedText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    letterSpacing: 0.5,
  },

  idCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 3 },
      web: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
    }),
  },
  photoContainer: { marginBottom: 16 },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    borderWidth: 3,
    borderColor: "#1B5E20",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  officerName: {
    fontSize: 24,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    textAlign: "center",
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  idBadgeLabel: {
    fontSize: 12,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginBottom: 2,
  },
  idBadgeValue: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1565C0",
    letterSpacing: 1,
  },
  vehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1565C0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  vehicleBadgeText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    letterSpacing: 0.3,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  detailsGrid: { width: "100%", gap: 14 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailContent: { flex: 1 },
  detailLabel: {
    fontSize: 13,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  detailHint: {
    fontSize: 12,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginTop: 2,
  },

  payBtn: {
    width: "100%",
    height: 64,
    borderRadius: 12,
    backgroundColor: "#1565C0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: "#1565C0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { shadowColor: "#1565C0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    }),
  },
  payBtnText: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    letterSpacing: 0.5,
  },

  paymentOptions: { width: "100%", gap: 12 },
  paymentOptionsTitle: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    marginBottom: 4,
  },
  methodBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  qrisBtn: { borderColor: "#1565C0" },
  cashBtn: { borderColor: "#1B5E20" },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: { flex: 1 },
  methodTitle: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  methodDesc: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginTop: 2,
  },
  cashRateBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    gap: 6,
  },
  cashRateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cashRateText: {
    fontSize: 13,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1B5E20",
  },

  backLink: { paddingVertical: 16, marginTop: 8 },
  backLinkText: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textDecorationLine: "underline",
  },

  iconWrap: { marginBottom: 24 },
  dangerTitle: {
    fontSize: 26,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 12,
  },
  dangerSub: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 16,
  },
  qrCodeDisplay: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 8,
  },
  reportBtn: {
    width: "100%",
    height: 72,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginTop: 32,
  },
  reportBtnText: {
    color: "#B71C1C",
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },
  ghostBtn: { paddingVertical: 16, marginTop: 12 },
  ghostBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textDecorationLine: "underline",
  },
});
