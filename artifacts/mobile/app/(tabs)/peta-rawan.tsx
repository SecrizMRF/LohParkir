import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
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

const REWARDS = [
  { id: 1, name: "Gratis Parkir 1x", cost: 25, icon: "ticket-confirmation" as const },
  { id: 2, name: "Diskon Langganan Bulanan 10%", cost: 100, icon: "percent" as const },
];

export default function PoinScreen() {
  const insets = useSafeAreaInsets();
  const { points } = useApp();

  const nextReward = REWARDS.find((r) => r.cost > points) || REWARDS[REWARDS.length - 1];
  const progressPercent = Math.min((points / nextReward.cost) * 100, 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.pointsValue}>{points}</Text>
        <Text style={styles.pointsLabel}>Poin Parkir</Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {points} / {nextReward.cost} poin menuju {nextReward.name}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Tukar Hadiah</Text>

      {REWARDS.map((reward) => {
        const canRedeem = points >= reward.cost;
        return (
          <View key={reward.id} style={styles.rewardCard}>
            <View style={styles.rewardInfo}>
              <MaterialCommunityIcons name={reward.icon} size={32} color="#1565C0" />
              <View style={styles.rewardText}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardCost}>Butuh {reward.cost} Poin</Text>
              </View>
            </View>
            <Pressable
              disabled={!canRedeem}
              onPress={() => {}}
              style={({ pressed }) => [
                styles.redeemBtn,
                {
                  backgroundColor: canRedeem ? "#1565C0" : "#E0E0E0",
                  opacity: !canRedeem ? 0.6 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[styles.redeemBtnText, { color: canRedeem ? "#FFF" : "#757575" }]}>
                TUKAR
              </Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#1565C0" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Cara Mendapat Poin</Text>
          <Text style={styles.infoText}>
            {"\u2022"} Setiap pembayaran parkir: 1 poin per Rp 1.000{"\n"}
            {"\u2022"} Rating jukir setelah parkir: +5 poin bonus
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 48,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#FBC02D",
  },
  pointsLabel: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    marginBottom: 24,
  },
  progressWrap: { width: "100%" },
  progressBar: {
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: 12,
    backgroundColor: "#1B5E20",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 22,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  rewardCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
  },
  rewardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  rewardText: { flex: 1 },
  rewardName: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  rewardCost: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginTop: 4,
  },
  redeemBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemBtnText: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },

  infoCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#424242",
    lineHeight: 22,
  },
});
