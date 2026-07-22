import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import { isIOS } from "@/constants/generalconstants";
import { images } from "@/constants/images";
import { authStyles } from "@/styles/auth";
import { BlurView } from "expo-blur";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WelcomeGlassCard = ({ children }: { children: React.ReactNode }) => {
  if (isIOS) {
    return (
      <BlurView intensity={42} tint="dark" style={authStyles.blur}>
        {children}
      </BlurView>
    );
  }

  return <View style={[authStyles.blur, authStyles.androidGlass]}>{children}</View>;
};

const Index = () => {
  const bottomInset = useSafeAreaInsets().bottom;

  return (
    <ImageBackground
      style={{ flex: 1 }}
      contentFit="cover"
      source={images.welcomeBg}
    >
      <View
        style={[
          authStyles.welcomeContainer,
          { paddingBottom: bottomInset + 25 },
        ]}
      >
        <WelcomeGlassCard>
          <AppText
            fontFamily="Bold"
            fontSize={26}
            color="white"
            style={{ lineHeight: 36, marginBottom: 4 }}
          >
            Our passion for agriculture is at the heart of everything we do.
          </AppText>

          <AppText fontFamily="Regular" fontSize={15} color="white">
            Africa&apos;s Leading Farm
          </AppText>
        </WelcomeGlassCard>

        <AppButton
          title="Get Started"
          textColor="white"
          btnColor="buttonSecondary"
          height={48}
          borderRadius={8}
          fontSize={16}
          style={authStyles.welcomeButton}
          onPress={() => {
            router.navigate("/signup");
          }}
        />

        <Pressable
          onPress={() => router.navigate("/signin")}
          style={authStyles.welcomeFooter}
        >
          <AppText fontFamily="Regular" color="formLabelText" fontSize={14}>
            Already have an account?
          </AppText>
          <AppText fontFamily="SemiBold" color="formLabelText" fontSize={14}>
            Sign in
          </AppText>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

export default Index;
