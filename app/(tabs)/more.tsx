import AppText from "@/components/ui/apptext";
import LogoutModal from "@/components/ui/logoutmodal";
import ProfileCard from "@/components/ui/profilecard";
import { colors } from "@/constants/colors";
import { moreLinks } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { moreLink } from "@/types/more";
import { isFieldOfficerExperience, isSmallholderUser } from "@/utils/userroles";
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

// Field officers/staff log in with admin accounts (see
// app/(auth)/staffsignin.tsx): no wallet (that's a farmer's own money), and
// a real password instead of a 4-digit PIN, so those two entries get
// swapped or dropped rather than reusing the farmer versions as-is.
const getLinksForRole = (isFieldOfficer: boolean) => {
  if (!isFieldOfficer) return moreLinks;

  return moreLinks
    .filter((item) => item.route !== "/more/wallet")
    .map((item) => {
      if (item.route === "/more/profileinformation") {
        return { ...item, route: "/more/staffinformation" as const };
      }
      if (item.route === "/more/changepin") {
        return {
          ...item,
          name: "Change Password",
          route: "/more/changepassword" as const,
        };
      }
      return item;
    });
};

const More = () => {
  const topInset = useSafeAreaInsets().top;
  const user = userStore((state) => state.user);
  const isSmallholder = isSmallholderUser(user);
  const isFieldOfficer = isFieldOfficerExperience(user);
  const links = getLinksForRole(isFieldOfficer);
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
        <ProfileCard
          item={user}
          route={isFieldOfficer ? "/more/staffinformation" : undefined}
        />

        <View style={styles.linksSection}>
          {links.map((item: moreLink, index: number) => {
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
                  source={icons.arrowRight}
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