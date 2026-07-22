import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface HomeHeroBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const HomeHeroBackground: React.FC<HomeHeroBackgroundProps> = ({
  children,
  style,
}) => {
  return (
    <LinearGradient
      colors={["#418744", "#23A325", "#438741"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, style]}
    >
      {children}
    </LinearGradient>
  );
};

export default HomeHeroBackground;

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    paddingTop: 16,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
});
