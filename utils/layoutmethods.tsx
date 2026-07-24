import AppText from "@/components/ui/apptext";
import InitialsAvatar from "@/components/ui/initialsavatar";
import NotificationButton from "@/components/ui/notificationbutton";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import { Image } from "expo-image";
import { router } from "expo-router";

import { Pressable, StyleSheet, View } from "react-native";
import { useStore } from "zustand";

export function headerHandler(route_label?: string): any {
  return {
    headerBackVisible: false,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: colors.backgroundPrimary,
    },

    headerTitleAlign: "center",
    headerTitle: () => {
      return (
        <AppText fontFamily="SemiBold" fontSize={15} color="textBold">
          {route_label}
        </AppText>
      );
    },

    headerLeft: () => {
      return (
        <Pressable
          style={styles.backButtonContainer}
          onPressIn={() => {
            router.back();
          }}
        >
          <View style={styles.backIcon}>
            <Image source={icons.arrowLeft} style={{ width: 20, height: 20 }} />
          </View>
          <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
            Back
          </AppText>
        </Pressable>
      );
    },
  };
}

export function formScreenHeaderHandler(title: string) {
  return {
    headerBackVisible: false,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: colors.backgroundPrimary,
    },
    headerTitle: () => null,
    headerLeft: () => {
      return (
        <Pressable
          style={styles.applyCreditHeaderLeft}
          onPress={() => router.back()}
        >
          <View style={styles.applyCreditBackButton}>
            <Image
              source={icons.arrowLeft}
              style={{ width: 24, height: 24, tintColor: colors.primary }}
            />
          </View>
          <AppText fontFamily="SemiBold" fontSize={16} color="textBold">
            {title}
          </AppText>
        </Pressable>
      );
    },
    headerRight: () => {
      const user = useStore(userStore, (state) => state.user);
      const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

      return (
        <View style={styles.applyCreditHeaderRight}>
          <NotificationButton />

          <Pressable
            onPress={() => router.navigate("/more/profileinformation")}
          >
            <InitialsAvatar
              name={fullName}
              containerSize={34}
              fontSize={12}
            />
          </Pressable>
        </View>
      );
    },
  };
}

export function applyCreditHeaderHandler() {
  return formScreenHeaderHandler("Apply for Credit");
}

export function addFarmerHeaderHandler() {
  return formScreenHeaderHandler("Add New Farmer");
}

export function addFarmHeaderHandler() {
  return formScreenHeaderHandler("Add New Farm");
}

export function editProfileHeaderHandler() {
  return formScreenHeaderHandler("Edit My Information");
}

export function editLeadershipHeaderHandler() {
  return formScreenHeaderHandler("Edit Leadership & Experience");
}

export function changePinHeaderHandler() {
  return formScreenHeaderHandler("Change Pin");
}

export function walletHeaderHandler() {
  return formScreenHeaderHandler("Wallet");
}

export function marketPricesHeaderHandler() {
  return formScreenHeaderHandler("Market Prices");
}

export function tabScreenOptions(
  tabLabel: string,
  roleOptions?: {
    isAdmin?: boolean;
    isLeaderFarmer?: boolean;
    isSmallholder?: boolean;
    showLeadFarmerHome?: boolean;
    showFarmerHomeHeader?: boolean;
  }
) {
  const tabIcons: Record<string, string> = {
    Home: icons?.home,
    Credits: icons?.credits,
    "My Farm": icons?.farm,
    "My Farmers": icons?.farmers,
    Finance: icons?.money,
    More: icons?.more,
  };

  const isMore = tabLabel === "More";
  const isAdminHome = tabLabel === "Home" && roleOptions?.isAdmin;
  const isSmallholderTabHeader =
    !!roleOptions?.isSmallholder &&
    !roleOptions?.isAdmin &&
    (tabLabel === "Home" || tabLabel === "Credits" || tabLabel === "My Farm");
  const isFarmerHomeHeader =
    tabLabel === "Home" &&
    !isSmallholderTabHeader &&
    (roleOptions?.showFarmerHomeHeader ??
      roleOptions?.showLeadFarmerHome ??
      roleOptions?.isLeaderFarmer) &&
    !roleOptions?.isAdmin;

  return {
    headerShown: isMore || isAdminHome ? false : true,
    title: "",
    headerShadowVisible: false,

    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <Image
        source={tabIcons[tabLabel]}
        style={{
          height: 23,
          width: 23,
          tintColor: focused ? colors.tabBarActive : colors.tabBarInactive,
        }}
      />
    ),

    headerLeft: () => {
      if (isSmallholderTabHeader) {
        return (
          <AppText
            fontFamily="SemiBold"
            fontSize={18}
            color="textBold"
            style={{ marginLeft: 16 }}
          >
            {tabLabel}
          </AppText>
        );
      }

      if (isFarmerHomeHeader) {
        return (
          <AppText
            fontFamily="SemiBold"
            fontSize={18}
            color="textBold"
            style={{ marginLeft: 16 }}
          >
            Home
          </AppText>
        );
      }

      return (
        <AppText
          fontFamily="SemiBold"
          fontSize={18}
          color="textBold"
          style={{ marginLeft: 16 }}
        >
          {tabLabel}
        </AppText>
      );
    },

    headerRight: () => {
      const user = useStore(userStore, (state) => state.user);
      const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

      if (isSmallholderTabHeader) {
        return (
          <View style={styles.smallholderHeaderRight}>
            <NotificationButton />

            <Pressable
              onPress={() => router.navigate("/more/profileinformation")}
            >
              <InitialsAvatar
                name={fullName}
                containerSize={34}
                fontSize={12}
                bgColor="secondary"
                textColor="white"
              />
            </Pressable>
          </View>
        );
      }

      if (isFarmerHomeHeader) {
        return (
          <View style={styles.homeHeaderRight}>
            <NotificationButton />

            <Pressable onPress={() => router.navigate("/more/profileinformation")}>
              <InitialsAvatar
                name={fullName}
                containerSize={34}
                fontSize={12}
                bgColor="secondary"
                textColor="white"
              />
            </Pressable>
          </View>
        );
      }

      return (
        <View style={styles.defaultHeaderRight}>
          <InitialsAvatar
            name={fullName}
            onPress={() => {
              router.navigate("/more/profileinformation");
            }}
          />
        </View>
      );
    },
    tabBarLabel: ({ focused }: { focused: boolean }) => (
      <AppText
        fontSize={13}
        numberOfLines={1}
        color={focused ? "tabBarActive" : "tabBarInactive"}
        fontFamily={"SemiBold"}
      >
        {tabLabel}
      </AppText>
    ),
  };
}
export function tabbarScreenOptions() {
  return {
    tabBarAllowFontScaling: false,
    tabBarHideOnKeyboard: true,
    lazy: false,
  };
}

const styles = StyleSheet.create({
  backButtonContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
  },

  backIcon: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: colors.formBorder,
    padding: 5,
    marginRight: 9,
  },

  homeHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 20,
  },

  defaultHeaderRight: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  notificationButton: {
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ED0D6B",
    borderWidth: 1,
    borderColor: colors.white,
  },

  smallholderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 20,
  },

  applyCreditHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
    marginLeft: 16,
  },

  applyCreditBackButton: {
    width: 44,
    height: 44,
    borderRadius: 90,
    backgroundColor: colors.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  applyCreditHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 20,
  },
});
