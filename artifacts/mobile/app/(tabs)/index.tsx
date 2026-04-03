import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Linking,
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
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const scanCooldown = useRef(false);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    if (scanCooldown.current) return;
    scanCooldown.current = true;
    setScanned(true);

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
    setTimeout(() => {
      scanCooldown.current = false;
      setScanned(false);
    }, 2000);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    handleScan(data);
  };

  if (showManualInput) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.manualHeader}>
          <Pressable
            onPress={() => setShowManualInput(false)}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.manualTitle, { color: colors.foreground }]}>Input Manual</Text>
        </View>

        <View
          style={[styles.manualCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
        >
          <View style={[styles.scanIconWrapper, { backgroundColor: colors.primary + "10" }]}>
            <MaterialCommunityIcons name="keyboard" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.manualDesc, { color: colors.mutedForeground }]}>
            Masukkan kode QR petugas parkir secara manual
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
              autoFocus
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
          Coba salah satu kode di bawah
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
              onPress={() => handleScan(item.code)}
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
      </ScrollView>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="camera" size={40} color={colors.mutedForeground} />
        <Text style={[styles.permText, { color: colors.mutedForeground }]}>Memuat kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.permCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={[styles.permIcon, { backgroundColor: colors.primary + "10" }]}>
            <MaterialCommunityIcons name="camera-off" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.permTitle, { color: colors.foreground }]}>Akses Kamera Diperlukan</Text>
          <Text style={[styles.permDesc, { color: colors.mutedForeground }]}>
            LohParkir memerlukan akses kamera untuk men-scan QR Code badge petugas parkir
          </Text>
          {permission.status === "denied" && !permission.canAskAgain ? (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  try { Linking.openSettings(); } catch {}
                }
              }}
              style={({ pressed }) => [
                styles.permButton,
                { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="settings" size={18} color="#FFF" />
              <Text style={styles.permButtonText}>Buka Pengaturan</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={requestPermission}
              style={({ pressed }) => [
                styles.permButton,
                { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="camera" size={18} color="#FFF" />
              <Text style={styles.permButtonText}>Izinkan Kamera</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setShowManualInput(true)}
            style={({ pressed }) => [
              styles.permSecondary,
              { borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="edit-3" size={18} color={colors.foreground} />
            <Text style={[styles.permSecondaryText, { color: colors.foreground }]}>Input Manual</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={[styles.overlay]}>
        <View
          style={[
            styles.topBar,
            { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
          ]}
        >
          <View style={styles.topBarContent}>
            <View style={[styles.logoSmall, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="parking" size={18} color="#FFF" />
            </View>
            <Text style={styles.topTitle}>LohParkir</Text>
          </View>
        </View>

        <View style={styles.scanAreaContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
          </View>
          <Text style={styles.scanHint}>
            {scanned ? "QR Code terdeteksi..." : "Arahkan kamera ke QR Code petugas parkir"}
          </Text>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 }]}>
          <Pressable
            onPress={() => setShowManualInput(true)}
            style={({ pressed }) => [
              styles.bottomButton,
              { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: colors.radius, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="edit-3" size={18} color="#FFF" />
            <Text style={styles.bottomButtonText}>Input Manual</Text>
          </Pressable>

          {scanHistory.length > 0 && (
            <View style={[styles.recentBadge, { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: colors.radius }]}>
              <Feather name="clock" size={14} color="#FFF" />
              <Text style={styles.recentText}>{scanHistory.length} scan</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },

  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topBarContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoSmall: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  topTitle: { color: "#FFF", fontSize: 18, fontFamily: "Inter_700Bold" },

  scanAreaContainer: { alignItems: "center", gap: 20 },
  scanFrame: { width: 260, height: 260, position: "relative" },
  corner: { position: "absolute", width: 40, height: 40, borderWidth: 4 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  scanHint: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 40,
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  bottomButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  bottomButtonText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  recentText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_500Medium" },

  permCard: { margin: 24, padding: 32, alignItems: "center" },
  permIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 10, textAlign: "center" },
  permDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  permButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    gap: 10,
    marginBottom: 12,
  },
  permButtonText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  permSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    borderWidth: 1.5,
    gap: 10,
  },
  permSecondaryText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  permText: { fontSize: 15, fontFamily: "Inter_500Medium", marginTop: 12 },

  manualHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 14,
  },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  manualTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  manualCard: { marginHorizontal: 20, padding: 24, alignItems: "center", marginBottom: 28 },
  scanIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  manualDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 20 },
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
});
