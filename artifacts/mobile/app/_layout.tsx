import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from "@expo-google-fonts/atkinson-hyperlegible";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Kembali",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "AtkinsonHyperlegible_700Bold" },
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan-result" options={{ title: "Hasil Verifikasi", headerShown: false }} />
      <Stack.Screen name="report-form" options={{ title: "Buat Laporan" }} />
      <Stack.Screen name="payment" options={{ title: "Pembayaran", headerShown: false }} />
      <Stack.Screen name="officer-form" options={{ title: "Tambah Petugas" }} />
      <Stack.Screen name="report-detail" options={{ title: "Detail Laporan" }} />
      <Stack.Screen name="officers-list" options={{ title: "Daftar Petugas" }} />
      <Stack.Screen name="reports-manage" options={{ title: "Kelola Laporan" }} />
      <Stack.Screen name="rating" options={{ title: "Rating Jukir", headerShown: false }} />
      <Stack.Screen name="karcis" options={{ title: "Karcis Digital", headerShown: false }} />
      <Stack.Screen name="officer-dashboard" options={{ title: "Dashboard Petugas", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    "material-community": require("../assets/fonts/MaterialCommunityIcons.ttf"),
    "Feather": require("../assets/fonts/Feather.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
