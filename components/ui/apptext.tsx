import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
export interface fontFamilyProps {
  fontFamily: "Regular" | "Medium" | "SemiBold" | "Bold";
}
interface AppTextProps extends TextProps {
  children: React.ReactNode;
  color?: keyof typeof colors;
  numberOfLines?: number;
  fontSize?: number;
  fontFamily?: fontFamilyProps["fontFamily"];
}

function AppText({
  children,
  color = "textPrimary",
  numberOfLines,
  fontSize = 17,
  fontFamily = "Regular",
  style,
  ...otherProps
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      {...otherProps}
      allowFontScaling={false}
      style={[
        styles.text,
        {
          color: colors[color],
          fontSize: fontSize,
          fontFamily: fontFamily,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 18 },
});

export default AppText;
