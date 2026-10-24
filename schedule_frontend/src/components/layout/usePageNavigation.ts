"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { getPendingLoads, subscribePendingLoads } from "@/lib/api/http";

/** Thời gian hiển thị overlay tối thiểu để không bị nháy khi trang render nhanh. */
const MIN_OVERLAY_MS = 350;
/** Không còn request nào trong khoảng này mới coi là tải xong (bắt cả request gọi nối tiếp). */
const IDLE_MS = 200;
/** Giới hạn an toàn: request treo / quá chậm thì vẫn ẩn overlay. */
const MAX_OVERLAY_MS = 15000;

/**
 * Chuyển trang trong layout (trang được chọn bằng state, không dùng router).
 * Overlay được bật và vẽ ra trước, sau đó trang mới mới được render trong transition,
 * và chỉ ẩn khi trang đã render xong VÀ mọi request tải dữ liệu (GET) của trang đã hoàn tất.
 * Áp dụng cả lần vào trang đầu tiên.
 */
export function usePageNavigation(initialPage: string) {
  const [activePage, setActivePage] = useState(initialPage);
  const [navigating, setNavigating] = useState(true);
  const [isPending, startTransition] = useTransition();
  const activeRef = useRef(initialPage);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const navigate = useCallback((page: string) => {
    if (page === activeRef.current) return;
    activeRef.current = page;
    startedAt.current = performance.now();
    setNavigating(true);
    // Hai lần requestAnimationFrame: chờ trình duyệt vẽ overlay rồi mới render trang mới.
    requestAnimationFrame(() => requestAnimationFrame(() => startTransition(() => setActivePage(page))));
  }, []);

  // Trang mới đã commit (effect của trang con đã chạy và gửi request) → chờ mạng rảnh rồi mới ẩn overlay.
  useEffect(() => {
    if (!navigating || isPending || activePage !== activeRef.current) return;
    let idleTimer: number | undefined;

    const scheduleHide = () => {
      window.clearTimeout(idleTimer);
      if (getPendingLoads() > 0) return;
      const remaining = Math.max(IDLE_MS, MIN_OVERLAY_MS - (performance.now() - startedAt.current));
      idleTimer = window.setTimeout(() => {
        if (getPendingLoads() === 0) setNavigating(false);
      }, remaining);
    };

    const unsubscribe = subscribePendingLoads(scheduleHide);
    scheduleHide();
    const maxTimer = window.setTimeout(
      () => setNavigating(false),
      Math.max(0, MAX_OVERLAY_MS - (performance.now() - startedAt.current))
    );

    return () => {
      unsubscribe();
      window.clearTimeout(idleTimer);
      window.clearTimeout(maxTimer);
    };
  }, [activePage, isPending, navigating]);

  return { activePage, navigate, navigating };
}
