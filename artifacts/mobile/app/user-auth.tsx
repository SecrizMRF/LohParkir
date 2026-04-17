import { Feather, MaterialCommunityIcons } from "@/components/Icon";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { hapticImpact, hapticNotification, showAlert } from "@/lib/platform";

export default function UserAuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setUserRole, signInDemo } = useApp();

  const [mode, setMode] = useState<"choose" | "email">("choose");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const continueAsGuest = async () => {
    hapticImpact();
    await setUserRole("public");
    router.replace("/(tabs)");
  };

  const continueWithGoogle = async () => {
    hapticImpact();
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      await signInDemo({
        name: "Pengguna Google",
        email: "demo.google@gmail.com",
        provider: "google",
      });
      await hapticNotification();
      router.replace("/(tabs)");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEmail = async () => {
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      showAlert("Lengkapi data", "Mohon isi semua kolom terlebih dahulu.");
      return;
    }
    if (!email.includes("@")) {
      showAlert("Email tidak valid", "Mohon gunakan format email yang benar.");
      return;
    }
    hapticImpact();
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      await signInDemo({
        name: isSignup ? name.trim() : email.split("@")[0],
        email: email.trim(),
        provider: "email",
      });
      await hapticNotification();
      router.replace("/(tabs)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => {
            if (mode === "email") setMode("choose");
            else router.back();
          }}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: colors.card, borderRadius: 12, opacity: pressed ? 0.8 : 1 },
          ]}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {mode === "email" ? (isSignup ? "Daftar Akun" : "Masuk") : "Masuk Pengguna"}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroBlock}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary + "12" }]}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            {mode === "email"
              ? isSignup
                ? "Buat akun baru"
                : "Masuk dengan email"
              : "Selamat datang"}
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {mode === "email"
              ? "Akun memungkinkan Anda menyimpan poin & riwayat parkir."
              : "Pilih cara untuk melanjutkan ke LohParkir."}
          </Text>
        </View>

        {mode === "choose" ? (
          <View style={styles.optionList}>
            <Pressable
              onPress={continueWithGoogle}
              disabled={submitting}
              style={({ pressed }) => [
                styles.googleBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  opacity: pressed || submitting ? 0.85 : 1,
                },
              ]}
            >
              <View style={styles.googleIconWrap}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={[styles.googleText, { color: colors.foreground }]}>
                Lanjutkan dengan Google
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("email")}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Feather name="mail" size={20} color="#FFF" />
              <Text style={styles.primaryBtnText}>Masuk dengan Email</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>atau</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Pressable
              onPress={continueAsGuest}
              style={({ pressed }) => [
                styles.ghostBtn,
                {
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather name="user" size={18} color={colors.foreground} />
              <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>
                Lanjutkan sebagai Tamu
              </Text>
            </Pressable>

            <View style={[styles.demoNote, { backgroundColor: colors.warning + "12", borderRadius: colors.radius }]}>
              <MaterialCommunityIcons name="information" size={16} color={colors.warning} />
              <Text style={[styles.demoNoteText, { color: colors.warning }]}>
                Login email & Google saat ini masih versi demo, data tersimpan di perangkat.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.formBlock}>
            {isSignup && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Nama Lengkap</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.foreground,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                  placeholder="Nama Anda"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                placeholder="nama@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              onPress={submitEmail}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius,
                  opacity: pressed || submitting ? 0.85 : 1,
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsSignup((v) => !v)}
              style={({ pressed }) => [styles.switchRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
                {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}
              </Text>
              <Text style={[styles.switchAction, { color: colors.primary }]}>
                {isSignup ? "Masuk" : "Daftar"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "AtkinsonHyperlegible_700Bold" },
  content: { paddingHorizontal: 24, paddingTop: 12 },
  heroBlock: { alignItems: "center", marginBottom: 28 },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logo: { width: 56, height: 56 },
  heroTitle: { fontSize: 22, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 6 },
  heroSub: {
    fontSize: 13,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  optionList: { gap: 12 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    gap: 12,
    borderWidth: 1,
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  googleG: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#4285F4",
  },
  googleText: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    gap: 10,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular" },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    gap: 8,
    borderWidth: 1.5,
  },
  ghostBtnText: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
  demoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    marginTop: 12,
  },
  demoNoteText: { flex: 1, fontSize: 12, fontFamily: "AtkinsonHyperlegible_400Regular", lineHeight: 17 },
  formBlock: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
  input: { height: 50, paddingHorizontal: 14, fontSize: 15, fontFamily: "AtkinsonHyperlegible_400Regular", borderWidth: 1 },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  switchText: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular" },
  switchAction: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
