/**
 * Điểm import duy nhất cho tầng API: `import { managerApi, type ShiftResponse } from "@/lib/api"`.
 *
 * Cấu trúc:
 *   http.ts           – HTTP client, ApiError, helper crud/withQuery/uploadFile
 *   auth.ts           – đăng nhập, đăng ký, phiên
 *   admin.ts          – quản trị hệ thống
 *   manager/*         – API quản lý chuỗi theo domain (hr, schedule, operations, test)
 *   employee.ts       – tập con cho nhân viên
 *   storeManager.ts   – tập con cho trưởng cửa hàng
 *   types/*           – kiểu dữ liệu response / request
 */
export { API_BASE_URL, ApiError, request, http, crud, withQuery, uploadFile } from "./http";
export type { ApiResponse, Body } from "./http";

export { authApi } from "./auth";
export { adminUserApi, adminBrandApi, adminApiIntegration, adminCodeGenApi, adminNotificationApi } from "./admin";
export { managerApi, hrApi, scheduleApi, operationsApi, testApi } from "./manager";
export { employeeApi } from "./employee";
export { storeManagerApi } from "./storeManager";
export { notificationApi, broadcastApi, NOTIFICATION_PAGE_SIZE } from "./notification";
export type { NotificationStatus, NotificationTask, BroadcastAudience, BroadcastAudiences, BroadcastHistoryItem, BroadcastPriority } from "./notification";
export { statisticsApi } from "./statistics";

export type * from "./types/admin.types";
export type * from "./types/hr.types";
export type * from "./types/schedule.types";
export type * from "./types/operations.types";
export type * from "./types/test.types";
export type * from "./types/statistics.types";
