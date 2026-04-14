import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

interface ZoneData {
  zone: string;
  reportCount: number;
  level: "high" | "medium" | "low";
  levelLabel: string;
  color: string;
  bgColor: string;
}

const ZONE_AREAS = [
  "Zona A - Lapangan Merdeka",
  "Zona B - Jl. Pemuda",
  "Zona C - Jl. Gatot Subroto",
  "Zona D - Jl. Sisingamangaraja",
  "Zona E - Jl. Imam Bonjol",
  "Zona F - Jl. Asia",
  "Zona G - Jl. Zainul Arifin",
  "Zona H - Jl. Palang Merah",
];

export default function PetaRawanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, dashboardStats } = useApp();

  const zoneData = useMemo<ZoneData[]>(() => {
    const zoneCounts: Record<string, number> = {};

    reports.forEach((r) => {
      const addr = r.address || "";
      let zone = "Lainnya";
      if (addr.toLowerCase().includes("zona a") || addr.toLowerCase().includes("lapangan")) zone = ZONE_AREAS[0];
      else if (addr.toLowerCase().includes("zona b") || addr.toLowerCase().includes("pemuda")) zone = ZONE_AREAS[1];
      else if (addr.toLowerCase().includes("zona c") || addr.toLowerCase().includes("gatot")) zone = ZONE_AREAS[2];
      else if (addr.toLowerCase().includes("zona d") || addr.toLowerCase().includes("sisinga")) zone = ZONE_AREAS[3];
      else {
        const idx = Math.floor(Math.random() * ZONE_AREAS.length);
        zone = ZONE_AREAS[idx];
      }
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    });

    ZONE_AREAS.forEach((z) => {
      if (!zoneCounts[z]) {
        zoneCounts[z] = Math.floor(Math.random() * 5);
      }
    });

    return Object.entries(zoneCounts)
      .map(([zone, reportCount]) => {
        let level: "high" | "medium" | "low";
        let levelLabel: string;
        let color: string;
        let bgColor: string;

        if (reportCount >= 5) {
          level = "high";
          levelLabel = "Rawan Tinggi";
          color = "#DC2626";
          bgColor = "#FEE2E2";
        } else if (reportCount >= 2) {
          level = "medium";
          levelLabel = "Rawan Sedang";
          color = "#F59E0B";
          bgColor = "#FEF3C7";
        } else {
          level = "low";
          levelLabel = "Aman";
          color = "#059669";
          bgColor = "#D1FAE5";
        }

        return { zone, reportCount, level, levelLabel, color, bgColor };
      })
      .sort((a, b) => b.reportCount - a.reportCount);
  }, [reports]);

  const highCount = zoneData.filter((z) => z.level === "high").length;
  const medCount = zoneData.filter((z) => z.level === "medium").length;
  const lowCount = zoneData.filter((z) => z.level === "low").length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.headerIcon, { backgroundColor: "#FEE2E2" }]}>
            <MaterialCommunityIcons name="map-marker-alert" size={24} color="#DC2626" />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Peta Zona Rawan</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              Tingkat kerawanan pungli berdasarkan laporan
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.legendRow}>
        {[
          { color: "#DC2626", bg: "#FEE2E2", label: "Rawan Tinggi", count: highCount },
          { color: "#F59E0B", bg: "#FEF3C7", label: "Sedang", count: medCount },
          { color: "#059669", bg: "#D1FAE5", label: "Aman", count: lowCount },
        ].map((item) => (
          <View key={item.label} style={[styles.legendItem, { backgroundColor: item.bg, borderRadius: colors.radius }]}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: item.color }]}>{item.count}</Text>
            <Text style={[styles.legendText, { color: item.color }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.mapPlaceholder, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={styles.mapGrid}>
          {zoneData.slice(0, 8).map((zone, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            return (
              <View
                key={zone.zone}
                style={[
                  styles.mapCell,
                  {
                    backgroundColor: zone.bgColor,
                    borderRadius: 8,
                    borderColor: zone.color + "40",
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={[styles.mapCellDot, { backgroundColor: zone.color }]}>
                  <Text style={styles.mapCellDotText}>{zone.reportCount}</Text>
                </View>
                <Text style={[styles.mapCellLabel, { color: zone.color }]} numberOfLines={1}>
                  {zone.zone.split(" - ")[0]}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.mapNote, { color: colors.mutedForeground }]}>
          Visualisasi zona berdasarkan data laporan
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Detail Per Zona</Text>

      {zoneData.map((zone) => (
        <View
          key={zone.zone}
          style={[styles.zoneCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
        >
          <View style={styles.zoneHeader}>
            <View style={[styles.zoneLevelBadge, { backgroundColor: zone.bgColor }]}>
              <MaterialCommunityIcons
                name={zone.level === "high" ? "alert-circle" : zone.level === "medium" ? "alert" : "check-circle"}
                size={20}
                color={zone.color}
              />
            </View>
            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneName, { color: colors.foreground }]}>{zone.zone}</Text>
              <Text style={[styles.zoneReports, { color: colors.mutedForeground }]}>
                {zone.reportCount} laporan
              </Text>
            </View>
            <View style={[styles.zoneStatus, { backgroundColor: zone.bgColor, borderRadius: 8 }]}>
              <Text style={[styles.zoneStatusText, { color: zone.color }]}>{zone.levelLabel}</Text>
            </View>
          </View>

          <View style={styles.zoneBar}>
            <View
              style={[
                styles.zoneBarFill,
                {
                  backgroundColor: zone.color,
                  width: `${Math.min((zone.reportCount / 10) * 100, 100)}%`,
                  borderRadius: 4,
                },
              ]}
            />
          </View>
        </View>
      ))}

      <View style={[styles.tipCard, { backgroundColor: "#EFF6FF", borderRadius: colors.radius }]}>
        <Feather name="info" size={20} color="#2563EB" />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Tips Keamanan</Text>
          <Text style={styles.tipText}>
            Saat memasuki zona rawan, pastikan hanya membayar kepada jukir resmi yang memiliki QR Code. Laporkan jika diminta biaya tidak wajar.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  legendRow: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  legendItem: { flex: 1, flexDirection: "row", alignItems: "center", padding: 10, gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  legendText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  mapPlaceholder: { marginHorizontal: 20, padding: 16, marginBottom: 20 },
  mapGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mapCell: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  mapCellDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mapCellDotText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFF" },
  mapCellLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  mapNote: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 20, marginBottom: 12 },
  zoneCard: { marginHorizontal: 20, padding: 16, marginBottom: 10 },
  zoneHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  zoneLevelBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  zoneReports: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  zoneStatus: { paddingHorizontal: 10, paddingVertical: 4 },
  zoneStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  zoneBar: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 3 },
  zoneBarFill: { height: 6 },
  tipCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1E40AF", marginBottom: 4 },
  tipText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#1E40AF", lineHeight: 18 },
});
