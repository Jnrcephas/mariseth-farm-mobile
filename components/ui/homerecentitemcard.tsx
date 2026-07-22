import { colors } from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
import InitialsAvatar from "./initialsavatar";

interface HomeRecentItemCardProps {
  title: string;
  subtitle?: string;
  showNewBadge?: boolean;
  onPress?: () => void;
}

const HomeRecentItemCard: React.FC<HomeRecentItemCardProps> = ({
  title,
  subtitle,
  showNewBadge,
  onPress,
}) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <InitialsAvatar name={title} containerSize={40} fontSize={12} />

      <View style={styles.textColumn}>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText fontFamily="Medium" fontSize={13} color="textPrimary">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {showNewBadge ? (
        <View style={styles.badge}>
          <AppText fontFamily="Medium" fontSize={10} style={styles.badgeText}>
            New
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
};

export default HomeRecentItemCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 72,
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    alignItems: "center",
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
    gap: 2,
  },
  badge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 11,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "center",
  },
  badgeText: {
    color: "#14803D",
  },
});
