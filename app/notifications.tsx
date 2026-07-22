import AppText from "@/components/ui/apptext";
import CustomList from "@/components/ui/customlist";
import ErrorComponent from "@/components/ui/errorcomponent";
import NotificationCard from "@/components/ui/notificationcard";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { icons } from "@/constants/icons";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { AppNotification } from "@/types/notification";
import { countUnreadNotifications } from "@/utils/notificationhelpers";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const syncNotificationState = (items: AppNotification[]) => {
  const unread = countUnreadNotifications(items);
  const { unreadNotificationCount } = userStore.getState();

  if (unreadNotificationCount === unread) return;

  userStore.setState({
    notifications: items,
    unreadNotificationCount: unread,
  });
};

const Notifications = () => {
  const topInset = useSafeAreaInsets().top;
  const isFocused = useIsFocused();

  const {
    items,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    error,
  } = usePaginatedInfiniteQuery<AppNotification>(
    endpoints.notifications,
    "notifications",
    {
      page_size: 20,
      query: "",
    },
    { retry: false }
  );

  const { mutate: markAsRead } = useAuthMutation(
    endpoints.markNotificationRead,
    "POST",
    "mark-notification-read"
  );

  const { mutate: markAllAsRead, isLoading: isMarkingAllRead } =
    useAuthMutation(
      endpoints.markAllNotificationsRead,
      "POST",
      "mark-all-notifications-read",
      {
        onSuccess: () => {
          if (!isFocused) return;

          setLocallyReadIds(new Set(items.map((item) => item.id)));
          syncNotificationState(
            items.map((item) => ({ ...item, is_read: true, read: true }))
          );
        },
      }
    );

  const [locallyReadIds, setLocallyReadIds] = React.useState<
    Set<string | number>
  >(() => new Set());

  const applyLocalReadState = (list: AppNotification[]) =>
    list.map((item) =>
      locallyReadIds.has(item.id)
        ? { ...item, is_read: true, read: true }
        : item
    );

  const isNotFound = (error as { status?: number } | null)?.status === 404;
  const showApiError = !!error && !isNotFound;
  const displayItems = applyLocalReadState(isNotFound ? [] : items);
  const unreadCount = countUnreadNotifications(displayItems);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleNotificationPress = (item: AppNotification) => {
    const alreadyRead = Boolean(item.is_read ?? item.read);

    if (!alreadyRead) {
      markAsRead({ notification_id: item.id });
      setLocallyReadIds((prev) => new Set(prev).add(item.id));
      syncNotificationState(
        items.map((entry) =>
          entry.id === item.id
            ? { ...entry, is_read: true, read: true }
            : entry
        )
      );
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: topInset + 12 }]}>
      <View style={styles.header}>
        <Pressable style={styles.headerLeft} onPress={handleBack}>
          <View style={styles.backButton}>
            <Image
              source={icons.arrowLeft}
              style={styles.backIcon}
              tintColor={colors.primary}
            />
          </View>
          <AppText fontFamily="SemiBold" fontSize={16} color="textBold">
            Notifications
          </AppText>
        </Pressable>

        {unreadCount > 0 ? (
          <Pressable
            onPress={() => markAllAsRead({})}
            disabled={isMarkingAllRead}
          >
            <AppText fontFamily="SemiBold" fontSize={13} color="primary">
              Mark all read
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : showApiError ? (
        <ErrorComponent
          type={(error as { problem?: string })?.problem as any}
          refetch={() => refetch()}
        />
      ) : (
        <CustomList
          data={displayItems}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          refetch={refetch}
          isRefetching={isRefetching}
          type="notifications"
          emptyVariant="inline"
          renderItem={({ item }: { item: AppNotification }) => (
            <NotificationCard item={item} onPress={handleNotificationPress} />
          )}
        />
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 90,
    backgroundColor: colors.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
});
