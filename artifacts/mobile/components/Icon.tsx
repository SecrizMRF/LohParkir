import React from "react";
import { Image, Platform, type ImageStyle, type StyleProp } from "react-native";
import { Feather as FeatherVector, MaterialCommunityIcons as MCIVector } from "@expo/vector-icons";

const MCI_PNG: Record<string, any> = {
  "alert": require("../assets/icons/mci-alert.png"),
  "camera": require("../assets/icons/mci-camera.png"),
  "car": require("../assets/icons/mci-car.png"),
  "cash": require("../assets/icons/mci-cash.png"),
  "cash-multiple": require("../assets/icons/mci-cash-multiple.png"),
  "cellphone-arrow-down": require("../assets/icons/mci-cellphone-arrow-down.png"),
  "check-circle": require("../assets/icons/mci-check-circle.png"),
  "check-decagram": require("../assets/icons/mci-check-decagram.png"),
  "information": require("../assets/icons/mci-information.png"),
  "map-marker": require("../assets/icons/mci-map-marker.png"),
  "motorbike": require("../assets/icons/mci-motorbike.png"),
  "qrcode": require("../assets/icons/mci-qrcode.png"),
  "qrcode-scan": require("../assets/icons/mci-qrcode-scan.png"),
  "radar": require("../assets/icons/mci-radar.png"),
  "receipt": require("../assets/icons/mci-receipt.png"),
  "road-variant": require("../assets/icons/mci-road-variant.png"),
  "star": require("../assets/icons/mci-star.png"),
  "wallet": require("../assets/icons/mci-wallet.png"),
};

const FEATHER_PNG: Record<string, any> = {
  "alert-circle": require("../assets/icons/feather-alert-circle.png"),
  "arrow-left": require("../assets/icons/feather-arrow-left.png"),
  "camera": require("../assets/icons/feather-camera.png"),
  "check": require("../assets/icons/feather-check.png"),
  "chevron-right": require("../assets/icons/feather-chevron-right.png"),
  "clock": require("../assets/icons/feather-clock.png"),
  "edit": require("../assets/icons/feather-edit.png"),
  "edit-3": require("../assets/icons/feather-edit-3.png"),
  "file": require("../assets/icons/feather-file.png"),
  "file-text": require("../assets/icons/feather-file-text.png"),
  "inbox": require("../assets/icons/feather-inbox.png"),
  "info": require("../assets/icons/feather-info.png"),
  "lock": require("../assets/icons/feather-lock.png"),
  "log-in": require("../assets/icons/feather-log-in.png"),
  "log-out": require("../assets/icons/feather-log-out.png"),
  "map": require("../assets/icons/feather-map.png"),
  "map-pin": require("../assets/icons/feather-map-pin.png"),
  "message-square": require("../assets/icons/feather-message-square.png"),
  "navigation": require("../assets/icons/feather-navigation.png"),
  "play": require("../assets/icons/feather-play.png"),
  "plus": require("../assets/icons/feather-plus.png"),
  "search": require("../assets/icons/feather-search.png"),
  "send": require("../assets/icons/feather-send.png"),
  "shield": require("../assets/icons/feather-shield.png"),
  "tag": require("../assets/icons/feather-tag.png"),
  "trash-2": require("../assets/icons/feather-trash-2.png"),
  "user": require("../assets/icons/feather-user.png"),
  "user-plus": require("../assets/icons/feather-user-plus.png"),
  "users": require("../assets/icons/feather-users.png"),
  "x": require("../assets/icons/feather-x.png"),
};

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
};

const USE_PNG = Platform.OS === "android";

export function MaterialCommunityIcons({ name, size = 24, color = "#000", style }: IconProps) {
  if (USE_PNG && MCI_PNG[name]) {
    return (
      <Image
        source={MCI_PNG[name]}
        style={[{ width: size, height: size, tintColor: color }, style]}
        resizeMode="contain"
      />
    );
  }
  return <MCIVector name={name as any} size={size} color={color} style={style as any} />;
}

export function Feather({ name, size = 24, color = "#000", style }: IconProps) {
  if (USE_PNG && FEATHER_PNG[name]) {
    return (
      <Image
        source={FEATHER_PNG[name]}
        style={[{ width: size, height: size, tintColor: color }, style]}
        resizeMode="contain"
      />
    );
  }
  return <FeatherVector name={name as any} size={size} color={color} style={style as any} />;
}
