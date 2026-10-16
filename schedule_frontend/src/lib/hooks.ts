import { useEffect } from "react";

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
