/**
 * Thông báo toast dùng chung (thư viện react-toastify). Dùng được ở mọi nơi, kể cả ngoài component:
 *   notify.success("Đã lưu"); notify.error("Lỗi"); notify.info("..."); notify.warning("...")
 * ToastContainer được gắn một lần trong ToastProvider (src/context/ToastContext.tsx).
 */
import React from "react";
import { toast } from "react-toastify";

export type ToastType = "success" | "error" | "warning" | "info";

interface NotifyOptions {
  /** Dòng phụ nhỏ dưới nội dung (vd. "HTTP 400") */
  description?: string;
  /** Toast cùng id không hiện chồng lên nhau (vd. nhiều request giống nhau chạy song song). */
  id?: string;
}

function show(type: ToastType, message: string, extra?: string | NotifyOptions) {
  const { description, id } = typeof extra === "string" ? { description: extra, id: undefined } : extra ?? {};
  if (id && toast.isActive(id)) return id;
  const content = description
    ? React.createElement(
        "div",
        null,
        React.createElement("p", { className: "font-semibold" }, message),
        React.createElement("p", { className: "mt-0.5 text-xs opacity-70" }, description)
      )
    : message;
  return toast[type](content, { toastId: id });
}

export const notify = {
  success: (message: string, extra?: string | NotifyOptions) => show("success", message, extra),
  error: (message: string, extra?: string | NotifyOptions) => show("error", message, extra),
  warning: (message: string, extra?: string | NotifyOptions) => show("warning", message, extra),
  info: (message: string, extra?: string | NotifyOptions) => show("info", message, extra),
  show: (message: string, type: ToastType = "info", extra?: string | NotifyOptions) => show(type, message, extra),
};

const SUCCESS_BY_METHOD: Record<string, string> = {
  POST: "Tạo mới thành công",
  PUT: "Cập nhật thành công",
  PATCH: "Cập nhật thành công",
  DELETE: "Xóa thành công",
};

/**
 * Câu thông báo thành công từ message của API (vd. "Cập nhật dữ liệu" → "Cập nhật dữ liệu thành công").
 * Không có message (vd. 204 No Content) thì dùng câu mặc định theo phương thức HTTP.
 */
export function successMessage(method: string, apiMessage?: string | null) {
  const message = apiMessage?.trim();
  if (!message || message === "Thực hiện thành công") return SUCCESS_BY_METHOD[method] ?? "Thực hiện thành công";
  return /thành công|success/i.test(message) ? message : `${message} thành công`;
}
