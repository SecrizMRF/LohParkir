import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp, type Payment } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function PaymentItem({ item }: { item: Payment }) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.icon, { backgroundColor: colors.success + "15" }]}>
          <Feather name="credit-card" size={18} color={colors.success} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.txnId, { color: colors.foreground }]}>{item.transactionId}</Text>
          <Text style={[styles.officer, { color: colors.mutedForeground }]}>{item.officerName}</Text>
        </View>
        <Text style={[styles.amount, { color: colors.success }]}>
          Rp {item.amount.toLocaleString("id-ID")}
        </Text>
      </View>
      <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.area || "-"}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="tag" size={12} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {(item.method || "qris").toUpperCase()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {new Date(item.createdAt).toLocaleDateString("id-ID")}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function PaymentsScreen() {
  const colors = useColors();
  const { payments, refreshData, dashboardStats } = useApp();

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.summaryCard, { backgroundColor: colors.primary + "10" }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              Rp {dashboardStats.totalRevenue.toLocaleString("id-ID")}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Pembayaran</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {dashboardStats.totalPayments}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Transaksi</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PaymentItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={payments.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="credit-card" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Belum Ada Pembayaran</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Riwayat pembayaran parkir akan muncul di sini
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: Platform.OS === "web" ? 67 + 16 : 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  card: { padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  txnId: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  officer: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  amount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  detailRow: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    gap: 16,
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
});
