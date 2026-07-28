import AppText from "@/components/ui/apptext";
import SplashView from "@/components/ui/splashview";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { userStore } from "@/stores/userstore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";
import { ToastProps } from "react-native-toast-notifications/lib/typescript/toast";
import { useStore } from "zustand";

SplashScreen.preventAutoHideAsync();

const SPLASH_MIN_MS = 2000;
const queryClient = new QueryClient();

export default function RootLayout() {
  SplashScreen.setOptions({
    fade: true,
    duration: 400,
  });

  const user = useStore(userStore, (state) => state.user);
  const [appReady, setAppReady] = React.useState(false);
  const [loaded] = useFonts({
    Regular: require("../assets/fonts/Inter-Regular.ttf"),
    Medium: require("../assets/fonts/Inter-Medium.ttf"),
    SemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
    Bold: require("../assets/fonts/Inter-Bold.ttf"),
  });

  React.useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      setAppReady(true);
    }, SPLASH_MIN_MS);

    return () => clearTimeout(timer);
  }, [loaded]);

  if (!appReady) {
    return <SplashView />;
  }

  const renderToastType = {
    custom_type: (toast: ToastProps) => (
      <View style={styles.toastContainer}>
        <Image source={images.logo} style={styles.toastImage} />
        <AppText fontSize={16} color="black" fontFamily="Regular">
          {toast.message}
        </AppText>
      </View>
    ),
  };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <ToastProvider offset={70} renderType={renderToastType}>
          <Stack>
            <Stack.Protected guard={!user}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={user !== null}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="more" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="myfarm" options={{ headerShown: false }} />
              <Stack.Screen name="myfarmers" options={{ headerShown: false }} />
              <Stack.Screen name="credits" options={{ headerShown: false }} />
              <Stack.Screen
                name="notifications"
                options={{
                  headerShown: false,
                  presentation: "modal",
                  animation: Platform.OS === "android" ? "none" : "default",
                }}
              />
            </Stack.Protected>
          </Stack>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: colors.white,
    borderRadius: 2000,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
    marginHorizontal: 30,
    marginBottom: 10,
  },
  toastImage: { width: 24, height: 24, marginRight: 10, borderRadius: 2000 },
});