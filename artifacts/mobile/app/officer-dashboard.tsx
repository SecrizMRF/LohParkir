import { Feather, MaterialCommunityIcons } from "@/components/Icon";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useRequireOfficer } from "@/hooks/useRoleGuard";
import { api, type ApiOfficerQrCode, type MyQrCodesResult } from "@/lib/api";
import { formatRupiah, hapticImpact, showAlert } from "@/lib/platform";

export default function OfficerDashboardScreen() {
  const insets = useSafeAreaInsets();
  useRequireOfficer();
  const { authToken, authUser, logout, loading: appLoading } = useApp();
  const [data, setData] = useState<MyQrCodesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApiOfficerQrCode | null>(null);
  const [cashLoading, setCashLoading] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);

  const recordCash = async (vehicleType: "motor" | "mobil") => {
    if (!authToken) return;
    setCashLoading(true);
    setShowCashModal(false);
    try {
      const result = await api.recordCashPayment(authToken, vehicleType);
      showAlert(
        "Pembayaran Tunai Tercatat",
        `${result.vehicleLabel} — ${formatRupiah(result.payment.amount)}\nNo. Transaksi: ${result.payment.transactionId}`,
      );
    } catch (err: any) {
      showAlert("Gagal", err.message || "Tidak dapat mencatat pembayaran tunai");
    } finally {
      setCashLoading(false);
    }
  };

  useEffect(() => {
    if (appLoading) return;
    if (!authToken || !authUser) {
      router.replace("/(tabs)");
      return;
    }
    if (authUser.role !== "officer") {
      router.replace("/(tabs)");
      return;
    }
    loadData();
  }, [appLoading, authToken, authUser]);

  const loadData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const result = await api.getMyQrCodes(authToken);
      setData(result);
    } catch (err: any) {
      showAlert("Gagal Memuat", err.message || "Tidak dapat memuat data QR Anda");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    showAlert("Keluar", "Yakin ingin keluar dari akun petugas?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Data tidak tersedia</Text>
        <Pressable onPress={loadData} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  const cashModal = (
    <Modal visible={showCashModal} transparent animationType="fade" onRequestClose={() => setShowCashModal(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setShowCashModal(false)}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Pilih Jenis Kendaraan</Text>
          <Text style={styles.modalDesc}>Tarif sesuai Perda Kota Medan</Text>

          <Pressable
            onPress={() => recordCash("motor")}
            style={({ pressed }) => [styles.modalOption, { borderColor: "#E65100", opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={[styles.modalIcon, { backgroundColor: "#E65100" }]}>
              <MaterialCommunityIcons name="motorbike" size={32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalOptionLabel}>Motor</Text>
              <Text style={[styles.modalOptionRate, { color: "#E65100" }]}>{formatRupiah(2000)}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#757575" />
          </Pressable>

          <Pressable
            onPress={() => recordCash("mobil")}
            style={({ pressed }) => [styles.modalOption, { borderColor: "#1B5E20", opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={[styles.modalIcon, { backgroundColor: "#1B5E20" }]}>
              <MaterialCommunityIcons name="car" size={32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalOptionLabel}>Mobil</Text>
              <Text style={[styles.modalOptionRate, { color: "#1B5E20" }]}>{formatRupiah(4000)}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#757575" />
          </Pressable>

          <Pressable onPress={() => setShowCashModal(false)} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Batal</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (selected) {
    const qrisPayload = `QRIS-LOHPARKIR|MID:DSH-MEDAN|OFC:${data.officer.badgeNumber}|VEH:${selected.vehicleType.toUpperCase()}|AMT:${selected.rate}|CUR:IDR`;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        {cashModal}
        <ScrollView
          contentContainerStyle={[
            styles.qrContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <Pressable onPress={() => setSelected(null)} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#424242" />
            <Text style={styles.backText}>Pilih Kendaraan Lain</Text>
          </Pressable>

          <View style={styles.qrCard}>
            <View style={[styles.vehicleHeader, { backgroundColor: "#1B5E20" }]}>
              <MaterialCommunityIcons
                name={selected.vehicleType === "mobil" ? "car" : "motorbike"}
                size={36}
                color="#FFF"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleHeaderLabel}>{selected.vehicleLabel}</Text>
                <Text style={styles.vehicleHeaderRate}>Bayar {formatRupiah(selected.rate)}</Text>
              </View>
            </View>

            <View style={[styles.qrBox, { borderColor: "#E8F5E9" }]}>
              <QRCode value={qrisPayload} size={240} backgroundColor="#FFF" color="#000" />
            </View>

            <View style={styles.qrisBadgeRow}>
              <View style={styles.qrisBadge}>
                <Text style={styles.qrisBadgeText}>QRIS</Text>
              </View>
              <Text style={styles.qrisMerchant}>Dishub Kota Medan</Text>
            </View>

            <View style={[styles.instructionBox, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="information" size={18} color="#1B5E20" />
              <Text style={[styles.instructionText, { color: "#1B5E20" }]}>
                Tunjukkan QRIS ini ke pengguna untuk discan dengan e-wallet / m-banking mereka.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => { hapticImpact(); setShowCashModal(true); }}
            disabled={cashLoading}
            style={({ pressed }) => [
              styles.cashPayBtn,
              { opacity: cashLoading ? 0.6 : pressed ? 0.9 : 1 },
            ]}
          >
            {cashLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="cash-multiple" size={22} color="#FFF" />
                <Text style={styles.cashPayBtnText}>USER BAYAR TUNAI</Text>
              </>
            )}
          </Pressable>
          <Text style={styles.cashPayHint}>
            Tekan jika user memilih bayar langsung tunai (tanpa scan QRIS). Pilih jenis kendaraan setelahnya.
          </Text>

          <View style={styles.officerInfoCard}>
            <Text style={styles.officerInfoLabel}>Petugas</Text>
            <Text style={styles.officerInfoName}>{data.officer.name}</Text>
            <Text style={styles.officerInfoBadge}>{data.officer.badgeNumber}</Text>
            <Text style={styles.officerInfoArea}>{data.officer.area}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
      {cashModal}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 24 : insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>Selamat datang, Petugas</Text>
            <Text style={styles.headerName}>{data.officer.name}</Text>
            <Text style={styles.headerBadge}>{data.officer.badgeNumber} · {data.officer.area}</Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={18} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Pilih Jenis Kendaraan</Text>
          <Text style={styles.sectionDesc}>
            Pilih kendaraan pengguna untuk menampilkan QRIS dengan tarif yang sesuai
          </Text>

          <View style={styles.cardGrid}>
            {data.qrCodes.map((qr) => {
              const isMobil = qr.vehicleType === "mobil";
              const accent = isMobil ? "#1B5E20" : "#E65100";
              return (
                <Pressable
                  key={qr.id}
                  onPress={() => {
                    hapticImpact();
                    setSelected(qr);
                  }}
                  style={({ pressed }) => [
                    styles.vehicleCard,
                    { borderColor: accent, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={[styles.vehicleIcon, { backgroundColor: accent }]}>
                    <MaterialCommunityIcons
                      name={isMobil ? "car" : "motorbike"}
                      size={48}
                      color="#FFF"
                    />
                  </View>
                  <Text style={styles.vehicleCardLabel}>{qr.vehicleLabel}</Text>
                  <Text style={[styles.vehicleCardRate, { color: accent }]}>
                    {formatRupiah(qr.rate)}
                  </Text>
                  <View style={styles.tapHint}>
                    <Text style={styles.tapHintText}>Ketuk untuk tampilkan QRIS</Text>
                    <Feather name="chevron-right" size={16} color="#757575" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: { alignItems: "center", justifyContent: "center" },
  scrollContent: { flexGrow: 1 },

  header: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInfo: { flex: 1 },
  headerLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular" },
  headerName: { color: "#FFF", fontSize: 22, fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 2 },
  headerBadge: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 4 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },

  body: { padding: 24 },
  sectionTitle: { fontSize: 20, fontFamily: "AtkinsonHyperlegible_700Bold", color: "#212121" },
  sectionDesc: { fontSize: 13, color: "#616161", fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 4, marginBottom: 20 },

  cardGrid: { gap: 14 },
  vehicleCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    }),
  },
  vehicleIcon: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  vehicleCardLabel: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", color: "#212121" },
  vehicleCardRate: { fontSize: 22, fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 6 },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12 },
  tapHintText: { fontSize: 12, color: "#757575", fontFamily: "AtkinsonHyperlegible_400Regular" },

  qrContent: { padding: 24, alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 16 },
  backText: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular", color: "#424242" },

  qrCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
    }),
  },
  vehicleHeader: {
    width: "100%",
    backgroundColor: "#1565C0",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  vehicleHeaderLabel: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  vehicleHeaderRate: { color: "rgba(255,255,255,0.95)", fontSize: 22, fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 2 },

  qrBox: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#E3F2FD",
  },

  qrisBadgeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  qrisBadge: {
    backgroundColor: "#D32F2F", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4,
  },
  qrisBadgeText: { color: "#FFF", fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold", letterSpacing: 0.5 },
  qrisMerchant: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold", color: "#212121" },

  cashPayBtn: {
    width: "100%", height: 56, borderRadius: 12, backgroundColor: "#E65100",
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, marginTop: 18,
  },
  cashPayBtnText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", letterSpacing: 0.5 },
  cashPayHint: {
    fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", color: "#757575",
    textAlign: "center", marginTop: 8, lineHeight: 17,
  },
  instructionBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E3F2FD", borderRadius: 10, padding: 12, marginTop: 20,
  },
  instructionText: { flex: 1, fontSize: 12, color: "#0D47A1", fontFamily: "AtkinsonHyperlegible_400Regular", lineHeight: 17 },

  officerInfoCard: {
    width: "100%", backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginTop: 16,
  },
  officerInfoLabel: { fontSize: 11, color: "#757575", fontFamily: "AtkinsonHyperlegible_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  officerInfoName: { fontSize: 16, color: "#212121", fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 4 },
  officerInfoBadge: { fontSize: 13, color: "#1565C0", fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 2 },
  officerInfoArea: { fontSize: 12, color: "#616161", fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 4 },

  errorText: { fontSize: 14, color: "#B71C1C", fontFamily: "AtkinsonHyperlegible_400Regular", marginBottom: 16 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#1565C0", borderRadius: 10 },
  retryBtnText: { color: "#FFF", fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold" },

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFF", borderRadius: 20, padding: 24,
    width: "100%", maxWidth: 420, gap: 12,
  },
  modalTitle: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", color: "#212121", textAlign: "center" },
  modalDesc: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", color: "#757575", textAlign: "center", marginBottom: 8 },
  modalOption: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 14,
    borderRadius: 14, borderWidth: 2, backgroundColor: "#FFF",
  },
  modalIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  modalOptionLabel: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", color: "#212121" },
  modalOptionRate: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 2 },
  modalCancel: { paddingVertical: 14, alignItems: "center" },
  modalCancelText: { color: "#757575", fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
