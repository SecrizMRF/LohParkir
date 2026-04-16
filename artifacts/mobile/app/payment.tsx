import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type Payment } from "@/contexts/AppContext";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const { addPayment, addPoints } = useApp();
  const params = useLocalSearchParams<{
    officerId: string;
    officerName: string;
    rate: string;
    area: string;
    location: string;
    badgeNumber: string;
    method: string;
  }>();

  const isCash = params.method === "cash";
  const rate = Number(params.rate || 0);

  const [step, setStep] = useState<"qris" | "waiting" | "success" | "cash_confirm">(isCash ? "cash_confirm" : "qris");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<Payment | null>(null);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processPayment = async (method: string) => {
    setLoading(true);
    try {
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

      const payment = await addPayment({
        officerId: params.officerId ? Number(params.officerId) : null,
        officerName: params.officerName || "",
        amount: rate,
        method,
        area: params.area || "",
        plateNumber: "-",
        duration: 1,
      });

      const pts = Math.floor(rate / 1000);
      addPoints(pts);
      setPaymentData(payment);
      setStep("success");
    } catch (err: any) {
      if (Platform.OS === "web") {
        window.alert(err.message || "Pembayaran gagal.");
      } else {
        Alert.alert("Error", err.message || "Pembayaran gagal.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startPaymentDetection = () => {
    setStep("waiting");
    setCountdown(5);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          processPayment("qris");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (step === "success" && paymentData) {
    return (
      <View style={[styles.container, { backgroundColor: "#1B5E20" }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === "web" ? 67 + 48 : insets.top + 48, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={96} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
          <Text style={styles.successAmount}>Rp {rate.toLocaleString("id-ID")}</Text>

          <View style={styles.receiptCard}>
            {[
              { label: "No. Transaksi", value: paymentData.transactionId },
              { label: "Petugas", value: params.officerName },
              { label: "Zona", value: params.area || "-" },
              { label: "Metode", value: isCash ? "Tunai" : "QRIS" },
              { label: "Waktu", value: new Date(paymentData.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric" }) },
            ].map((item) => (
              <View key={item.label} style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>{item.label}</Text>
                <Text style={styles.receiptValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pointsBanner}>
            <MaterialCommunityIcons name="star" size={24} color="#FBC02D" />
            <Text style={styles.pointsText}>+{Math.floor(rate / 1000)} Poin ditambahkan!</Text>
          </View>

          <Pressable
            onPress={() => {
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
            style={({ pressed }) => [styles.primaryBtn, { backgroundColor: "#FFF", opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={[styles.primaryBtnText, { color: "#1B5E20" }]}>BERI RATING PETUGAS</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [styles.ghostBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.ghostBtnText}>Kembali ke Beranda</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === "waiting") {
    return (
      <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === "web" ? 67 + 48 : insets.top + 48, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ActivityIndicator size="large" color="#1565C0" style={{ marginBottom: 24 }} />
          <Text style={styles.waitingTitle}>Menunggu Pembayaran...</Text>
          <Text style={styles.waitingDesc}>
            Silakan selesaikan pembayaran di aplikasi e-wallet atau mobile banking Anda
          </Text>

          <View style={styles.waitingAmountCard}>
            <Text style={styles.waitingAmountLabel}>Total Pembayaran</Text>
            <Text style={styles.waitingAmount}>Rp {rate.toLocaleString("id-ID")}</Text>
          </View>

          <View style={styles.detectingCard}>
            <MaterialCommunityIcons name="radar" size={28} color="#1565C0" />
            <Text style={styles.detectingText}>
              Mendeteksi pembayaran otomatis...{"\n"}
              Konfirmasi dalam {countdown} detik
            </Text>
          </View>

          <Pressable
            onPress={() => {
              if (countdownRef.current) clearInterval(countdownRef.current);
              processPayment("qris");
            }}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: "#1B5E20", opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>SAYA SUDAH BAYAR</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (countdownRef.current) clearInterval(countdownRef.current);
              setStep("qris");
            }}
            style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.backLinkText}>Kembali</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === "cash_confirm") {
    return (
      <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cashIcon}>
            <MaterialCommunityIcons name="cash-multiple" size={64} color="#1B5E20" />
          </View>
          <Text style={styles.stepTitle}>Pembayaran Tunai</Text>

          <View style={styles.cashCard}>
            <Text style={styles.cashCardLabel}>Bayar ke petugas sebesar:</Text>
            <Text style={styles.cashCardAmount}>Rp {rate.toLocaleString("id-ID")}</Text>
            <View style={styles.cashCardDivider} />
            <View style={styles.cashCardInfo}>
              <Text style={styles.cashCardInfoText}>Petugas: {params.officerName}</Text>
              <Text style={styles.cashCardInfoText}>Zona: {params.area}</Text>
            </View>
          </View>

          <View style={styles.warningCard}>
            <MaterialCommunityIcons name="information" size={20} color="#E65100" />
            <Text style={styles.warningText}>
              Pastikan tarif sesuai dengan yang tertera. Jangan bayar lebih dari tarif resmi.
            </Text>
          </View>

          <Pressable
            onPress={() => processPayment("cash")}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: "#1B5E20", opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>SUDAH BAYAR TUNAI</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.backLinkText}>Kembali</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Pembayaran QRIS</Text>

        <View style={styles.qrisCard}>
          <View style={styles.qrisHeader}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#1565C0" />
            <Text style={styles.qrisHeaderText}>Scan untuk Bayar</Text>
          </View>

          <View style={styles.qrisQrWrap}>
            <MaterialCommunityIcons name="qrcode" size={240} color="#000" />
          </View>

          <View style={styles.qrisAmount}>
            <Text style={styles.qrisAmountLabel}>Total Pembayaran</Text>
            <Text style={styles.qrisAmountValue}>Rp {rate.toLocaleString("id-ID")}</Text>
          </View>

          <Text style={styles.qrisInstruction}>
            Buka aplikasi e-wallet atau mobile banking Anda,{"\n"}lalu scan kode QR di atas
          </Text>
        </View>

        <View style={styles.merchantInfo}>
          <Text style={styles.merchantLabel}>Merchant: Dishub Kota Medan - Parkir</Text>
          <Text style={styles.merchantLabel}>Petugas: {params.officerName}</Text>
        </View>

        <Pressable
          onPress={() => {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
            startPaymentDetection();
          }}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: "#1565C0", opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.primaryBtnText}>SUDAH SCAN & BAYAR</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
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
  scrollContent: { alignItems: "center", paddingHorizontal: 24 },

  stepTitle: {
    fontSize: 26,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    textAlign: "center",
    marginBottom: 24,
  },

  qrisCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  qrisHeaderText: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1565C0",
  },
  qrisQrWrap: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },
  qrisAmount: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrisAmountLabel: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginBottom: 4,
  },
  qrisAmountValue: {
    fontSize: 32,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  qrisInstruction: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
    lineHeight: 22,
  },

  merchantInfo: {
    width: "100%",
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    gap: 4,
  },
  merchantLabel: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#424242",
  },

  primaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },

  backLink: { paddingVertical: 12 },
  backLinkText: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textDecorationLine: "underline",
  },

  waitingTitle: {
    fontSize: 24,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    textAlign: "center",
    marginBottom: 8,
  },
  waitingDesc: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  waitingAmountCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  waitingAmountLabel: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginBottom: 4,
  },
  waitingAmount: {
    fontSize: 36,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  detectingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 32,
  },
  detectingText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#424242",
    lineHeight: 22,
  },

  cashIcon: { marginBottom: 8 },
  cashCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cashCardLabel: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginBottom: 8,
  },
  cashCardAmount: {
    fontSize: 40,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1B5E20",
    marginBottom: 16,
  },
  cashCardDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  cashCardInfo: { width: "100%", gap: 6 },
  cashCardInfoText: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#424242",
  },

  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    padding: 14,
    width: "100%",
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#E65100",
    lineHeight: 22,
  },

  successIcon: { marginBottom: 16 },
  successTitle: {
    fontSize: 28,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 36,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 32,
  },

  receiptCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  receiptLabel: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  receiptValue: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FFF",
    maxWidth: "60%",
    textAlign: "right",
  },

  pointsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 32,
  },
  pointsText: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FBC02D",
  },

  ghostBtn: { paddingVertical: 12, marginTop: 8 },
  ghostBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textDecorationLine: "underline",
  },
});
