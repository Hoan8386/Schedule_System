/**
 * Xuất / nhập toàn bộ database (.sql).
 * Backend không kiểm tra bảng quyền cho /api/v1/database (lần đầu database trống chưa có quyền nào):
 * cho phép ADMIN đang đăng nhập, hoặc header X-Setup-Key, hoặc nhập lần đầu khi chưa có tài khoản.
 */

import { notify } from "@/lib/toast";
import { API_BASE_URL, ACCESS_TOKEN_KEY, ApiError } from "./http";

export interface DatabaseStatus {
  /** Đã có ít nhất một tài khoản */
  initialized: boolean;
  /** Máy chủ có cấu hình DB_SETUP_KEY – nhập khi chưa đăng nhập phải gửi kèm */
  setupKeyRequired: boolean;
}

interface CallOptions {
  /** Gửi access token (trang admin). Màn hình đăng nhập không gửi để token hết hạn không gây 401. */
  withToken?: boolean;
  setupKey?: string;
}

function headersOf({ withToken, setupKey }: CallOptions) {
  const headers = new Headers();
  const token = withToken && typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (setupKey?.trim()) headers.set("X-Setup-Key", setupKey.trim());
  return headers;
}

async function call(path: string, init: RequestInit, options: CallOptions) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: headersOf(options) });
  } catch {
    throw new ApiError(`Không thể kết nối đến máy chủ backend (${API_BASE_URL}).`, 503);
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text || `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text) as { message?: string | string[]; error?: string };
      message = (Array.isArray(json.message) ? json.message.join(". ") : json.message) || json.error || message;
    } catch {
      // Không phải JSON
    }
    throw new ApiError(message, res.status);
  }
  return res;
}

const fileNameOf = (res: Response) =>
  /filename="?([^";]+)"?/i.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "schedule_system.sql";

export const databaseApi = {
  getStatus: async (): Promise<DatabaseStatus> => {
    const res = await call("/api/v1/database/status", {}, {});
    return ((await res.json()) as { data: DatabaseStatus }).data;
  },

  /** Tải file .sql về máy. */
  exportSql: async (options: CallOptions = { withToken: true }) => {
    try {
      const res = await call("/api/v1/database/export", {}, options);
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameOf(res);
      link.click();
      URL.revokeObjectURL(url);
      notify.success("Đã xuất database");
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : "Xuất database thất bại");
      throw cause;
    }
  },

  /** Ghi đè database bằng file .sql; trả về số câu lệnh đã chạy. */
  importSql: async (file: File, options: CallOptions = { withToken: true }) => {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await call("/api/v1/database/import", { method: "POST", body }, options);
      const statements = ((await res.json()) as { data: { statements: number } }).data.statements;
      notify.success(`Đã nhập database (${statements} câu lệnh)`);
      return statements;
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : "Nhập database thất bại");
      throw cause;
    }
  },
};
