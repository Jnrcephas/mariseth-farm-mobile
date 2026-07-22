import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import AppText from "./apptext";
interface quickActionButtonProps {
  type: "credit" | "farmer";
  width?: any;
  flex?: number;
}
const QuickActionButton: React.FC<quickActionButtonProps> = ({
  type,
  width,
  flex,
}) => {
  const types: Record<
    string,
    { label: string; icon: keyof typeof icons; route: Href }
  > = {
    credit: {
      label: "Apply for Credit",
      icon: icons.cardAdd,
      route: "/credits/applycredit",
    },
    farmer: {
      label: "Add New Farmer",
      icon: icons.userAdd,
      route: `/myfarmers/addfarmer?data=""`,
    },
  };
  return (
    <Pressable
      style={[
        styles.quickActionButton,
        width ? { width } : { flex: flex ?? 1, minWidth: 0 },
      ]}
      onPress={() => {
        router.navigate(types[type].route);
      }}
    >
      <Image
        source={types[type].icon}
        style={styles.quickActionButtonIcon}
        tintColor={colors.primary}
      />

      <AppText
        fontFamily="SemiBold"
        fontSize={13}
        color="textBold"
        numberOfLines={2}
        style={styles.quickActionLabel}
      >
        {types[type].label}
      </AppText>
    </Pressable>
  );
};

export default QuickActionButton;

const styles = StyleSheet.create({
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10);",
    borderRadius: 12,
    paddingLeft: 14,
    backgroundColor: colors.backgroundPrimary,
  },
  quickActionButtonIcon: { height: 24, width: 24, marginRight: 12, flexShrink: 0 },
  quickActionLabel: {
    flexShrink: 1,
  },
});
