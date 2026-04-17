import { Feather } from "@/components/Icon";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
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
import { hapticImpact, hapticNotification, showAlert } from "@/lib/platform";

type ReportType = "illegal_parking" | "fake_qr";

export default function ReportFormScreen() {
  const colors = useColors();
  const { addReport, deviceId } = useApp();
  const params = useLocalSearchParams<{ prefillType?: string; qrCode?: string }>();
  const [successInfo, setSuccessInfo] = useState<{ ticket: string } | null>(null);

  const [type, setType] = useState<ReportType>(
    (params.prefillType as ReportType) || "illegal_parking",
  );
  const [description, setDescription] = useState(
    params.qrCode ? `QR Code mencurigakan: ${params.qrCode}` : "",
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setGettingLocation(true);
    try {
      if (Platform.OS === "web") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
              setLocationName(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
              setGettingLocation(false);
            },
            () => {
              setGettingLocation(false);
            },
          );
        } else {
          setGettingLocation(false);
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGettingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (address) {
          setLocationName(
            [address.street, address.city, address.region].filter(Boolean).join(", "),
          );
        }
      } catch {
        setLocationName(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch {
    } finally {
      setGettingLocation(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showAlert("Error", "Deskripsi laporan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      await hapticNotification();
      const report = await addReport({
        type,
        description: description.trim(),
        photoUrl: photoUri,
        latitude,
        longitude,
        address: locationName || null,
        relatedQrCode: params.qrCode || null,
        reporterDeviceId: deviceId,
      } as any);

      setSuccessInfo({ ticket: report.ticketNumber });
    } catch (err: any) {
      showAlert("Error", err.message || "Gagal mengirim laporan. Coba lagi.");
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
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>Jenis Laporan</Text>
        <View style={styles.typeRow}>
          {[
            { value: "illegal_parking" as const, label: "Parkir Liar", icon: "map-pin" as const },
            { value: "fake_qr" as const, label: "QR Palsu", icon: "alert-triangle" as const },
          ].map((item) => (
            <Pressable
              key={item.value}
              onPress={() => {
                hapticImpact();
                setType(item.value);
              }}
              style={({ pressed }) => [
                styles.typeButton,
                {
                  backgroundColor: type === item.value ? colors.primary + "15" : colors.background,
                  borderColor: type === item.value ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={20}
                color={type === item.value ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: type === item.value ? colors.primary : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>Deskripsi</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
          placeholder="Jelaskan detail kejadian..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>Bukti Foto</Text>
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={[styles.photo, { borderRadius: colors.radius }]} />
            <Pressable
              onPress={() => setPhotoUri(null)}
              style={[styles.removePhoto, { backgroundColor: colors.destructive }]}
            >
              <Feather name="x" size={16} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [
              styles.photoButton,
              { borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="camera" size={24} color={colors.mutedForeground} />
            <Text style={[styles.photoButtonText, { color: colors.mutedForeground }]}>
              Ambil atau pilih foto
            </Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={styles.locationHeader}>
          <Text style={[styles.label, { color: colors.foreground }]}>Lokasi</Text>
          {gettingLocation && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        {locationName ? (
          <View style={[styles.locationInfo, { backgroundColor: colors.background, borderRadius: colors.radius }]}>
            <Feather name="map-pin" size={18} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.foreground }]}>{locationName}</Text>
          </View>
        ) : (
          <Pressable
            onPress={getLocation}
            style={({ pressed }) => [
              styles.locationButton,
              { borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="navigation" size={20} color={colors.primary} />
            <Text style={[styles.locationButtonText, { color: colors.primary }]}>
              Dapatkan lokasi saat ini
            </Text>
          </Pressable>
        )}
      </View>

      <Modal visible={!!successInfo} transparent animationType="fade" onRequestClose={() => { setSuccessInfo(null); router.back(); }}>
        <View style={styles.successBackdrop}>
          <View style={[styles.successCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}>
              <Feather name="check-circle" size={40} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Laporan Terkirim</Text>
            <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
              Laporan Anda telah diterima dan akan segera ditindaklanjuti oleh Dishub Kota Medan.
            </Text>
            <View style={[styles.successTicket, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.successTicketLabel, { color: colors.mutedForeground }]}>Nomor Tiket</Text>
              <Text style={[styles.successTicketValue, { color: colors.primary }]}>{successInfo?.ticket}</Text>
            </View>
            <Pressable
              onPress={() => { setSuccessInfo(null); router.back(); }}
              style={({ pressed }) => [styles.successBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={styles.successBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
              <Feather name="send" size={20} color="#FFF" />
              <Text style={styles.submitText}>Kirim Laporan</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginHorizontal: 20, marginTop: 16, padding: 16 },
  label: { fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 12 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1.5,
    gap: 8,
  },
  typeLabel: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_700Bold" },
  textArea: {
    height: 100,
    padding: 14,
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    borderWidth: 1,
  },
  photoContainer: { position: "relative" },
  photo: { width: "100%", height: 200, resizeMode: "cover" },
  removePhoto: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButton: {
    height: 120,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoButtonText: { fontSize: 13, fontFamily: "AtkinsonHyperlegible_400Regular" },
  locationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  locationText: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular", flex: 1 },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1.5,
    gap: 8,
  },
  locationButtonText: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_700Bold" },
  submitContainer: { paddingHorizontal: 20, marginTop: 24 },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
  },
  submitText: { color: "#FFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  successBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  successCard: { width: "100%", maxWidth: 420, padding: 28, alignItems: "center", gap: 14 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  successTitle: { fontSize: 20, fontFamily: "AtkinsonHyperlegible_700Bold" },
  successDesc: { fontSize: 14, fontFamily: "AtkinsonHyperlegible_400Regular", textAlign: "center", lineHeight: 20 },
  successTicket: {
    width: "100%", padding: 14, borderWidth: 1, alignItems: "center", marginTop: 8,
  },
  successTicketLabel: { fontSize: 11, fontFamily: "AtkinsonHyperlegible_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  successTicketValue: { fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", marginTop: 6, letterSpacing: 1 },
  successBtn: {
    width: "100%", height: 48, alignItems: "center", justifyContent: "center", marginTop: 12,
  },
  successBtnText: { color: "#FFF", fontSize: 15, fontFamily: "AtkinsonHyperlegible_700Bold" },
});
