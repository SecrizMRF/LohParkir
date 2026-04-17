import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, MaterialCommunityIcons } from "@/components/Icon";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="admin">
          <Icon sf={{ default: "shield", selected: "shield.fill" }} />
          <Label>Admin</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "qrcode.viewfinder", selected: "qrcode.viewfinder" }} />
        <Label>Scan</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Icon sf={{ default: "doc.text", selected: "doc.text.fill" }} />
        <Label>Laporan</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="payments">
        <Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <Label>Riwayat</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="peta-rawan">
        <Icon sf={{ default: "star", selected: "star.fill" }} />
        <Label>Poin</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout({ isAdmin }: { isAdmin: boolean }) {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      initialRouteName={isAdmin ? "admin" : "index"}
      screenOptions={{
        tabBarActiveTintColor: "#1565C0",
        tabBarInactiveTintColor: "#757575",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#FFFFFF",
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: "#E0E0E0",
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "AtkinsonHyperlegible_700Bold",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scan",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="qrcode.viewfinder" tintColor={color} size={22} />
            ) : (
              <MaterialCommunityIcons name="qrcode-scan" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Laporan",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="doc.text" tintColor={color} size={22} />
            ) : (
              <Feather name="file-text" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Riwayat",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="clock" tintColor={color} size={22} />
            ) : (
              <Feather name="clock" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="peta-rawan"
        options={{
          title: "Poin",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="star" tintColor={color} size={22} />
            ) : (
              <MaterialCommunityIcons name="star" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="shield" tintColor={color} size={22} />
            ) : (
              <Feather name="shield" size={20} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { userRole } = useApp();
  const isAdmin = userRole === "admin";
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout isAdmin={isAdmin} />;
  }
  return <ClassicTabLayout isAdmin={isAdmin} />;
}
