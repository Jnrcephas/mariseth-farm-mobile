import type { ConfigContext, ExpoConfig } from "@expo/config";

const appVariant = process.env.EXPO_PUBLIC_APP_ENV || "production";

// console.log("APP VARIANT", appVariant);

const appConfig: Record<
  string,
  {
    name: string;
    bundleIdAndroid: string;
    bundleIdIOS: string;
    slug: string;
    scheme: string;
  }
> = {
  development: {
    name: "Mariseth (Staging)",
    bundleIdAndroid: `com.marisethfarms.android.stage`,
    bundleIdIOS: `com.marisethfarms.app.ios.stage`,
    slug: "mariseth_farms_stage",
    scheme: "marisethfarmsstage",
  },
  production: {
    name: "Mariseth Farms",
    bundleIdAndroid: `com.marisethfarms.android`,
    bundleIdIOS: `com.marisethfarms.app.ios`,
    slug: "mariseth_farms",
    scheme: "marisethfarms",
  },
};
const app = appConfig[appVariant] || appConfig.production;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: app?.name,
  slug: app?.slug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/appicons/adaptive-icon.png",
  scheme: app.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: app?.bundleIdIOS,
    version: "1.0.0",
    icon: {
      dark: "./assets/images/appicons/ios-dark.png",
      light: "./assets/images/appicons/ios-light.png",
      tinted: "./assets/images/appicons/ios-dark.png",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/appicons/adaptive-icon.png",
      monochromeImage: "./assets/images/appicons/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: false,
    package: app?.bundleIdAndroid,
    version: "1.0.0",
    versionCode: 1,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/appicons/adaptive-icon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/appicons/splash-icon-light.png",
        imageWidth: 166,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/images/appicons/splash-icon-dark.png",
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          newArchEnabled: true,
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          useLegacyPackaging: true,
        },
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    "expo-font",
  ],
  experiments: {
    typedRoutes: true,
  },
});
