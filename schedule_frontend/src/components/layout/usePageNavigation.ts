"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

/** Thời gian hiển thị overlay tối thiểu để không bị nháy khi trang render nhanh. */
const MIN_OVERLAY_MS = 350;

/**
 * Chuyển trang trong layout (trang được chọn bằng state, không dùng router).
 * Overlay được bật và vẽ ra trước, sau đó trang mới mới được render trong transition,
 * nên người dùng thấy phản hồi ngay cả khi trang mới nặng.
 */
export function usePageNavigation(initialPage: string) {
  const [activePage, setActivePage] = useState(initialPage);
  const [navigating, setNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const activeRef = useRef(initialPage);
  const startedAt = useRef(0);

  const navigate = useCallback((page: string) => {
    if (page === activeRef.current) return;
    activeRef.current = page;
    startedAt.current = performance.now();
    setNavigating(true);
    // Hai lần requestAnimationFrame: chờ trình duyệt vẽ overlay rồi mới render trang mới.
    requestAnimationFrame(() => requestAnimationFrame(() => startTransition(() => setActivePage(page))));
  }, []);

  // Trang mới đã commit → giữ overlay cho đủ thời gian tối thiểu rồi ẩn.
  useEffect(() => {
    if (isPending || activePage !== activeRef.current) return;
    const remaining = Math.max(0, MIN_OVERLAY_MS - (performance.now() - startedAt.current));
    const timer = window.setTimeout(() => setNavigating(false), remaining);
    return () => window.clearTimeout(timer);
  }, [activePage, isPending]);

  return { activePage, navigate, navigating };
}
