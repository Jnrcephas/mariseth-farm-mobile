import { images } from "@/constants/images";
import { authStyles } from "@/styles/auth";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

const SplashView = () => {
  return (
    <View style={authStyles.splashContainer}>
      <Image
        source={images.splashIcon}
        style={authStyles.splashLogo}
        contentFit="contain"
      />
    </View>
  );
};

export default SplashView;
