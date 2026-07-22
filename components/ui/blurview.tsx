import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet } from "react-native";
import AppText from "./apptext";
type blurViewprops = {
  type: "welcome" | "loading";
};
const Blurview = () => {
  return (
    <BlurView
      intensity={100}
      tint="dark"
      //   experimentalBlurMethod="dimezisBlurView"
      style={styles.blur}
    >
      <AppText
        fontFamily="Bold"
        fontSize={26}
        color="white"
        style={{ lineHeight: 36, marginBottom: 6 }}
      >
        Our passion for agriculture is at the heart of everything we do.
      </AppText>

      <AppText fontFamily="Regular" fontSize={15} color="white">
        Africa's Leading Farm
      </AppText>
    </BlurView>
  );
};

export default Blurview;

const styles = StyleSheet.create({
  blur: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: "hidden",
    borderRadius: 20,
    marginBottom: 35,
  },
});
