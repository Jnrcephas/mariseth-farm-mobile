import AppText from "@/components/ui/apptext";
import InitialsAvatar from "@/components/ui/initialsavatar";
import NotificationButton from "@/components/ui/notificationbutton";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const AdminHomeHeader = () => {
  const user = userStore((state) => state.user);
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.profileSection}
        onPress={() => router.navigate("/more/profileinformation")}
      >
        <InitialsAvatar
          name={fullName}
          containerSize={40}
          fontSize={14}
          bgColor="white"
          textColor="primary"
        />
        <AppText
          fontFamily="Regular"
          fontSize={14}
          color="white"
          numberOfLines={1}
          style={styles.name}
        >
          {fullName}
        </AppText>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.filterChip}>
          <Image
            source={icons.dialog}
            style={styles.filterIcon}
            tintColor="#94A3B8"
          />
          <AppText fontFamily="Regular" fontSize={14} color="white">
            Last 7 days
          </AppText>
          <Image
            source={icons.arrowDown}
            style={styles.filterArrow}
            tintColor={colors.white}
          />
        </Pressable>

        <NotificationButton iconTintColor={colors.white} />
      </View>
    </View>
  );
};

export default AdminHomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  name: {
    maxWidth: 110,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(248, 250, 252, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterIcon: {
    width: 24,
    height: 24,
  },
  filterArrow: {
    width: 16,
    height: 16,
  },
  notificationButton: {
    position: "relative",
  },
  notificationIcon: {
    width: 24,
    height: 24,
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
