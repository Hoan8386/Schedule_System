/**
 * HTTP client dùng chung cho mọi module API.
 * - Tự gắn access token, Content-Type JSON (trừ FormData).
 * - Chuẩn hóa response { statusCode, error, message, data } của backend.
 * - Lỗi luôn được ném dưới dạng ApiError (kế thừa Error).
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: buildHeaders(options) });
  } catch {
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

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
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
