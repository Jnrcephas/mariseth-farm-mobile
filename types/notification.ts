export interface AppNotification {
  id: number;
  title: string;
  message?: string | null;
  body?: string | null;
  is_read?: boolean;
  read?: boolean;
  date_created?: string;
  created_at?: string;
  type?: string;
  link?: string | null;
}

export interface NotificationListResponse {
  results: AppNotification[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  unread_count?: number;
}
