import { Feather } from "@/components/Icon";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = useColors();
  const iconColor = color || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    minWidth: 140,
    minHeight: 116,
    justifyContent: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: "AtkinsonHyperlegible_400Regular",
  },
});
