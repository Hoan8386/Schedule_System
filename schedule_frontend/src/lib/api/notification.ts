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
  // Đánh dấu đã đọc diễn ra ngầm khi mở thông báo nên không hiện toast
  markRead: (id: number) => http.patch<NotificationResponse>(`/api/v1/notification/me/${id}/read`, undefined, { notify: false }),
  markAllRead: () => http.patch<{ updated: number }>("/api/v1/notification/me/read-all", undefined, { notify: false }),
};

export type BroadcastAudience = "ALL" | "SHIFT_TODAY" | "STORE_MANAGERS";
export type BroadcastPriority = "NORMAL" | "HIGH" | "URGENT";

export interface BroadcastAudiences {
  /** true: quản lý toàn chuỗi; false: chỉ các cửa hàng được quản lý */
  global: boolean;
  stores: { storeId: number; storeName: string }[];
  counts: Record<BroadcastAudience, number>;
}

export interface BroadcastHistoryItem {
  batchId: number;
  title: string;
  content: string;
  priority: BroadcastPriority;
  sentAt: string | null;
  recipients: number;
  readCount: number;
}

/** Phát thông báo trong ứng dụng tới nhân sự (quản lý / trưởng cửa hàng). */
export const broadcastApi = {
  getAudiences: (storeId?: number) =>
    http.get<BroadcastAudiences>(withQuery("/api/v1/notification/broadcast/audiences", { storeId })),
  send: (body: { audience: BroadcastAudience; storeId?: number; title: string; content: string; priority: BroadcastPriority }) =>
    http.post<{ batchId: number; recipients: number }>("/api/v1/notification/broadcast", body),
  getHistory: (limit = 10) =>
    http.get<BroadcastHistoryItem[]>(withQuery("/api/v1/notification/broadcast/history", { limit })),
};
