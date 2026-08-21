import type { ConfigContext, ExpoConfig } from "@expo/config";

const appVariant = process.env.EXPO_PUBLIC_APP_ENV || "production";

// console.log("APP VARIANT", appVariant);

interface AppVariantConfig {
  name: string;
  bundleIdAndroid: string;
  bundleIdIOS: string;
  slug: string;
  scheme: string;
}

const appConfig: Record<string, AppVariantConfig> = {
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

const locationUsageDescription =
  "Mariseth Farms uses your location to help you mark your farm's boundary on the map and to power location-based features.";

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
    infoPlist: {
      NSLocationWhenInUseUsageDescription: locationUsageDescription,
      NSLocationAlwaysAndWhenInUseUsageDescription: locationUsageDescription,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSExceptionDomains: {
          "13.140.140.177": {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: true,
          },
        },
      },
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
    // react-native-maps uses Google Maps on Android (Apple Maps on iOS
    // needs no key, so nothing added under `ios` for that). Add
    // GOOGLE_MAPS_API_KEY_ANDROID to .env.dev / .env.prod - an Android
    // "Maps SDK for Android" key from Google Cloud Console, restricted
    // to this app's package name + SHA-1. Required for release builds;
    // without it the map renders blank/grey tiles.
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
      },
    },
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
          deploymentTarget: "16.0",
        },
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: locationUsageDescription,
        locationWhenInUsePermission: locationUsageDescription,
      },
    ],
    "expo-font",
    "expo-asset",
  ],
  experiments: {
    typedRoutes: true,
  },
});