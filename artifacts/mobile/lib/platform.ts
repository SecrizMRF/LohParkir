import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function formatRupiah(amount: number): string {
  return `Rp${(amount || 0).toLocaleString("id-ID")}`;
}

type AlertButton = { text: string; style?: "cancel" | "destructive" | "default"; onPress?: () => void };
type AlertHandler = (title: string, message: string, buttons?: AlertButton[]) => void;

let customAlertHandler: AlertHandler | null = null;

export function setAlertHandler(handler: AlertHandler | null) {
  customAlertHandler = handler;
}

export function showAlert(title: string, message: string, buttons?: AlertButton[]) {
  if (customAlertHandler) {
    customAlertHandler(title, message, buttons);
    return;
  }
  if (Platform.OS === "web") {
    if (!buttons || buttons.length === 0) {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    if (buttons.length === 1) {
      window.alert(`${title}\n\n${message}`);
      buttons[0].onPress?.();
      return;
    }
    const actionable = buttons.filter((b) => b.style !== "cancel");
    if (actionable.length <= 1) {
      const confirmBtn = actionable[0];
      const result = window.confirm(`${title}\n\n${message}`);
      if (result) confirmBtn?.onPress?.();
      return;
    }
    const numbered = actionable.map((b, i) => `${i + 1}. ${b.text}`).join("\n");
    const input = window.prompt(`${title}\n\n${message}\n\n${numbered}\n\nKetik nomor pilihan, atau Batal.`);
    if (input == null) return;
    const idx = parseInt(input.trim(), 10) - 1;
    if (idx >= 0 && idx < actionable.length) {
      actionable[idx].onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}

export async function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) {
  try {
    await Haptics.impactAsync(style);
  } catch {}
}

export async function hapticNotification(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) {
  try {
    await Haptics.notificationAsync(type);
  } catch {}
}
