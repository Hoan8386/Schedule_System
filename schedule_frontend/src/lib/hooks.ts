import { useCallback, useEffect, useState } from "react";
import { isAbortError, type ApiResponse } from "@/lib/api/http";
import type { PageMeta, PageResult } from "@/lib/api/types/page.types";

/**
 * Gọi hàm tải dữ liệu một lần sau khi component mount.
 * Trì hoãn một nhịp (setTimeout 0) để hàm load được phép setState (loading, error...)
 * mà không vi phạm quy tắc react-hooks/set-state-in-effect.
 */
export function useInitialLoad(load: () => unknown) {
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
    // Chỉ chạy một lần khi mount; load có thể đổi tham chiếu mỗi lần render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Giá trị chỉ cập nhật sau khi ngừng thay đổi delay ms (ô tìm kiếm không gọi API theo từng phím). */
export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export type PageFetcher<T, S> = (page: number, signal: AbortSignal) => Promise<ApiResponse<PageResult<T, S>>>;

/**
 * Danh sách phân trang tại backend.
 * - fetchPage nên được bọc useCallback theo bộ lọc: đổi bộ lọc (đổi tham chiếu) thì quay về trang 1.
 * - Request cũ bị hủy khi đổi trang / bộ lọc liên tục, kết quả trễ không ghi đè kết quả mới.
 * - Trang hiện tại vượt quá tổng số trang (vd. vừa xóa bản ghi cuối của trang) thì lùi về trang cuối.
 */
export function usePagedList<T, S>(fetchPage: PageFetcher<T, S>) {
  const [cursor, setCursor] = useState({ fetchPage, page: 1 });
  const page = cursor.fetchPage === fetchPage ? cursor.page : 1;
  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<{ items: T[]; meta: PageMeta | null; summary: S | null }>({ items: [], meta: null, summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const { data: result } = await fetchPage(page, controller.signal);
        if (result.meta.pages > 0 && page > result.meta.pages) {
          setCursor({ fetchPage, page: result.meta.pages });
          return;
        }
        setData({ items: result.result ?? [], meta: result.meta, summary: result.summary ?? null });
      } catch (cause) {
        if (isAbortError(cause)) return;
        setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fetchPage, page, reloadToken]);

  const setPage = useCallback((next: number) => setCursor({ fetchPage, page: next }), [fetchPage]);
  const reload = useCallback(() => setReloadToken((value) => value + 1), []);

  return { ...data, page, setPage, loading, error, setError, reload };
}
