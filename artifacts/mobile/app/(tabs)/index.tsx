import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { validateQR, addScanRecord, scanHistory } = useApp();
  const [qrInput, setQrInput] = useState("");

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const officer = validateQR(code.trim());

    if (officer) {
      await addScanRecord({
        qrCode: code.trim(),
        officerName: officer.name,
        location: officer.location,
        isValid: true,
      });
      router.push({
        pathname: "/scan-result",
        params: {
          valid: "true",
          officerName: officer.name,
          badgeNumber: officer.badgeNumber,
          area: officer.area,
          location: officer.location,
          rate: officer.rate.toString(),
          officerId: officer.id,
        },
      });
    } else {
      await addScanRecord({
        qrCode: code.trim(),
        officerName: null,
        location: null,
        isValid: false,
      });
      router.push({
        pathname: "/scan-result",
        params: { valid: "false", qrCode: code.trim() },
      });
    }
    setQrInput("");
  };

  const handleDemoScan = (qrCode: string) => {
    handleScan(qrCode);
  };

  const recentScans = scanHistory.slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingTop: Platform.OS === "web" ? 67 + 16 : 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="parking" size={28} color="#FFF" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>LohParkir</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Verifikasi Parkir Resmi
        </Text>
      </View>

      <View
        style={[
          styles.scanCard,
          { backgroundColor: colors.card, borderRadius: colors.radius },
        ]}
      >
        <View style={[styles.scanIconWrapper, { backgroundColor: colors.primary + "10" }]}>
          <MaterialCommunityIcons name="qrcode-scan" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.scanTitle, { color: colors.foreground }]}>Scan QR Code</Text>
        <Text style={[styles.scanDesc, { color: colors.mutedForeground }]}>
          Masukkan kode QR petugas parkir untuk verifikasi
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
            placeholder="Masukkan kode QR..."
            placeholderTextColor={colors.mutedForeground}
            value={qrInput}
            onChangeText={setQrInput}
            onSubmitEditing={() => handleScan(qrInput)}
            autoCapitalize="characters"
          />
          <Pressable
            onPress={() => handleScan(qrInput)}
            style={({ pressed }) => [
              styles.scanButton,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="search" size={20} color="#FFF" />
          </Pressable>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Demo QR Codes</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Coba scan salah satu kode di bawah ini
      </Text>

      <View style={styles.demoGrid}>
        {[
          { code: "LOHPARKIR-DSH-2024-001", name: "Budi Santoso", area: "Zona A" },
          { code: "LOHPARKIR-DSH-2024-002", name: "Siti Rahayu", area: "Zona B" },
          { code: "LOHPARKIR-DSH-2024-003", name: "Ahmad Wijaya", area: "Zona C" },
          { code: "FAKE-QR-12345", name: "QR Palsu", area: "Tidak Resmi" },
        ].map((item) => (
          <Pressable
            key={item.code}
            onPress={() => handleDemoScan(item.code)}
            style={({ pressed }) => [
              styles.demoCard,
              {
                backgroundColor: item.code.startsWith("FAKE")
                  ? colors.destructive + "10"
                  : colors.card,
                borderColor: item.code.startsWith("FAKE") ? colors.destructive + "30" : colors.border,
                borderRadius: colors.radius,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.code.startsWith("FAKE") ? "alert-circle" : "qrcode"}
              size={24}
              color={item.code.startsWith("FAKE") ? colors.destructive : colors.primary}
            />
            <Text
              style={[
                styles.demoName,
                { color: item.code.startsWith("FAKE") ? colors.destructive : colors.foreground },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.demoArea, { color: colors.mutedForeground }]}>{item.area}</Text>
          </Pressable>
        ))}
      </View>

      {recentScans.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Riwayat Scan</Text>
          {recentScans.map((scan) => (
            <View
              key={scan.id}
              style={[styles.historyItem, { backgroundColor: colors.card, borderRadius: colors.radius }]}
            >
              <View
                style={[
                  styles.historyIcon,
                  { backgroundColor: scan.isValid ? colors.success + "15" : colors.destructive + "15" },
                ]}
              >
                <Feather
                  name={scan.isValid ? "check-circle" : "x-circle"}
                  size={18}
                  color={scan.isValid ? colors.success : colors.destructive}
                />
              </View>
              <View style={styles.historyText}>
                <Text style={[styles.historyName, { color: colors.foreground }]} numberOfLines={1}>
                  {scan.officerName || "QR Tidak Dikenal"}
                </Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                  {new Date(scan.scannedAt).toLocaleString("id-ID")}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: scan.isValid ? colors.success + "15" : colors.destructive + "15",
                    borderRadius: 6,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: scan.isValid ? colors.success : colors.destructive },
                  ]}
                >
                  {scan.isValid ? "Resmi" : "Palsu"}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", marginBottom: 24, paddingHorizontal: 20 },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  scanCard: { marginHorizontal: 20, padding: 24, alignItems: "center", marginBottom: 28 },
  scanIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scanTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  scanDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 20 },
  inputRow: { flexDirection: "row", gap: 10, width: "100%" },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  scanButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  demoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  demoCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "45%",
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  demoName: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  demoArea: { fontSize: 11, fontFamily: "Inter_400Regular" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  historyText: { flex: 1 },
  historyName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  historyDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
