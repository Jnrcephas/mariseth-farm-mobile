import AppText from "@/components/ui/apptext";
import LogoutModal from "@/components/ui/logoutmodal";
import ProfileCard from "@/components/ui/profilecard";
import { colors } from "@/constants/colors";
import { moreLinks } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { moreLink } from "@/types/more";
import { isSmallholderUser } from "@/utils/userroles";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getLinkLabel = (item: moreLink, isSmallholder: boolean) => {
  if (isSmallholder && item.route === "/more/changepin") {
    return "Change Password";
  }
  return item.name;
};

const More = () => {
  const topInset = useSafeAreaInsets().top;
  const user = userStore((state) => state.user);
  const isSmallholder = isSmallholderUser(user);
  const logoutModalVisible = useUniversalStore(
    (state) => state.logoutModalVisible
  );

  const handleLinkPress = (item: moreLink) => {
    if (item.variant === "logout") {
      useUniversalStore.setState({ logoutModalVisible: true });
      return;
    }

    if (item.route) {
      router.navigate(item.route);
    }
  };

  return (
    <>
      {logoutModalVisible && <LogoutModal />}
      <View
        style={[
          styles.moreContainer,
          {
            paddingTop: topInset + 20,
          },
        ]}
      >
        <ProfileCard item={user} />

        <View style={styles.linksSection}>
          {moreLinks.map((item: moreLink, index: number) => {
            const isLogout = item.variant === "logout";

            return (
              <Pressable
                key={index}
                style={[
                  styles.moreLinkContainer,
                  isLogout && styles.logoutLinkContainer,
                ]}
                onPress={() => handleLinkPress(item)}
              >
                <Image
                  source={item.icon}
                  style={[
                    styles.linkIcon,
                    isLogout && styles.logoutIcon,
                    isLogout && { tintColor: colors.error },
                  ]}
                />
                <AppText
                  fontSize={16}
                  fontFamily="Regular"
                  color={isLogout ? "error" : "textBold"}
                  style={styles.linkLabel}
                >
                  {getLinkLabel(item, isSmallholder)}
                </AppText>
                <Image
                  source={isLogout ? icons.arrowRight : icons.arrowDown}
                  style={[
                    styles.chevronIcon,
                    { tintColor: isLogout ? colors.error : colors.primary },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
};

export default More;

const styles = StyleSheet.create({
  moreContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 16,
  },
  linksSection: {
    marginTop: 31,
    gap: 8,
  },
  moreLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
    paddingVertical: 11,
  },
  logoutLinkContainer: {
    minHeight: 38,
    paddingVertical: 9,
  },
  linkIcon: {
    height: 24,
    width: 24,
    marginRight: 12,
    tintColor: colors.primary,
  },
  logoutIcon: {
    height: 20,
    width: 20,
    marginRight: 8,
  },
  linkLabel: {
    flex: 1,
    lineHeight: 19,
  },
  chevronIcon: {
    height: 16,
    width: 16,
  },
});
