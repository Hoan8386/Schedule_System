"use client";

import React, { useCallback, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ConfirmOptions {
  title: React.ReactNode;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger: nút xác nhận màu đỏ + biểu tượng cảnh báo */
  tone?: "primary" | "danger";
}

interface Pending extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

/**
 * Popup xác nhận dạng Promise: `if (!(await confirm({...}))) return;`.
 * Đặt `dialog` ở bất kỳ đâu trong cây JSX của component; hiển thị chồng lên các modal khác.
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        pendingRef.current?.resolve(false);
        const next = { ...options, resolve };
        pendingRef.current = next;
        setPending(next);
      }),
    []
  );

  const close = (ok: boolean) => {
    pendingRef.current?.resolve(ok);
    pendingRef.current = null;
    setPending(null);
  };

  const Icon = pending?.tone === "danger" ? AlertTriangle : HelpCircle;
  const dialog = pending ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-3 sm:p-4" role="alertdialog" aria-modal="true" onClick={() => close(false)}>
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-surface p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              pending.tone === "danger" ? "bg-rose-100 text-rose-600" : "bg-brand-100 text-brand-700"
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <h3 className="text-sm font-black text-slate-800">{pending.title}</h3>
            <div className="text-xs leading-relaxed text-slate-600">{pending.message}</div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => close(false)} className="btn btn-secondary btn-sm">
            {pending.cancelLabel ?? "Hủy"}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => close(true)}
            className={cn("btn btn-sm", pending.tone === "danger" ? "btn-danger" : "btn-primary")}
          >
            {pending.confirmLabel ?? "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
