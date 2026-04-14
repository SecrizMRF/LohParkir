import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanResultScreen() {
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
    message?: string;
  }>();

  const isValid = params.valid === "true";
  const bgColor = isValid ? "#1B5E20" : "#B71C1C";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 + 32 : insets.top + 32, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isValid ? (
          <>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#FFF" />
            </View>

            <View style={styles.photoPlaceholder}>
              <Feather name="user" size={64} color="#1B5E20" />
            </View>

            <Text style={styles.officerName}>{params.officerName}</Text>
            <Text style={styles.tarif}>
              Rp {Number(params.rate || 0).toLocaleString("id-ID")}
            </Text>
            <Text style={styles.subInfo}>
              {params.area} | {params.location}
            </Text>
            <Text style={styles.subInfo}>Badge: {params.badgeNumber}</Text>

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
                    location: params.location,
                    badgeNumber: params.badgeNumber,
                  },
                });
              }}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: "#1565C0", opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={styles.primaryBtnText}>BAYAR PARKIR SEKARANG</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.ghostBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.ghostBtnText}>Kembali</Text>
            </Pressable>
          </>
        ) : (
          <>
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                router.push({
                  pathname: "/report-form",
                  params: { prefillType: "fake_qr", qrCode: params.qrCode },
                });
              }}
              style={({ pressed }) => [
                styles.reportBtn,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={styles.reportBtnText}>LAPORKAN SEKARANG</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.ghostBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.ghostBtnText}>Kembali</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24 },

  iconWrap: { marginBottom: 24 },

  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#FFF",
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  officerName: {
    fontSize: 24,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  tarif: {
    fontSize: 32,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subInfo: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 4,
  },

  primaryBtn: {
    width: "100%",
    height: 72,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    letterSpacing: 0.5,
  },

  ghostBtn: {
    paddingVertical: 16,
    marginTop: 12,
  },
  ghostBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textDecorationLine: "underline",
  },

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
});
