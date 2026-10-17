"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import { notify, type ToastType } from "@/lib/toast";

/** Gắn vùng hiển thị toast (react-toastify) cho toàn ứng dụng. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer position="top-right" autoClose={4000} newestOnTop closeOnClick pauseOnHover theme="colored" limit={5} />
    </>
  );
}

/** Giữ API cũ `showToast(message, type, statusCode)` cho các form đang dùng. */
export function useToast() {
  return {
    showToast: (message: string, type: ToastType = "info", statusCode?: number) =>
      notify.show(message, type, statusCode && type === "error" ? `HTTP ${statusCode}` : undefined),
  };
}
