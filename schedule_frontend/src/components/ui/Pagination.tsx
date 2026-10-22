import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/lib/api";
import { cn } from "@/lib/cn";

/** Các số trang hiển thị quanh trang hiện tại; 0 = dấu "…". */
function pageNumbers(page: number, pages: number) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const around = [page - 1, page, page + 1].filter((value) => value > 1 && value < pages);
  const result = [1];
  if (around[0] > 2) result.push(0);
  result.push(...around);
  if (around[around.length - 1] < pages - 1) result.push(0);
  result.push(pages);
  return result;
}

interface Props {
  meta: PageMeta | null;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

/** Thanh phân trang dùng chung cho danh sách phân trang tại backend (page bắt đầu từ 1). */
export function Pagination({ meta, onPageChange, disabled, className }: Props) {
  if (!meta || meta.total === 0) return null;
  const { page, pageSize, pages, total } = meta;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const go = (next: number) => !disabled && next >= 1 && next <= pages && next !== page && onPageChange(next);

  return (
    <div className={cn("flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs sm:flex-row", className)}>
      <span className="text-slate-500">
        Hiển thị <b className="text-slate-700">{from}–{to}</b> / {total} bản ghi
      </span>
      {pages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Phân trang">
          <button type="button" className="btn-icon text-slate-600 hover:bg-slate-100 disabled:opacity-40" onClick={() => go(page - 1)} disabled={disabled || page <= 1} aria-label="Trang trước">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageNumbers(page, pages).map((value, index) =>
            value === 0 ? (
              <span key={`gap-${index}`} className="px-1 text-slate-400">…</span>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => go(value)}
                disabled={disabled}
                aria-current={value === page ? "page" : undefined}
                className={cn(
                  "min-w-8 rounded-lg px-2 py-1.5 font-bold transition-colors",
                  value === page ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {value}
              </button>
            )
          )}
          <button type="button" className="btn-icon text-slate-600 hover:bg-slate-100 disabled:opacity-40" onClick={() => go(page + 1)} disabled={disabled || page >= pages} aria-label="Trang sau">
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
