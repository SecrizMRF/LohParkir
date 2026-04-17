import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { hapticImpact, showAlert } from "@/lib/platform";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const { validateQR, scanHistory } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [validating, setValidating] = useState(false);
  const scanCooldown = useRef(false);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    if (scanCooldown.current) return;
    scanCooldown.current = true;
    setScanned(true);
    setValidating(true);

    await hapticImpact();

    try {
      const result = await validateQR(code.trim());

      if (result.isValid && result.officer) {
        router.push({
          pathname: "/scan-result",
          params: {
            valid: "true",
            officerName: result.officer.name,
            badgeNumber: result.officer.badgeNumber,
            area: result.officer.area,
            location: result.officer.location,
            rate: result.officer.rate.toString(),
            officerId: result.officer.id.toString(),
          },
        });
      } else {
        router.push({
          pathname: "/scan-result",
          params: { valid: "false", qrCode: code.trim(), message: result.message },
        });
      }
    } catch {
      router.push({
        pathname: "/scan-result",
        params: { valid: "false", qrCode: code.trim(), message: "Gagal memvalidasi QR code" },
      });
    } finally {
      setValidating(false);
      setQrInput("");
      setTimeout(() => {
        scanCooldown.current = false;
        setScanned(false);
      }, 2000);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    handleScan(data);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showAlert("Akses Ditolak", "Izinkan kamera untuk scan QR Code.");
        return;
      }
    }
    setShowCamera(true);
  };

  if (showManualInput) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.manualHeader}>
          <Pressable
            onPress={() => setShowManualInput(false)}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.card, borderRadius: 12, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.manualTitle, { color: colors.foreground }]}>Input Manual</Text>
        </View>

        <View style={[styles.manualCard, { backgroundColor: colors.card, borderRadius: 12 }]}>
          <Text style={[styles.manualDesc, { color: colors.mutedForeground }]}>
            Masukkan kode QR petugas parkir{"\n"}Format: LOHPARKIR-DSH-YYYY-NNN
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
              placeholder="LOHPARKIR-DSH-2024-001"
              placeholderTextColor={colors.mutedForeground}
              value={qrInput}
              onChangeText={setQrInput}
              onSubmitEditing={() => handleScan(qrInput)}
              autoCapitalize="characters"
              autoFocus
            />
            <Pressable
              onPress={() => handleScan(qrInput)}
              disabled={validating}
              style={({ pressed }) => [
                styles.searchBtn,
                { backgroundColor: "#1565C0", borderRadius: 12, opacity: validating ? 0.5 : pressed ? 0.8 : 1 },
              ]}
            >
              {validating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Feather name="search" size={22} color="#FFF" />
              )}
            </Pressable>
          </View>
        </View>

        <Text style={[styles.demoTitle, { color: colors.foreground }]}>Demo QR Codes</Text>
        <View style={styles.demoList}>
          {[
            { code: "LOHPARKIR-DSH-2024-001", name: "Budi Santoso", area: "Zona A" },
            { code: "LOHPARKIR-DSH-2024-002", name: "Siti Rahayu", area: "Zona B" },
            { code: "LOHPARKIR-DSH-2024-003", name: "Ahmad Wijaya", area: "Zona C" },
            { code: "FAKE-QR-12345", name: "QR Palsu (Test)", area: "Tidak Resmi" },
          ].map((item) => (
            <Pressable
              key={item.code}
              onPress={() => handleScan(item.code)}
              disabled={validating}
              style={({ pressed }) => [
                styles.demoCard,
                {
                  backgroundColor: item.code.startsWith("FAKE") ? "#FFEBEE" : colors.card,
                  borderColor: item.code.startsWith("FAKE") ? "#B71C1C" + "30" : colors.border,
                  borderRadius: 12,
                  opacity: validating ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={item.code.startsWith("FAKE") ? "alert-circle" : "qrcode"}
                size={28}
                color={item.code.startsWith("FAKE") ? "#B71C1C" : "#1565C0"}
              />
              <View style={styles.demoInfo}>
                <Text style={[styles.demoName, { color: item.code.startsWith("FAKE") ? "#B71C1C" : colors.foreground }]}>
                  {item.name}
                </Text>
                <Text style={[styles.demoArea, { color: colors.mutedForeground }]}>{item.area}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (showCamera) {
    return (
      <View style={[styles.container, { backgroundColor: "#000" }]}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.cameraOverlay}>
          <View style={[styles.cameraTopBar, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}>
            <Pressable
              onPress={() => setShowCamera(false)}
              style={({ pressed }) => [styles.cameraBack, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather name="arrow-left" size={24} color="#FFF" />
            </Pressable>
            <Text style={styles.cameraTitle}>Scan QR Jukir</Text>
          </View>

          <View style={styles.scanAreaContainer}>
            {validating ? (
              <View style={styles.validatingCenter}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.scanHint}>Memvalidasi QR Code...</Text>
              </View>
            ) : (
              <>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <Text style={styles.scanHint}>
                  Arahkan kamera ke kode QR tukang parkir
                </Text>
              </>
            )}
          </View>

          <View style={[styles.cameraBottom, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 }]}>
            <Pressable
              onPress={() => { setShowCamera(false); setShowManualInput(true); }}
              style={({ pressed }) => [styles.cameraBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather name="edit-3" size={18} color="#FFF" />
              <Text style={styles.cameraBtnText}>Input Manual</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.homeContent, { paddingTop: Platform.OS === "web" ? 67 + 32 : insets.top + 32 }]}>
        <View style={styles.logoSection}>
          <View style={styles.logoImageWrap}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.homeTitle, { color: colors.foreground }]}>LohParkir</Text>
          <View style={styles.taglineRow}>
            <View style={[styles.taglineDot, { backgroundColor: "#1565C0" }]} />
            <Text style={[styles.homeTagline, { color: colors.mutedForeground }]}>
              Dishub Kota Medan
            </Text>
            <View style={[styles.taglineDot, { backgroundColor: "#1565C0" }]} />
          </View>
        </View>

        <View style={styles.homeButtons}>
          <Pressable
            onPress={() => {
              hapticImpact();
              openCamera();
            }}
            style={({ pressed }) => [
              styles.scanMainBtn,
              { backgroundColor: "#1565C0", borderRadius: 12, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="camera" size={28} color="#FFF" />
            <Text style={styles.scanMainBtnText}>SCAN QR JUKIR</Text>
            <Text style={styles.scanMainBtnHint}>Arahkan kamera ke kode QR</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticImpact();
              router.push("/report-form");
            }}
            accessibilityRole="button"
            accessibilityLabel="LAPORKAN PUNGLI"
            style={({ pressed }) => [
              styles.reportMainBtn,
              { borderColor: "#B71C1C", borderRadius: 12, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="alert" size={24} color="#B71C1C" />
            <Text style={styles.reportMainBtnText}>LAPORKAN PUNGLI</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowManualInput(true)}
            style={({ pressed }) => [
              styles.manualBtn,
              { borderColor: colors.border, borderRadius: 12, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="edit-3" size={20} color={colors.foreground} />
            <Text style={[styles.manualBtnText, { color: colors.foreground }]}>Input QR Manual</Text>
          </Pressable>
        </View>

        <Text style={[styles.homeFooter, { color: colors.mutedForeground }]}>
          Pastikan jukir memiliki kode resmi sebelum bayar.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  homeContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 120,
  },
  logoSection: {
    alignItems: "center",
    gap: 16,
  },
  logoImageWrap: {
    width: 132,
    height: 132,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#FFF",
    ...Platform.select({
      ios: { shadowColor: "#1565C0", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18 },
      android: { elevation: 10 },
      web: { shadowColor: "#1565C0", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18 },
    }),
  },
  logoImage: { width: "100%", height: "100%" },
  homeTitle: {
    fontSize: 32,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  homeTagline: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    textAlign: "center",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  homeButtons: {
    gap: 16,
  },
  scanMainBtn: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    elevation: 3,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanMainBtnText: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    letterSpacing: 0.5,
  },
  scanMainBtnHint: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
  },
  reportMainBtn: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  reportMainBtnText: {
    color: "#B71C1C",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },
  manualBtn: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  manualBtnText: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },
  homeFooter: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },

  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },
  cameraTopBar: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "rgba(0,0,0,0.4)", flexDirection: "row", alignItems: "center", gap: 14 },
  cameraBack: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  cameraTitle: { color: "#FFF", fontSize: 20, fontFamily: "AtkinsonHyperlegible_700Bold" },
  scanAreaContainer: { alignItems: "center", gap: 20 },
  validatingCenter: { alignItems: "center", gap: 16 },
  scanFrame: { width: 280, height: 280, position: "relative" },
  corner: { position: "absolute", width: 44, height: 44, borderWidth: 4, borderColor: "#FFF" },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  scanHint: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 40,
  },
  cameraBottom: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center" },
  cameraBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  cameraBtnText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },

  manualHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 24, gap: 14 },
  backBtn: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  manualTitle: { fontSize: 22, fontFamily: "AtkinsonHyperlegible_700Bold" },
  manualCard: { marginHorizontal: 20, padding: 24, marginBottom: 28 },
  manualDesc: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_400Regular", textAlign: "center", marginBottom: 20, lineHeight: 24 },
  inputRow: { flexDirection: "row", gap: 10, width: "100%" },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    borderWidth: 1.5,
  },
  searchBtn: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  demoTitle: { fontSize: 20, fontFamily: "AtkinsonHyperlegible_700Bold", paddingHorizontal: 20, marginBottom: 12 },
  demoList: { paddingHorizontal: 20, gap: 10 },
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  demoInfo: { flex: 1 },
  demoName: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold" },
  demoArea: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular", marginTop: 2 },
});
