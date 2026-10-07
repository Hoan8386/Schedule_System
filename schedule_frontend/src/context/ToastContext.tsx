"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  statusCode?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    statusCode?: number
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "info",
      statusCode?: number
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, message, statusCode };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast floating notifications container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3 text-sm ${
                isSuccess
                  ? "bg-emerald-950/95 text-emerald-100 border-emerald-800 shadow-emerald-950/20"
                  : isError
                  ? "bg-rose-950/95 text-rose-100 border-rose-800 shadow-rose-950/20"
                  : isWarning
                  ? "bg-amber-950/95 text-amber-100 border-amber-800 shadow-amber-950/20"
                  : "bg-slate-900/95 text-slate-100 border-slate-700 shadow-slate-950/20"
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <Info className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info className="w-5 h-5 text-sky-400" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {isSuccess
                      ? "Thành công"
                      : isError
                      ? "Lỗi phản hồi"
                      : isWarning
                      ? "Cảnh báo"
                      : "Thông báo"}
                  </span>
                  {toast.statusCode && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                        isSuccess
                          ? "bg-emerald-800/80 text-emerald-200"
                          : isError
                          ? "bg-rose-800/80 text-rose-200"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      HTTP {toast.statusCode}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed break-words font-medium">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
