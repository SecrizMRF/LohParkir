import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hapticImpact } from "@/lib/platform";

export default function KarcisScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    plateNumber: string;
    area: string;
    rate: string;
    officerName: string;
    transactionId: string;
    createdAt: string;
    officerId: string;
  }>();

  const rate = Number(params.rate || 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 + 40 : insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <Text style={styles.title}>PARKIR SAH</Text>

        <View style={styles.detailsCard}>
          {[
            { label: "Plat", value: params.plateNumber },
            { label: "Zona", value: params.area || "-" },
            { label: "Tarif", value: `Rp ${rate.toLocaleString("id-ID")}` },
            { label: "Waktu", value: new Date(params.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
            { label: "Petugas", value: params.officerName },
            { label: "ID", value: params.transactionId },
          ].map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}:</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.qrSection}>
          <MaterialCommunityIcons name="qrcode" size={200} color="#000" />
        </View>

        <Text style={styles.showHint}>
          Tunjukkan layar ini ke petugas parkir
        </Text>

        <Pressable
          onPress={() => {
            hapticImpact();
            router.dismissAll();
            router.replace("/(tabs)");
          }}
          style={({ pressed }) => [
            styles.doneBtn,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.doneBtnText}>SELESAI</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { alignItems: "center", paddingHorizontal: 24 },

  title: {
    fontSize: 28,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 32,
  },

  detailsCard: {
    width: "100%",
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  detailLabel: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  detailValue: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    maxWidth: "55%",
    textAlign: "right",
  },

  qrSection: {
    alignItems: "center",
    marginBottom: 24,
  },

  showHint: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
    marginBottom: 32,
  },

  doneBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    color: "#424242",
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },
});
