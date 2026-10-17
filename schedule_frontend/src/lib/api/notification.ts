import { http, withQuery } from "./http";
import type { NotificationPage, NotificationResponse } from "./types/admin.types";

/** Số thông báo tối đa mỗi lần tải (backend cũng giới hạn 20). */
export const NOTIFICATION_PAGE_SIZE = 20;

export type NotificationStatus = "unread" | "read";

/** Thông báo của người dùng đang đăng nhập (chuông thông báo). */
export const notificationApi = {
  getMine: (status: NotificationStatus, page = 0) =>
    http.get<NotificationPage>(withQuery("/api/v1/notification/me", { status, page, size: NOTIFICATION_PAGE_SIZE })),
  getUnreadCount: () => http.get<{ unreadCount: number }>("/api/v1/notification/me/unread-count"),
  markRead: (id: number) => http.patch<NotificationResponse>(`/api/v1/notification/me/${id}/read`),
  markAllRead: () => http.patch<{ updated: number }>("/api/v1/notification/me/read-all"),
};
