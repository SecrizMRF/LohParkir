import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";

const EMOJIS = [
  { icon: "emoticon-angry", label: "Buruk", color: "#B71C1C" },
  { icon: "emoticon-neutral", label: "Biasa", color: "#FBC02D" },
  { icon: "emoticon-happy", label: "Baik", color: "#1565C0" },
  { icon: "emoticon-excited", label: "Sangat Baik", color: "#1B5E20" },
] as const;

export default function RatingScreen() {
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();
  const params = useLocalSearchParams<{
    officerId: string;
    officerName: string;
    area: string;
    transactionId: string;
  }>();

  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = async (idx: number) => {
    setSelected(idx);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPoints(5);

    setTimeout(() => {
      router.dismissAll();
      router.replace("/(tabs)");
    }, 1500);
  };

  if (selected !== null) {
    return (
      <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
        <View style={[styles.centerContent, { paddingTop: Platform.OS === "web" ? 67 + 60 : insets.top + 60 }]}>
          <MaterialCommunityIcons
            name={EMOJIS[selected].icon as any}
            size={80}
            color={EMOJIS[selected].color}
          />
          <Text style={styles.thankTitle}>Terima Kasih!</Text>
          <Text style={styles.thankSub}>
            Rating Anda membantu meningkatkan kualitas layanan parkir.
          </Text>
          <View style={styles.bonusBadge}>
            <MaterialCommunityIcons name="star" size={24} color="#FBC02D" />
            <Text style={styles.bonusText}>+5 Poin ditambahkan!</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 + 40 : insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <Text style={styles.question}>
          Bagaimana pelayanan{"\n"}Pak/Bu {params.officerName}?
        </Text>

        <View style={styles.emojiRow}>
          {EMOJIS.map((emoji, idx) => (
            <Pressable
              key={emoji.label}
              onPress={() => handleSelect(idx)}
              style={({ pressed }) => [
                styles.emojiBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <MaterialCommunityIcons
                name={emoji.icon as any}
                size={56}
                color={emoji.color}
              />
              <Text style={[styles.emojiLabel, { color: emoji.color }]}>{emoji.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.bonusHint}>
          <MaterialCommunityIcons name="star" size={20} color="#FBC02D" />
          <Text style={styles.bonusHintText}>+5 Poin akan ditambahkan!</Text>
        </View>

        <Pressable
          onPress={() => {
            router.dismissAll();
            router.replace("/(tabs)");
          }}
          style={({ pressed }) => [
            styles.skipBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { alignItems: "center", paddingHorizontal: 24 },
  centerContent: { flex: 1, alignItems: "center", paddingHorizontal: 24 },

  question: {
    fontSize: 26,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 36,
  },

  emojiRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 32,
  },
  emojiBtn: {
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  emojiLabel: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },

  bonusHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  bonusHintText: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    fontStyle: "italic",
  },

  skipBtn: { paddingVertical: 12 },
  skipText: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textDecorationLine: "underline",
  },

  thankTitle: {
    fontSize: 28,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    marginTop: 24,
    marginBottom: 12,
  },
  thankSub: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },
  bonusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bonusText: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
});
