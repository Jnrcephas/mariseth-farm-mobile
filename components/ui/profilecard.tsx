import { user } from "@/types/user";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
import InitialsAvatar from "./initialsavatar";

interface profileCard {
  item: user | null;
  readonly?: boolean;
}

export const formatPhoneDisplay = (phone?: string) => {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("233") ? digits : `233${digits}`;

  if (normalized.length >= 12) {
    return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
  }

  return `+${normalized}`;
};

const ProfileCard: React.FC<profileCard> = ({ item, readonly = false }) => {
  const fullName = `${item?.first_name ?? ""} ${item?.last_name ?? ""}`.trim();
  const type = item?.farmer?.type;
  const formattedType = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "";
  const phone = formatPhoneDisplay(item?.phone_number);
  const subtitle = [formattedType ? `${formattedType} Farmer` : "", phone]
    .filter(Boolean)
    .join(" · ");

  const content = (
    <>
      <InitialsAvatar
        name={fullName}
        fontSize={22}
        containerSize={54}
        bgColor="grey"
        textColor="black"
      />

      <View style={styles.profileCardTextContainer}>
        <AppText
          fontSize={16}
          fontFamily="SemiBold"
          color="textBold"
          style={styles.name}
        >
          {fullName}
        </AppText>

        {subtitle ? (
          <AppText fontSize={12} fontFamily="Medium" color="textPrimary">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <Image source={icons.arrowLeft} style={styles.trailingIcon} />
    </>
  );

  if (readonly) {
    return <View style={styles.profileCardContainer}>{content}</View>;
  }

  return (
    <Pressable
      style={styles.profileCardContainer}
      onPress={() => router.navigate("/more/profileinformation")}
    >
      {content}
    </Pressable>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  profileCardContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileCardTextContainer: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 12,
    gap: 4,
  },
  name: {
    lineHeight: 19,
  },
  trailingIcon: {
    width: 24,
    height: 24,
    tintColor: "#694187",
    transform: [{ scaleX: -1 }],
  },
});
