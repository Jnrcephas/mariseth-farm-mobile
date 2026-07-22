import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useStore } from "zustand";

interface NotificationButtonProps {
  iconTintColor?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  iconTintColor = colors.primary,
}) => {
  const unreadCount = useStore(
    userStore,
    (state) => state.unreadNotificationCount
  );

  return (
    <Pressable
      style={styles.notificationButton}
      onPress={() => router.push("/notifications")}
    >
      <Image
        source={icons.notification}
        style={styles.notificationIcon}
        tintColor={iconTintColor}
      />
      {unreadCount > 0 ? <View style={styles.notificationBadge} /> : null}
    </Pressable>
  );
};

export default NotificationButton;

const styles = StyleSheet.create({
  notificationButton: {
    position: "relative",
  },
  notificationIcon: {
    height: 24,
    width: 24,
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ED0D6B",
    borderWidth: 1,
    borderColor: colors.white,
  },
});
