import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function showAlert(title: string, message: string, buttons?: Array<{ text: string; style?: "cancel" | "destructive" | "default"; onPress?: () => void }>) {
  if (Platform.OS === "web") {
    if (buttons && buttons.length > 1) {
      const confirmBtn = buttons.find((b) => b.style !== "cancel");
      const result = window.confirm(`${title}\n\n${message}`);
      if (result && confirmBtn?.onPress) {
        confirmBtn.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      if (buttons?.[0]?.onPress) buttons[0].onPress();
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
