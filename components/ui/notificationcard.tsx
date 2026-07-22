import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { AppNotification } from "@/types/notification";
import {
  getNotificationDate,
  getNotificationMessage,
  isNotificationRead,
} from "@/utils/notificationhelpers";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface NotificationCardProps {
  item: AppNotification;
  onPress: (item: AppNotification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onPress,
}) => {
  const read = isNotificationRead(item);
  const message = getNotificationMessage(item);
  const createdAt = getNotificationDate(item);
  const timeLabel = createdAt
    ? formatDistanceToNow(parseISO(createdAt), { addSuffix: true })
    : "";

  return (
    <Pressable
      style={[styles.container, !read && styles.containerUnread]}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.iconCircle,
            read ? styles.iconCircleRead : styles.iconCircleUnread,
          ]}
        >
          <Image
            source={icons.notification}
            style={styles.icon}
            tintColor={read ? colors.formPlaceholderText : colors.primary}
          />
        </View>
        {!read ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            fontFamily={read ? "Medium" : "SemiBold"}
            fontSize={14}
            color="textBold"
            style={styles.title}
            numberOfLines={2}
          >
            {item.title}
          </AppText>
          {timeLabel ? (
            <AppText
              fontFamily="Medium"
              fontSize={12}
              color="formPlaceholderText"
              style={styles.time}
            >
              {timeLabel}
            </AppText>
          ) : null}
        </View>

        {message ? (
          <AppText
            fontFamily="Regular"
            fontSize={13}
            color="textPrimary"
            numberOfLines={2}
            style={styles.message}
          >
            {message}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    paddingVertical: 16,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
  },
  containerUnread: {
    backgroundColor: colors.secondaryLight,
  },
  iconWrap: {
    position: "relative",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleUnread: {
    backgroundColor: colors.white,
  },
  iconCircleRead: {
    backgroundColor: colors.backgroundTertiary,
  },
  icon: {
    width: 22,
    height: 22,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ED0D6B",
    borderWidth: 1,
    borderColor: colors.white,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    lineHeight: 20,
  },
  time: {
    marginTop: 2,
    maxWidth: 88,
    textAlign: "right",
  },
  message: {
    lineHeight: 18,
  },
});
