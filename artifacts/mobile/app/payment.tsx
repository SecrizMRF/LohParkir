import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type Payment } from "@/contexts/AppContext";

const PLATE_LETTERS = ["BK", "B", "D", "L", "H", "N", "AG", "AB", "AD", "K", "R", "G", "E", "T", "Z", "F", "A", "W", "S", "P"];
const PLATE_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PLATE_SUFFIX = ["AA", "AB", "AC", "AD", "BA", "BB", "BC", "CA", "DA", "EA", "FA", "GA", "HA", "XY", "XZ", "YZ"];

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
  }>();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<Payment | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const [platePrefix, setPlatePrefix] = useState(0);
  const [plateNum1, setPlateNum1] = useState(0);
  const [plateNum2, setPlateNum2] = useState(0);
  const [plateNum3, setPlateNum3] = useState(0);
  const [plateNum4, setPlateNum4] = useState(0);
  const [plateSuffix, setPlateSuffix] = useState(0);

  const rate = Number(params.rate || 0);
  const plateNumber = `${PLATE_LETTERS[platePrefix]} ${PLATE_NUMBERS[plateNum1]}${PLATE_NUMBERS[plateNum2]}${PLATE_NUMBERS[plateNum3]}${PLATE_NUMBERS[plateNum4]} ${PLATE_SUFFIX[plateSuffix]}`;

  const handlePayment = async () => {
    setLoading(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const payment = await addPayment({
        officerId: params.officerId ? Number(params.officerId) : null,
        officerName: params.officerName || "",
        amount: rate,
        method: "qris",
        area: params.area || "",
        plateNumber: plateNumber,
        duration: 1,
      });

      const pts = Math.floor(rate / 1000);
      addPoints(pts);
      setEarnedPoints(pts);
      setPaymentData(payment);
      setStep(3);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Pembayaran gagal.");
    } finally {
      setLoading(false);
    }
  };

  const WheelColumn = ({
    items,
    selected,
    onSelect,
    width,
  }: {
    items: string[];
    selected: number;
    onSelect: (idx: number) => void;
    width: number;
  }) => (
    <View style={[styles.wheelColumn, { width }]}>
      <Pressable
        onPress={() => onSelect((selected - 1 + items.length) % items.length)}
        style={styles.wheelArrow}
      >
        <Feather name="chevron-up" size={28} color="#757575" />
      </Pressable>
      <View style={styles.wheelValue}>
        <Text style={styles.wheelValueText}>{items[selected]}</Text>
      </View>
      <Pressable
        onPress={() => onSelect((selected + 1) % items.length)}
        style={styles.wheelArrow}
      >
        <Feather name="chevron-down" size={28} color="#757575" />
      </Pressable>
    </View>
  );

  if (step === 3 && paymentData) {
    return (
      <View style={[styles.container, { backgroundColor: "#FFF" }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === "web" ? 67 + 32 : insets.top + 32, paddingBottom: insets.bottom + 40 },
          ]}
        >
          <Text style={styles.karcisTitle}>PARKIR SAH</Text>

          <View style={styles.karcisDetails}>
            {[
              { label: "Plat", value: plateNumber },
              { label: "Zona", value: params.area || "-" },
              { label: "Tarif", value: `Rp ${rate.toLocaleString("id-ID")}` },
              { label: "Waktu", value: new Date(paymentData.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
              { label: "Petugas", value: params.officerName },
              { label: "No. Transaksi", value: paymentData.transactionId },
            ].map((item) => (
              <View key={item.label} style={styles.karcisRow}>
                <Text style={styles.karcisLabel}>{item.label}:</Text>
                <Text style={styles.karcisValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.qrProof}>
            <MaterialCommunityIcons name="qrcode" size={200} color="#000" />
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({
                pathname: "/karcis",
                params: {
                  plateNumber,
                  area: params.area,
                  rate: params.rate,
                  officerName: params.officerName,
                  transactionId: paymentData.transactionId,
                  createdAt: paymentData.createdAt,
                  officerId: params.officerId,
                },
              });
            }}
            style={({ pressed }) => [
              styles.showBtn,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="cellphone" size={22} color="#FFF" />
            <Text style={styles.showBtnText}>TAMPILKAN KE JUKIR</Text>
          </Pressable>

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
            style={({ pressed }) => [
              styles.outlineBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.outlineBtnText}>SELESAI</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24, paddingBottom: insets.bottom + 40 },
          ]}
        >
          <Text style={styles.stepTitle}>Konfirmasi & Bayar</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLine}>Plat: <Text style={styles.summaryBold}>{plateNumber}</Text></Text>
            <Text style={styles.summaryLine}>Zona: <Text style={styles.summaryBold}>{params.area}</Text></Text>
            <Text style={styles.summaryLine}>Tarif: <Text style={styles.summaryBold}>Rp {rate.toLocaleString("id-ID")}</Text></Text>
          </View>

          <View style={styles.qrisCard}>
            <MaterialCommunityIcons name="qrcode" size={300} color="#000" />
            <Text style={styles.qrisInstruction}>
              Buka Mobile Banking / E-Wallet Anda,{"\n"}lalu pindai kode ini.
            </Text>
          </View>

          <Pressable
            onPress={handlePayment}
            disabled={loading}
            style={({ pressed }) => [
              styles.payConfirmBtn,
              { backgroundColor: "#1B5E20", opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.payConfirmBtnText}>SAYA SUDAH BAYAR</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setStep(1)}
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
      >
        <Text style={styles.stepTitle}>Masukkan Plat Nomor</Text>

        <View style={styles.wheelContainer}>
          <WheelColumn items={PLATE_LETTERS} selected={platePrefix} onSelect={setPlatePrefix} width={72} />
          <WheelColumn items={PLATE_NUMBERS} selected={plateNum1} onSelect={setPlateNum1} width={52} />
          <WheelColumn items={PLATE_NUMBERS} selected={plateNum2} onSelect={setPlateNum2} width={52} />
          <WheelColumn items={PLATE_NUMBERS} selected={plateNum3} onSelect={setPlateNum3} width={52} />
          <WheelColumn items={PLATE_NUMBERS} selected={plateNum4} onSelect={setPlateNum4} width={52} />
          <WheelColumn items={PLATE_SUFFIX} selected={plateSuffix} onSelect={setPlateSuffix} width={72} />
        </View>

        <View style={styles.platePreview}>
          <Text style={styles.platePreviewText}>{plateNumber}</Text>
        </View>

        <Text style={styles.wheelHint}>Putar untuk pilih nomor kendaraan Anda</Text>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setStep(2);
          }}
          style={({ pressed }) => [
            styles.continueBtn,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.continueBtnText}>LANJUTKAN</Text>
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
    marginBottom: 32,
  },

  wheelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 24,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wheelColumn: { alignItems: "center" },
  wheelArrow: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelValue: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#1565C0",
    paddingHorizontal: 4,
    minWidth: 44,
  },
  wheelValueText: {
    fontSize: 24,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },

  platePreview: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#424242",
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  platePreviewText: {
    fontSize: 28,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    textAlign: "center",
    letterSpacing: 2,
  },

  wheelHint: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
    marginBottom: 32,
  },

  continueBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  continueBtnText: {
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

  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 24,
  },
  summaryLine: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#424242",
    marginBottom: 8,
  },
  summaryBold: {
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },

  qrisCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  qrisInstruction: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },

  payConfirmBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  payConfirmBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },

  karcisTitle: {
    fontSize: 24,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 24,
  },
  karcisDetails: {
    width: "100%",
    marginBottom: 24,
  },
  karcisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  karcisLabel: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  karcisValue: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    maxWidth: "60%",
    textAlign: "right",
  },
  qrProof: {
    alignItems: "center",
    marginBottom: 32,
  },

  showBtn: {
    width: "100%",
    height: 64,
    borderRadius: 12,
    backgroundColor: "#1565C0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  showBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },

  outlineBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    color: "#424242",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },
});
