/**
 * HTTP client dùng chung cho mọi module API.
 * - Tự gắn access token, Content-Type JSON (trừ FormData).
 * - Chuẩn hóa response { statusCode, error, message, data } của backend.
 * - Lỗi luôn được ném dưới dạng ApiError (kế thừa Error).
 * - Thao tác thay đổi dữ liệu (POST/PUT/PATCH/DELETE) tự hiện toast thành công / thất bại theo response.
 */

import { notify, successMessage } from "@/lib/toast";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.n2.tinhgon.xyz/";
export const ACCESS_TOKEN_KEY = "bloan_access_token";

export class ApiError extends Error {
  statusCode: number;
  errorField?: string | null;
  serverMessage: string;
  rawDetails?: unknown;

  constructor(serverMessage: string, statusCode = 400, errorField?: string | null, rawDetails?: unknown) {
    super(serverMessage);
    this.name = "ApiError";
    this.serverMessage = serverMessage;
    this.statusCode = statusCode;
    this.errorField = errorField;
    this.rawDetails = rawDetails;
  }
}

export interface ApiResponse<T> {
  statusCode: number;
  error?: string | null;
  message: string;
  data: T;
}

interface RawBody {
  statusCode?: number;
  error?: string | null;
  message?: string | string[];
  data?: unknown;
}

const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY));

function buildHeaders(options: RequestInit) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const token = getToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function errorMessageOf(json: RawBody | null, text: string) {
  if (json) {
    if (Array.isArray(json.message) && json.message.length) return json.message.join(". ");
    if (typeof json.message === "string" && json.message.trim()) return json.message;
    if (json.error) return json.error;
  }
  return text || "Đã xảy ra lỗi, vui lòng thử lại sau.";
}

export interface RequestOptions extends RequestInit {
  /**
   * Hiện toast kết quả. Mặc định: bật cho POST/PUT/PATCH/DELETE (thành công lẫn thất bại), tắt cho GET.
   * Các API /auth tự hiển thị thông báo riêng nên mặc định tắt.
   */
  notify?: boolean;
  /** Request chạy ngầm (polling...): không tính vào trạng thái "đang tải dữ liệu" của trang. */
  background?: boolean;
}

/* ---------- Theo dõi request tải dữ liệu đang chạy (overlay chuyển trang chờ hết mới ẩn) ---------- */

let pendingLoads = 0;
const pendingListeners = new Set<(count: number) => void>();

const setPendingLoads = (delta: number) => {
  pendingLoads += delta;
  pendingListeners.forEach((listener) => listener(pendingLoads));
};

/** Số request GET (không chạy ngầm) đang chờ phản hồi. */
export const getPendingLoads = () => pendingLoads;

/** Lắng nghe thay đổi số request đang tải; trả về hàm hủy đăng ký. */
export function subscribePendingLoads(listener: (count: number) => void) {
  pendingListeners.add(listener);
  return () => {
    pendingListeners.delete(listener);
  };
}

const shouldNotify = (endpoint: string, method: string, notifyOption?: boolean) =>
  notifyOption ?? (method !== "GET" && !endpoint.startsWith("/api/v1/auth/"));

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { notify: notifyOption, background, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const withToast = typeof window !== "undefined" && shouldNotify(endpoint, method, notifyOption);
  const tracked = typeof window !== "undefined" && method === "GET" && !background;
  if (tracked) setPendingLoads(1);

  try {
    const response = await send<T>(endpoint, init);
    if (withToast) {
      const message = successMessage(method, response.message);
      notify.success(message, { id: `ok:${message}` });
    }
    return response;
  } catch (cause) {
    if (withToast && !init.signal?.aborted) {
      const error = cause instanceof ApiError ? cause : null;
      const message = error?.serverMessage ?? "Thao tác thất bại, vui lòng thử lại";
      notify.error(message, { id: `err:${message}`, description: error ? `HTTP ${error.statusCode}` : undefined });
    }
    throw cause;
  } finally {
    if (tracked) setPendingLoads(-1);
  }
}

async function send<T>(endpoint: string, init: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, { ...init, headers: buildHeaders(init) });
  } catch (cause) {
    // Request bị hủy chủ động (đổi trang / bộ lọc): giữ nguyên AbortError để nơi gọi bỏ qua
    if (init.signal?.aborted) throw cause;
    throw new ApiError(
      `Không thể kết nối đến máy chủ backend (${API_BASE_URL}). Vui lòng kiểm tra backend đang chạy.`,
      503,
      "Service Unavailable"
    );
  }

  const text = await res.text();
  let json: RawBody | null = null;
  try {
    json = text ? (JSON.parse(text) as RawBody) : null;
  } catch {
    // Response không phải JSON
  }

  if (!res.ok) {
    throw new ApiError(errorMessageOf(json, text), res.status, json?.error ?? null, json?.message ?? json);
  }

  return {
    statusCode: res.status,
    error: json?.error ?? null,
    message: typeof json?.message === "string" ? json.message : "Thực hiện thành công",
    data: (json && typeof json === "object" && "data" in json ? json.data : json) as T,
  };
}

type QueryValue = string | number | boolean | null | undefined;

/** Ghép query string, bỏ qua giá trị rỗng. */
export function withQuery(path: string, params?: Record<string, QueryValue>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

type CallOptions = Pick<RequestOptions, "notify" | "signal" | "background">;

/** Lỗi do request bị hủy bằng AbortController (không phải lỗi cần hiển thị). */
export const isAbortError = (cause: unknown) => cause instanceof DOMException && cause.name === "AbortError";

const jsonBody = (body?: unknown) => (body === undefined ? undefined : JSON.stringify(body));

export const http = {
  get: <T>(path: string, opts?: CallOptions) => request<T>(path, opts),
  post: <T>(path: string, body?: unknown, opts?: CallOptions) => request<T>(path, { method: "POST", body: jsonBody(body), ...opts }),
  put: <T>(path: string, body?: unknown, opts?: CallOptions) => request<T>(path, { method: "PUT", body: jsonBody(body), ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: CallOptions) => request<T>(path, { method: "PATCH", body: jsonBody(body), ...opts }),
  delete: <T = void>(path: string, opts?: CallOptions) => request<T>(path, { method: "DELETE", ...opts }),
};

/** Upload một tệp dạng multipart/form-data. */
export function uploadFile<T>(path: string, file: File, field = "file") {
  const formData = new FormData();
  formData.append(field, file);
  return request<T>(path, { method: "POST", body: formData });
}

export type Body = Record<string, unknown>;

/** Bộ hàm CRUD chuẩn cho một resource REST. */
export function crud<TItem, TBody = Body>(path: string) {
  return {
    list: () => http.get<TItem[]>(path),
    get: (id: number) => http.get<TItem>(`${path}/${id}`),
    create: (body: TBody) => http.post<TItem>(path, body),
    update: (id: number, body: TBody) => http.put<TItem>(`${path}/${id}`, body),
    remove: (id: number) => http.delete(`${path}/${id}`),
  };
}
