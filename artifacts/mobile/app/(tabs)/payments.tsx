import { MaterialCommunityIcons } from "@/components/Icon";
import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type Payment } from "@/contexts/AppContext";
function PaymentItem({ item, onPress }: { item: Payment; onPress: () => void }) {
  const isCar = (item.amount || 0) >= 4000;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: "#FFF", borderRadius: 12, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: isCar ? "#E3F2FD" : "#E8F5E9" }]}>
        <MaterialCommunityIcons
          name={isCar ? "car" : "motorbike"}
          size={28}
          color={isCar ? "#1565C0" : "#1B5E20"}
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardPlate}>{(item as any).plateNumber || item.transactionId}</Text>
        <Text style={styles.cardMeta}>
          {new Date(item.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          {" | "}
          {item.area || "-"}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardAmount}>Rp {item.amount.toLocaleString("id-ID")}</Text>
        <View style={styles.successBadge}>
          <Text style={styles.successBadgeText}>SUKSES</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { payments, refreshData } = useApp();

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PaymentItem item={item} onPress={() => {}} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listTitle}>Riwayat Transaksi</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="receipt" size={48} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
            <Text style={styles.emptyDesc}>Riwayat pembayaran parkir akan muncul di sini</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listTitle: {
    fontSize: 26,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    gap: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardPlate: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  cardMeta: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    marginTop: 2,
  },
  cardRight: { alignItems: "flex-end", gap: 6 },
  cardAmount: {
    fontSize: 18,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
  },
  successBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  successBadgeText: {
    fontSize: 12,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#1B5E20",
  },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    color: "#424242",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 16,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#757575",
    textAlign: "center",
  },
});
