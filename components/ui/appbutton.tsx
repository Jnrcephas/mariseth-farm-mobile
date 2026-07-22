import { colors } from "@/constants/colors";
import { largeScreen } from "@/constants/generalconstants";
import React, { FC } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import AppText from "./apptext";

type ButtonProps = {
  textColor: keyof typeof colors;
  title: string;
  btnColor: keyof typeof colors;
  fontSize?: number;
  style?: TouchableOpacityProps["style"];
  loading?: boolean;
  onPress?: () => void;
  borderWidth?: number;
  borderColor?: keyof typeof colors;
  height?: number;
  width?: any;
  borderRadius?: number;
  disabled?: boolean;
};
const AppButton: FC<ButtonProps> = ({
  textColor,
  title,
  btnColor,
  style,
  fontSize = largeScreen ? 16 : 15,
  onPress,
  loading = false,
  borderWidth = 0,
  borderColor,
  height = largeScreen ? 48 : 45,
  width = "100%",
  borderRadius = 10,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[
        style,
        {
          height: height,
          width: width,
          backgroundColor: colors[btnColor],
          justifyContent: "center",
          alignItems: "center",
          borderRadius: borderRadius,
          borderWidth: borderWidth,
          borderColor: borderColor && colors[borderColor],
          flexDirection: "row",
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator
          size={largeScreen ? "large" : "small"}
          color={colors.white}
        />
      ) : (
        <AppText fontSize={fontSize} color={textColor} fontFamily="SemiBold">
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({});
