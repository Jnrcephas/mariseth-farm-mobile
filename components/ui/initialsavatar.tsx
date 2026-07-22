import { colors } from "@/constants/colors";
import { getInitials } from "@/utils/commonmethods";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import AppText from "./apptext";
interface initialsAvatarProps {
  name: string;
  bgColor?: keyof typeof colors;
  containerSize?: number;
  fontSize?: number;
  textColor?: keyof typeof colors;
  onPress?: () => void;
}
const InitialsAvatar: React.FC<initialsAvatarProps> = React.memo(
  ({
    name,
    bgColor = "secondary",
    containerSize = 35,
    textColor = "primary",
    onPress,
    fontSize = 14,
  }) => {
    const initials = getInitials(name);

    return (
      <Pressable
        onPress={onPress}
        style={{
          height: containerSize,
          width: containerSize,
          backgroundColor: colors[bgColor],
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 100,
        }}
      >
        <AppText fontSize={fontSize} fontFamily="SemiBold" color={textColor}>
          {initials}
        </AppText>
      </Pressable>
    );
  }
);

export default InitialsAvatar;

const styles = StyleSheet.create({});
