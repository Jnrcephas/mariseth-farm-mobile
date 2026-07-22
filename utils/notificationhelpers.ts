import { AppNotification } from "@/types/notification";

export const getNotificationMessage = (item: AppNotification) =>
  item.message ?? item.body ?? "";

export const isNotificationRead = (item: AppNotification) =>
  Boolean(item.is_read ?? item.read);

export const getNotificationDate = (item: AppNotification) =>
  item.date_created ?? item.created_at ?? "";

export const countUnreadNotifications = (items: AppNotification[]) =>
  items.filter((item) => !isNotificationRead(item)).length;
