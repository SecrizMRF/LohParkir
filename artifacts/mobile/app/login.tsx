import { Feather } from "@/components/Icon";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { showAlert } from "@/lib/platform";

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useApp();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = params.role === "officer" ? "officer" : "admin";
  const isOfficer = role === "officer";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAlert("Error", "Username dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim().toLowerCase(), password.trim());
      if (isOfficer) {
        router.replace("/officer-dashboard");
      } else {
        router.replace("/(tabs)/admin");
      }
    } catch (err: any) {
      showAlert("Login Gagal", err.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: 60,
        paddingTop: Platform.OS === "web" ? 32 : 24,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="arrow-left" size={20} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>Kembali</Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "12" }]}>
          <Feather name={isOfficer ? "users" : "shield"} size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {isOfficer ? "Login Juru Parkir" : "Login Admin Dishub"}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          {isOfficer
            ? "Masuk untuk menampilkan QR resmi parkir"
            : "Masuk untuk mengelola petugas dan laporan"}
        </Text>

        <View style={styles.fields}>
          <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="user" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder={isOfficer ? "Nomor Badge (cth: DSH-2024-001)" : "Username"}
              placeholderTextColor={colors.mutedForeground}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: loading ? 0.6 : pressed ? 0.8 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="log-in" size={18} color="#FFF" />
              <Text style={styles.submitText}>Masuk</Text>
            </>
          )}
        </Pressable>

        <View style={[styles.hint, { backgroundColor: colors.primary + "08", borderRadius: colors.radius }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.primary }]}>
            {isOfficer
              ? "Badge: DSH-2024-001 / petugas001"
              : "Admin: admin / admin123"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    gap: 8,
    alignSelf: "flex-start",
  },
  backText: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  card: { marginHorizontal: 20, padding: 28, alignItems: "center" },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 6 },
  desc: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular", textAlign: "center", marginBottom: 24 },
  fields: { width: "100%", gap: 12 },
  inputWrap: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 14, borderWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", height: 56, gap: 10, marginTop: 16 },
  submitText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginTop: 16, width: "100%" },
  hintText: { flex: 1, fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular" },
});
