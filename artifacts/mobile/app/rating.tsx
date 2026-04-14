import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

const RATING_LABELS = ["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"];
const RATING_CRITERIA = [
  { key: "friendliness", label: "Keramahan", icon: "smile" as const },
  { key: "cleanliness", label: "Kebersihan Area", icon: "wind" as const },
  { key: "security", label: "Keamanan", icon: "shield" as const },
];

export default function RatingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();
  const params = useLocalSearchParams<{
    officerId: string;
    officerName: string;
    area: string;
    transactionId: string;
  }>();

  const [ratings, setRatings] = useState<Record<string, number>>({
    friendliness: 0,
    cleanliness: 0,
    security: 0,
  });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;
  const allRated = Object.values(ratings).every((r) => r > 0);

  const handleSubmit = async () => {
    if (!allRated) {
      Alert.alert("Error", "Berikan rating untuk semua kategori");
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPoints(5);
    setSubmitted(true);
  };

  const StarRow = ({ criteriaKey, currentRating }: { criteriaKey: string; currentRating: number }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setRatings((prev) => ({ ...prev, [criteriaKey]: star }));
          }}
        >
          <MaterialCommunityIcons
            name={star <= currentRating ? "star" : "star-outline"}
            size={36}
            color={star <= currentRating ? "#F59E0B" : "#D1D5DB"}
          />
        </Pressable>
      ))}
    </View>
  );

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.submittedContent}>
          <View style={[styles.submittedCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <View style={[styles.submittedIconWrap, { backgroundColor: "#FEF3C7" }]}>
              <MaterialCommunityIcons name="star-circle" size={56} color="#F59E0B" />
            </View>
            <Text style={[styles.submittedTitle, { color: colors.foreground }]}>
              Terima Kasih!
            </Text>
            <Text style={[styles.submittedDesc, { color: colors.mutedForeground }]}>
              Rating Anda membantu meningkatkan kualitas layanan parkir di Kota Medan
            </Text>

            <View style={[styles.bonusCard, { backgroundColor: "#FEF3C7", borderRadius: colors.radius }]}>
              <MaterialCommunityIcons name="gift" size={22} color="#F59E0B" />
              <Text style={styles.bonusText}>+5 Poin Bonus telah ditambahkan!</Text>
            </View>

            <View style={styles.ratingsSummary}>
              {RATING_CRITERIA.map((c) => (
                <View key={c.key} style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{c.label}</Text>
                  <View style={styles.summaryStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialCommunityIcons
                        key={s}
                        name={s <= ratings[c.key] ? "star" : "star-outline"}
                        size={16}
                        color={s <= ratings[c.key] ? "#F59E0B" : "#D1D5DB"}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => {
              router.dismissAll();
              router.replace("/(tabs)");
            }}
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="home" size={20} color="#FFF" />
            <Text style={styles.doneButtonText}>Kembali ke Beranda</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.headerSection, { backgroundColor: "#FEF3C7" }]}>
        <MaterialCommunityIcons name="star-circle" size={48} color="#F59E0B" />
        <Text style={styles.headerTitle}>Rating Jukir</Text>
        <Text style={styles.headerDesc}>
          Berikan penilaian untuk layanan jukir {params.officerName}
        </Text>
      </View>

      <View style={[styles.officerBadge, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={[styles.officerAvatar, { backgroundColor: colors.primary + "10" }]}>
          <Feather name="user" size={24} color={colors.primary} />
        </View>
        <View style={styles.officerInfo}>
          <Text style={[styles.officerNameText, { color: colors.foreground }]}>{params.officerName}</Text>
          <Text style={[styles.officerArea, { color: colors.mutedForeground }]}>{params.area}</Text>
        </View>
      </View>

      {RATING_CRITERIA.map((criteria) => (
        <View key={criteria.key} style={[styles.criteriaCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={styles.criteriaHeader}>
            <View style={[styles.criteriaIcon, { backgroundColor: colors.primary + "10" }]}>
              <Feather name={criteria.icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.criteriaLabel, { color: colors.foreground }]}>{criteria.label}</Text>
            {ratings[criteria.key] > 0 && (
              <Text style={[styles.criteriaRatingLabel, { color: "#F59E0B" }]}>
                {RATING_LABELS[ratings[criteria.key]]}
              </Text>
            )}
          </View>
          <StarRow criteriaKey={criteria.key} currentRating={ratings[criteria.key]} />
        </View>
      ))}

      <View style={[styles.commentCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.commentLabel, { color: colors.foreground }]}>Komentar (Opsional)</Text>
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
          placeholder="Tulis komentar Anda..."
          placeholderTextColor={colors.mutedForeground}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.submitContainer}>
        <Pressable
          onPress={handleSubmit}
          disabled={!allRated}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: allRated ? "#F59E0B" : colors.muted,
              borderRadius: colors.radius,
              opacity: !allRated ? 0.5 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="send" size={20} color={allRated ? "#FFF" : colors.mutedForeground} />
          <Text style={[styles.submitText, { color: allRated ? "#FFF" : colors.mutedForeground }]}>
            Kirim Rating (+5 Poin Bonus)
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            router.dismissAll();
            router.replace("/(tabs)");
          }}
          style={({ pressed }) => [
            styles.skipButton,
            { borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Lewati</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  submittedContent: { paddingBottom: 40, paddingTop: 60 },
  headerSection: { padding: 28, alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#92400E" },
  headerDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#92400E", textAlign: "center" },
  officerBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    gap: 12,
  },
  officerAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  officerInfo: { flex: 1 },
  officerNameText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  officerArea: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  criteriaCard: { marginHorizontal: 20, marginTop: 12, padding: 16 },
  criteriaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  criteriaIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  criteriaLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  criteriaRatingLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  starRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  commentCard: { marginHorizontal: 20, marginTop: 12, padding: 16 },
  commentLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  commentInput: {
    height: 80,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  submitContainer: { paddingHorizontal: 20, marginTop: 20, gap: 12 },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderWidth: 1,
  },
  skipText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  submittedCard: { marginHorizontal: 20, padding: 28, alignItems: "center" },
  submittedIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  submittedTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 8 },
  submittedDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280, marginBottom: 20 },
  bonusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  bonusText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#92400E" },
  ratingsSummary: { width: "100%", gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryStars: { flexDirection: "row", gap: 2 },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 24,
    height: 52,
    gap: 10,
  },
  doneButtonText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
