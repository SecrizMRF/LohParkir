import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { setAlertHandler } from "@/lib/platform";

export type AlertButton = {
  text: string;
  style?: "cancel" | "destructive" | "default";
  onPress?: () => void;
};

type AlertPayload = {
  title: string;
  message: string;
  buttons: AlertButton[];
};

type AlertContextValue = {
  show: (title: string, message: string, buttons?: AlertButton[]) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function useCustomAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useCustomAlert must be used inside AlertProvider");
  return ctx;
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const [payload, setPayload] = useState<AlertPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  const show = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    setPayload({
      title: title || "",
      message: message || "",
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: "OK", style: "default" }],
    });
    setVisible(true);
  }, []);

  useEffect(() => {
    setAlertHandler((title, message, buttons) => show(title, message, buttons));
    return () => setAlertHandler(null);
  }, [show]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.92);
    }
  }, [visible]);

  const dismiss = (cb?: () => void) => {
    Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setVisible(false);
      setPayload(null);
      cb?.();
    });
  };

  const handlePress = (btn: AlertButton) => {
    dismiss(() => btn.onPress?.());
  };

  const isCancel = (b: AlertButton) => b.style === "cancel";
  const isDestructive = (b: AlertButton) => b.style === "destructive";

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {
          const cancelBtn = payload?.buttons.find(isCancel);
          if (cancelBtn) handlePress(cancelBtn);
          else dismiss();
        }}
      >
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              const cancelBtn = payload?.buttons.find(isCancel);
              if (cancelBtn) handlePress(cancelBtn);
            }}
          />
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderRadius: 18,
                transform: [{ scale }],
                shadowColor: "#000",
              },
            ]}
            pointerEvents="box-none"
          >
            {payload?.title ? (
              <Text style={[styles.title, { color: colors.foreground }]}>{payload.title}</Text>
            ) : null}
            {payload?.message ? (
              <Text style={[styles.message, { color: colors.mutedForeground }]}>{payload.message}</Text>
            ) : null}
            <View style={[styles.buttonsWrap, payload && payload.buttons.length === 2 ? styles.buttonsRow : styles.buttonsCol]}>
              {payload?.buttons.map((btn, idx) => {
                const tone = isDestructive(btn)
                  ? colors.destructive
                  : isCancel(btn)
                  ? colors.mutedForeground
                  : colors.primary;
                const bg = isDestructive(btn)
                  ? colors.destructive
                  : isCancel(btn)
                  ? "transparent"
                  : colors.primary;
                const fg = isCancel(btn) ? tone : "#FFFFFF";
                const borderColor = isCancel(btn) ? colors.border : "transparent";
                return (
                  <Pressable
                    key={`${btn.text}-${idx}`}
                    onPress={() => handlePress(btn)}
                    style={({ pressed }) => [
                      styles.btn,
                      payload && payload.buttons.length === 2 ? { flex: 1 } : { width: "100%" },
                      {
                        backgroundColor: bg,
                        borderColor,
                        borderWidth: isCancel(btn) ? 1 : 0,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.btnText, { color: fg }]} numberOfLines={1}>
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: "AtkinsonHyperlegible_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  buttonsWrap: {
    gap: 8,
  },
  buttonsRow: {
    flexDirection: "row",
  },
  buttonsCol: {
    flexDirection: "column",
  },
  btn: {
    paddingVertical: Platform.OS === "web" ? 12 : 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 14,
    fontFamily: "AtkinsonHyperlegible_700Bold",
  },
});
