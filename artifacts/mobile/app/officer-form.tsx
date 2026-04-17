import { Feather } from "@/components/Icon";
import { hapticNotification, showAlert } from "@/lib/platform";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function OfficerFormScreen() {
  const colors = useColors();
  const { addOfficer } = useApp();

  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState("2000");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !nip.trim() || !badgeNumber.trim() || !area.trim() || !location.trim()) {
      showAlert("Error", "NIP, nama, nomor badge, area, dan lokasi wajib diisi");
      return;
    }

    const badgePattern = /^DSH-\d{4}-\d{3}$/;
    if (!badgePattern.test(badgeNumber.trim().toUpperCase())) {
      showAlert("Error", "Format nomor badge harus DSH-YYYY-NNN (contoh: DSH-2024-004)");
      return;
    }

    setLoading(true);
    try {
      await hapticNotification();
      const officer = await addOfficer({
        nip: nip.trim(),
        name: name.trim(),
        badgeNumber: badgeNumber.trim().toUpperCase(),
        area: area.trim(),
        location: location.trim(),
        rate: Number(rate) || 2000,
        phone: phone.trim() || undefined,
      });

      showAlert(
        "Petugas Terdaftar",
        `${officer.name} telah berhasil didaftarkan.\n\nQR Code: ${officer.qrCode}`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      showAlert("Error", err.message || "Gagal mendaftarkan petugas.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "NIP", value: nip, onChange: setNip, placeholder: "Contoh: 198501012010011001", icon: "hash" as const, keyboardType: "numeric" as const },
    { label: "Nama Petugas", value: name, onChange: setName, placeholder: "Contoh: Budi Santoso", icon: "user" as const },
    { label: "Nomor Badge", value: badgeNumber, onChange: setBadgeNumber, placeholder: "Contoh: DSH-2024-004", icon: "credit-card" as const, autoCapitalize: "characters" as const },
    { label: "Area Kerja", value: area, onChange: setArea, placeholder: "Contoh: Zona D - Jl. Asia Afrika", icon: "map" as const },
    { label: "Lokasi", value: location, onChange: setLocation, placeholder: "Contoh: Jl. Asia Afrika No. 1-40", icon: "map-pin" as const },
    { label: "Tarif (Rp)", value: rate, onChange: setRate, placeholder: "2000", icon: "tag" as const, keyboardType: "numeric" as const },
    { label: "No. HP (opsional)", value: phone, onChange: setPhone, placeholder: "Contoh: 081234567893", icon: "phone" as const, keyboardType: "phone-pad" as const },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderRadius: colors.radius }]}
      >
        <Feather name="info" size={18} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primary }]}>
          QR Code otomatis dibuat: LOHPARKIR-[Badge]. Format badge: DSH-YYYY-NNN
        </Text>
      </View>

      {fields.map((field) => (
        <View
          key={field.label}
          style={[styles.fieldCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
        >
          <Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Feather name={field.icon} size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize={field.autoCapitalize || "words"}
              keyboardType={(field as any).keyboardType || "default"}
            />
          </View>
        </View>
      ))}

      <View style={styles.submitContainer}>
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: loading ? 0.6 : pressed ? 0.8 : 1,
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
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    marginBottom: 8,
    padding: 14,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular" },
  fieldCard: { marginHorizontal: 20, marginTop: 12, padding: 16 },
  label: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  submitContainer: { paddingHorizontal: 20, marginTop: 24 },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 10,
  },
  submitText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
