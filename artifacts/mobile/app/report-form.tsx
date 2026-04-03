import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

type ReportType = "illegal_parking" | "fake_qr";

export default function ReportFormScreen() {
  const colors = useColors();
  const { addReport } = useApp();
  const params = useLocalSearchParams<{ prefillType?: string; qrCode?: string }>();

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
      Alert.alert("Error", "Deskripsi laporan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const report = await addReport({
        type,
        description: description.trim(),
        photoUri,
        latitude,
        longitude,
      });

      Alert.alert(
        "Laporan Terkirim",
        `Nomor tiket: ${report.ticketNumber}\n\nLaporan Anda telah diterima dan akan segera ditindaklanjuti.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch {
      Alert.alert("Error", "Gagal mengirim laporan. Coba lagi.");
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
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
  typeLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  textArea: {
    height: 100,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
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
  photoButtonText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  locationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  locationText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1.5,
    gap: 8,
  },
  locationButtonText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  submitContainer: { paddingHorizontal: 20, marginTop: 24 },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
  },
  submitText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
