import AppText from "@/components/ui/apptext";
import { isIOS } from "@/constants/generalconstants";
import { images } from "@/constants/images";
import { authStyles } from "@/styles/auth";
import { BlurView } from "expo-blur";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface authLoadingProps {
  visible: boolean;
}

const AuthLoading: React.FC<authLoadingProps> = ({ visible }) => {
  const bottomInset = useSafeAreaInsets().bottom;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => {
      animation.stop();
      spin.setValue(0);
    };
  }, [visible, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
    >
      <ImageBackground
        style={styles.background}
        contentFit="cover"
        source={images.authLoadingBg}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.31)", "rgba(0,0,0,1)"]}
          style={[StyleSheet.absoluteFillObject, styles.gradientOverlay]}
        />

        <View
          style={[
            authStyles.welcomeContainer,
            styles.container,
            { paddingBottom: bottomInset + 60 },
          ]}
        >
          <BlurView
            intensity={isIOS ? 40 : 80}
            tint="dark"
            style={authStyles.authLoadingCard}
          >
            <AppText
              fontFamily="Bold"
              fontSize={26}
              color="white"
              style={styles.message}
            >
              Hang in there, we're signing you in.
            </AppText>

            <Animated.View
              style={[styles.spinnerWrap, { transform: [{ rotate }] }]}
            >
              <View style={styles.spinnerRing} />
            </Animated.View>
          </BlurView>
        </View>
      </ImageBackground>
    </Modal>
  );
};

export default AuthLoading;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  gradientOverlay: {
    opacity: 0.45,
  },
  container: {
    paddingHorizontal: 16,
  },
  message: {
    lineHeight: 36,
    textAlign: "center",
    marginBottom: 19,
    paddingHorizontal: 18,
  },
  spinnerWrap: {
    width: 42,
    height: 42,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: "#23A369",
    borderRightColor: "#3CE686",
  },
});
