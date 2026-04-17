import { Feather } from "@/components/Icon";
import { AreaPicker, type AreaSelection } from "@/components/AreaPicker";
import { hapticNotification, showAlert } from "@/lib/platform";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRequireAdmin } from "@/hooks/useRoleGuard";
import { api } from "@/lib/api";

export default function OfficerFormScreen() {
  const colors = useColors();
  useRequireAdmin();
  const { addOfficer, authToken } = useApp();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [area, setArea] = useState<AreaSelection>({ province: "", city: "", district: "", village: "" });
  const [badge, setBadge] = useState("");
  const [badgeLoading, setBadgeLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBadge();
  }, [authToken]);

  const fetchBadge = async () => {
    if (!authToken) return;
    setBadgeLoading(true);
    try {
      const res = await api.getNextBadge(authToken);
      setBadge(res.badgeNumber);
    } catch (err: any) {
      showAlert("Gagal", err.message || "Tidak dapat memuat nomor badge berikutnya");
    } finally {
      setBadgeLoading(false);
    }
  };

  const composeArea = (): string => {
    const parts = [
      zone.trim() ? `Zona ${zone.trim()}` : null,
      area.village,
      area.district,
      area.city,
      area.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert("Lengkapi Form", "Nama petugas wajib diisi");
      return;
    }
    if (!phone.trim()) {
      showAlert("Lengkapi Form", "Nomor HP wajib diisi");
      return;
    }
    if (!area.province || !area.city || !area.district || !area.village) {
      showAlert("Lengkapi Form", "Pilih lengkap Provinsi, Kab/Kota, Kecamatan, dan Kelurahan");
      return;
    }

    setLoading(true);
    try {
      await hapticNotification();
      const composed = composeArea();
      const officer = await addOfficer({
        name: name.trim(),
        phone: phone.trim(),
        area: composed,
        location: composed,
      });

      showAlert(
        "Petugas Terdaftar",
        `${officer.name} telah berhasil didaftarkan.\n\nBadge: ${officer.badgeNumber}\nQR Code: ${officer.qrCode}`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      showAlert("Gagal", err.message || "Tidak dapat mendaftarkan petugas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderRadius: colors.radius }]}>
        <Feather name="info" size={18} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primary }]}>
          Nomor badge dibuat otomatis (DSH-YYYYMMDD-Z-XXX). QR Code: LOHPARKIR-[Badge].
        </Text>
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>Nomor Badge (otomatis)</Text>
        <View style={[styles.badgeRow, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="credit-card" size={18} color={colors.primary} />
          {badgeLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.badgeText, { color: colors.foreground }]}>{badge || "-"}</Text>
          )}
          <Pressable onPress={fetchBadge} hitSlop={10}>
            <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>Nama Petugas</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="user" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Contoh: Budi Santoso"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>No. HP (wajib)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="phone" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Contoh: 081234567893"
            placeholderTextColor={colors.mutedForeground}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Area Tugas</Text>
        <AreaPicker value={area} onChange={setArea} />
        <Text style={[styles.label, { color: colors.foreground, marginTop: 8 }]}>Nama Zona/Kawasan (opsional)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="tag" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Contoh: Zona D - Asia Afrika"
            placeholderTextColor={colors.mutedForeground}
            value={zone}
            onChangeText={setZone}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.submitContainer}>
        <Pressable
          onPress={handleSubmit}
          disabled={loading || badgeLoading}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: loading || badgeLoading ? 0.6 : pressed ? 0.8 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="user-plus" size={20} color="#FFF" />
              <Text style={styles.submitText}>Daftarkan Petugas</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoCard: {
    flexDirection: "row", alignItems: "center", margin: 20, marginBottom: 8, padding: 14, gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular" },
  fieldCard: { marginHorizontal: 20, marginTop: 12, padding: 16 },
  sectionLabel: { fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 12 },
  label: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 14, borderWidth: 1, gap: 10,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  badgeRow: {
    flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 14, borderWidth: 1, gap: 12,
  },
  badgeText: { flex: 1, fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", letterSpacing: 1 },
  submitContainer: { paddingHorizontal: 20, marginTop: 24 },
  submitButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, gap: 10,
  },
  submitText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
