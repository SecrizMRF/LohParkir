import { Feather, MaterialCommunityIcons } from "@/components/Icon";
import { router } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { hapticImpact } from "@/lib/platform";

type RoleOption = {
  key: "public" | "officer" | "admin";
  title: string;
  desc: string;
  icon: "user" | "shield" | "users";
  needsLogin: boolean;
  color: string;
};

export default function RoleSelectScreen() {
  const colors = useColors();
  const { setUserRole } = useApp();

  const options: RoleOption[] = [
    {
      key: "public",
      title: "Pengguna",
      desc: "Scan QR petugas, bayar parkir, lapor parkir liar",
      icon: "user",
      needsLogin: false,
      color: colors.primary,
    },
    {
      key: "officer",
      title: "Juru Parkir",
      desc: "Tampilkan QR resmi untuk pengguna scan",
      icon: "users",
      needsLogin: true,
      color: colors.secondary,
    },
    {
      key: "admin",
      title: "Admin Dishub",
      desc: "Kelola petugas, laporan, dan statistik",
      icon: "shield",
      needsLogin: true,
      color: colors.warning,
    },
  ];

  const handlePick = async (opt: RoleOption) => {
    hapticImpact();
    if (opt.needsLogin) {
      router.push({ pathname: "/login", params: { role: opt.key } });
    } else {
      await setUserRole(opt.key);
      router.replace("/(tabs)");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Platform.OS === "web" ? 32 : 56 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primary + "12" }]}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>LohParkir</Text>
        <Text style={[styles.appTag, { color: colors.mutedForeground }]}>
          Verifikasi Parkir Resmi Dishub Kota Medan
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Masuk sebagai</Text>

      <View style={styles.optionList}>
        {options.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => handlePick(opt)}
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                opacity: pressed ? 0.85 : 1,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.optionIcon, { backgroundColor: opt.color + "15" }]}>
              <Feather name={opt.icon} size={26} color={opt.color} />
            </View>
            <View style={styles.optionInfo}>
              <View style={styles.optionTitleRow}>
                <Text style={[styles.optionTitle, { color: colors.foreground }]}>{opt.title}</Text>
                {opt.needsLogin && (
                  <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}>
                    <Feather name="lock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.lockText, { color: colors.mutedForeground }]}>Login</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.primary + "08", borderRadius: colors.radius }]}>
        <MaterialCommunityIcons name="information" size={18} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primary }]}>
          Pengguna umum tidak perlu akun. Petugas dan admin memerlukan kredensial dari Dishub.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 32 },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logo: { width: 56, height: 56 },
  appName: { fontSize: 26, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 4 },
  appTag: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 14 },
  optionList: { gap: 12 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderWidth: 1,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionInfo: { flex: 1 },
  optionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  optionTitle: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  lockText: { fontSize: 10, fontFamily: "AtkinsonHyperlegible_700Bold" },
  optionDesc: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", lineHeight: 17 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    marginTop: 24,
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", lineHeight: 17 },
});
